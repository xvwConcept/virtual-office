---
phase: virtual-office-code-review
reviewed: 2026-05-15T00:00:00Z
depth: deep
files_reviewed: 10
files_reviewed_list:
  - src/App.tsx
  - src/stores/officeStore.ts
  - src/hooks/useAvatarMovement.ts
  - src/hooks/useBroadcastPosition.ts
  - src/hooks/usePositions.ts
  - src/hooks/useRealtimeStatus.ts
  - src/components/Office/OfficeView.tsx
  - src/components/StatusBar/StatusBar.tsx
  - src/components/UI/Login.tsx
  - src/components/UI/ToastStack.tsx
findings:
  critical: 4
  warning: 7
  info: 3
  total: 14
status: issues_found
---

# Code Review — Virtual Office

**Reviewed:** 2026-05-15  
**Depth:** deep (cross-file)  
**Files Reviewed:** 10  
**Status:** issues_found

## Summary

The core architecture is sound: Zustand for local state, Supabase Realtime for push updates, `getState()` inside event handlers to avoid stale closures. However, several meaningful bugs and security gaps were found that will cause observable misbehaviour in production — most critically an unauthenticated Realtime write path, a throttle implementation that silently drops the final position on fast movement, and a toast auto-dismiss that resets on every new toast (potentially leaving toasts on-screen indefinitely under load).

---

## Critical Issues

### CR-01: Realtime position writes are not validated against the authenticated user

**File:** `src/hooks/useBroadcastPosition.ts:14-19`  
**Issue:** The `upsert` into `positions` sends `user_id: currentUserId` from client state. If Row Level Security is not enforced on the `positions` table (no migration enforces it, and none is shown), any authenticated user can upsert any `user_id` they choose — moving another user's avatar. Even with RLS, the `user_id` value is supplied by the client; the policy must explicitly check `auth.uid() = user_id`. This is a client-side trust problem: the server should derive `user_id` from `auth.uid()` or enforce it via policy.

**Fix:** Add an RLS policy to the `positions` table (and `statuses` table for the same reason):
```sql
-- positions: only the owner can write their own row
create policy "positions: owner writes"
  on public.positions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
The same pattern is needed on `statuses`. The client code does not need to change; the database must enforce it.

---

### CR-02: Throttle in `useBroadcastPosition` drops the last position on fast movement

**File:** `src/hooks/useBroadcastPosition.ts:12-18`  
**Issue:** The debounce clears `timerRef.current` on every keypress and reschedules 200 ms later. If a user presses keys rapidly for longer than 200 ms and then stops, the *last* scheduled timer fires correctly. However, the `currentUserId` captured in the `useCallback` closure is correct. The real bug: the timer is a **debounce** (fires 200 ms after the *last* event), not a throttle (fires at most every 200 ms). The comment and variable name suggest throttle intent. With debounce, if the user holds an arrow key down (firing ~every 16 ms), the write is deferred until 200 ms after they stop — so remote users see no movement during the entire key-hold, then a teleport jump at the end.

**Fix:** Replace with a leading-edge throttle:
```ts
return useCallback((col: number, row: number) => {
  if (!currentUserId) return;
  if (timerRef.current) return;           // already scheduled → skip
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
  }, 200);
  supabase.from('positions').upsert(
    { user_id: currentUserId, col, row, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
}, [currentUserId]);
```

---

### CR-03: Toast auto-dismiss timer resets on every new toast, potentially leaving older toasts undismissed

**File:** `src/components/UI/ToastStack.tsx:11-16`  
**Issue:** The `useEffect` runs whenever `toasts` changes. It picks only `toasts[toasts.length - 1]` (the newest) and schedules its removal. When a second toast arrives before the first 3200 ms elapses, the effect re-runs: the previous timer is cleared and a new 3200 ms timer is set for the *newest* toast. The *previous* toast now has no timer and will never be auto-dismissed — it will persist until it is pushed off the visible slice of 4, or until the user navigates away. In a busy team, rapid status changes can accumulate permanently-visible stale toasts.

**Fix:** Give every toast its own timer, keyed by toast id:
```tsx
useEffect(() => {
  if (toasts.length === 0) return;
  const timers = toasts.map((t) =>
    setTimeout(() => removeToast(t.id), 3200)
  );
  return () => timers.forEach(clearTimeout);
}, [toasts.map((t) => t.id).join(','), removeToast]);
// or, more idiomatically, move the timer into the addToast action itself
```

---

### CR-04: `usePositions` ignores DELETE events — deleted positions persist in the store forever

**File:** `src/hooks/usePositions.ts:19-22`  
**Issue:** The Realtime subscription listens for `event: '*'` (INSERT, UPDATE, DELETE). The handler casts `payload.new` unconditionally; for a DELETE event `payload.new` is `{}` (empty object), so `row?.user_id` is `undefined` and the upsert is silently skipped. The deleted row's position is never removed from the store. If a user's row is ever deleted from `positions` (e.g., a cleanup job, or logout hook), their avatar remains frozen on-screen for all other clients until they refresh.

**Fix:**
```ts
(payload) => {
  if (payload.eventType === 'DELETE') {
    const old = payload.old as { user_id?: string };
    if (old?.user_id) {
      useOfficeStore.getState().removePosition(old.user_id);
    }
    return;
  }
  const row = payload.new as { user_id: string; col: number; row: number } | null;
  if (row?.user_id) upsertPosition(row);
}
```
Add `removePosition` to the store:
```ts
removePosition: (userId) =>
  set((s) => {
    const next = { ...s.positions };
    delete next[userId];
    return { positions: next };
  }),
```

---

## Warnings

### WR-01: `setPulsing` uses a raw `setTimeout` inside a Zustand action — leaks on unmount

**File:** `src/stores/officeStore.ts:60-70`  
**Issue:** `setPulsing` schedules a `setTimeout` directly inside a Zustand action (outside any React component lifecycle). There is no way to cancel this timer. If the app unmounts or the user logs out before the 700 ms elapses, the callback will still fire and attempt to update the store. While unlikely to crash (Zustand stores persist beyond unmount), it is an uncontrolled side-effect in a store and makes testing impossible.

**Fix:** Move the pulse-clear logic into the component that needs it (e.g., inside `useRealtimeStatus`) where it can be cleaned up in a `useEffect` return, or store the timer handle and clear it if `setPulsing` is called again for the same user.

---

### WR-02: `useRealtimeStatus` triggers toasts for own-user status changes from other tabs

**File:** `src/hooks/useRealtimeStatus.ts:25`  
**Issue:** The guard `row.user_id !== currentUserId` is read via `useOfficeStore.getState()` at event time, which is correct. However, this check only suppresses the toast; it does **not** suppress the avatar pulse (`setPulsing`). If the current user changes their own status (from StatusBar), the Realtime event echoes back, hits `upsertStatus`, and — if the guard matched — skips toast and pulse. That part is fine. But if `currentUserId` is momentarily `null` (e.g., during logout/re-auth), `row.user_id !== null` is `true`, so the user gets a toast about their own status change.

**Fix:** Add a null-check:
```ts
if (prev && prev !== next && currentUserId && row.user_id !== currentUserId) {
```

---

### WR-03: `useAvatarMovement` status auto-transition does not account for `dnd` — walking off a break tile resets DND to `online`

**File:** `src/hooks/useAvatarMovement.ts:44-48`  
**Issue:** The logic for returning to the desk (`tile === 'C' && nr === mySeatRow && nc === mySeatCol`) calls `updateStatus('online')` only if `currentStatus === 'pause'`. That is correct. But if the user is `dnd` and walks to the break zone, `currentStatus !== 'pause'` so nothing happens on break-zone entry. If they then walk back to their seat while `dnd`, the condition `currentStatus === 'pause'` is false — good, it won't overwrite DND. This path is fine. The actual problem: a user who is `offline` (manually set) and then walks to the break zone will be auto-promoted to `pause`, which is surprising and unintended.

**Fix:** Guard the break-zone auto-status against `offline` and `dnd`:
```ts
if (BREAK_ZONE_TILES.has(tile)) {
  if (currentStatus === 'online') updateStatus('pause');
} else if (tile === 'C' && nr === mySeatRow && nc === mySeatCol) {
  if (currentStatus === 'pause') updateStatus('online');
}
```

---

### WR-04: `usePositions` initial fetch has no error handling

**File:** `src/hooks/usePositions.ts:10-12`  
**Issue:** The `.then(({ data }) => ...)` call destructures only `data` and ignores `error`. If the fetch fails (network error, RLS denial), `data` is `null`, the `if (data)` guard silently swallows the failure, and positions remain empty with no user feedback. The Realtime subscription is still set up, so the UI shows no positions for any remote users.

**Fix:**
```ts
supabase.from('positions').select('user_id, col, row').then(({ data, error }) => {
  if (error) { console.error('positions fetch failed:', error.message); return; }
  if (data) setPositions(data as { user_id: string; col: number; row: number }[]);
});
```

---

### WR-05: `OfficeView` recomputes seat data and avatar positions on every render with O(n²) lookups

**File:** `src/components/Office/OfficeView.tsx:86-93`, `113-114`  
**Issue:** Inside the render function, `Object.values(users).find(u => u.desk_position === deskPosition)` is called once per seat (line 88), and `SEATS.find(s => s.row === r && s.col === c)` / `SEATS.find(s => s.col === c && s.row === r + 1)` are called for every tile in the grid (lines 113-114). With 300 tiles and 6+ seats this is not a performance crisis, but the tile-loop seat lookup is done inside the render hot path and will scale poorly if the map grows. More critically: `seatData` is recreated as a new object reference every render, so anything downstream that compares references will always see it as changed.

**Note:** Flagged as Warning rather than Info because the `seatData` object being recreated every render also means `lampOnCols` (a new `Set`) is recreated every render, touching every avatar's `<g>` element unnecessarily.

**Fix:** Memoize `seatData` and `lampOnCols` with `useMemo`, and build an O(1) lookup map for seat-by-row-col once (similar to how `SEAT_BY_DESK` is computed at module load).

---

### WR-06: `useAuth` `ready` flag races with `onAuthStateChange` — brief double-render with wrong state

**File:** `src/hooks/useAuth.ts:10-17`  
**Issue:** `getSession()` is called, then `setReady(true)` is called in its `.then()`. The `onAuthStateChange` listener is registered in the same `useEffect` synchronously, so it can fire before the `getSession` promise resolves (e.g., if Supabase emits `INITIAL_SESSION` synchronously or near-synchronously). In that case `setCurrentUserId` is called twice with potentially conflicting values before `ready` becomes `true`. The result is harmless in practice (last write wins, and `ready` is still false during the loading spinner), but the ordering is fragile.

**Fix:** Set `ready` only after both `getSession` settles and the initial auth state is reconciled, or rely exclusively on `onAuthStateChange` for session state and use `getSession` only to prime before the listener fires.

---

### WR-07: `addToast` silently discards older toasts with a lossy slice

**File:** `src/stores/officeStore.ts:71-73`  
**Issue:** `toasts: [...s.toasts.slice(-3), toast]` keeps the last 3 existing toasts plus the new one, so the cap is 4. But `toasts.slice(-3)` silently drops any toast beyond position 3 without dismissal — those toasts never get a `removeToast` call and their `setTimeout` (from `ToastStack`) was already cleared (see CR-03). Combined with CR-03, this creates a category of toasts that exist in neither the store nor with a running timer.

**Fix:** The correct cap should be consistent with the `slice(-4)` in `ToastStack`. More importantly, when a toast is evicted by the cap, it should be treated as dismissed (no action needed since it is dropped from the array, but the `slice(-3)` vs `slice(-4)` inconsistency in `ToastStack` means the 4th toast can appear in the UI but has no dismiss timer).

Align the store cap with the UI slice:
```ts
addToast: (toast) =>
  set((s) => ({ toasts: [...s.toasts.slice(-4), toast] })),
```
And resolve CR-03 so every visible toast has its own timer.

---

## Info

### IN-01: `Login.tsx` imports `signInWithPassword` — CLAUDE.md specifies magic-link auth

**File:** `src/components/UI/Login.tsx:49-51`  
**Issue:** `CLAUDE.md` documents "Magic Link login — Auth uses Supabase email magic links, not passwords." The current `Login` component uses `signInWithPassword` with an email + password form. The `useAuth` hook exposes `signInWithPassword` but no `sendMagicLink`/`signInWithOtp` function. This may be an intentional change to the design, but it conflicts with the documented architecture and the onboarding documentation teammates will read.

**Fix:** If password auth is now intentional, update `CLAUDE.md` to reflect the change. If magic-link is still the goal, replace the password field with a magic-link flow using `supabase.auth.signInWithOtp({ email })`.

---

### IN-02: Dead export `Desk` interface and `DESK_COUNT` constant in `types/index.ts`

**File:** `src/types/index.ts:19-23`, `41`  
**Issue:** `interface Desk` and `DESK_COUNT = 6` are exported but not imported anywhere in the reviewed files. `DESK_COUNT` is also inaccurate — the map has 6 chair tiles (`C`), which matches, but this constant is not used to validate or derive anything. Dead exports add noise and can mislead future contributors.

**Fix:** Remove `Desk` and `DESK_COUNT` if not used, or add a comment explaining where they are intended to be consumed.

---

### IN-03: `useRealtimeStatus` uses `payload.old` as fallback for DELETE events but `Status` type requires `id`

**File:** `src/hooks/useRealtimeStatus.ts:16`  
**Issue:** `(payload.new ?? payload.old) as Status | undefined` — for a DELETE event, `payload.new` is `{}` (truthy), so the fallback to `payload.old` never triggers. The current subscription only listens on `statuses`, and DELETE events on `statuses` would be unusual, but the intent is to handle them. The `??` nullish-coalescing operator will not fall through on `{}` since `{}` is not `null`/`undefined`.

**Fix:** Either explicitly handle `payload.eventType === 'DELETE'` (using `payload.old`), or document that DELETE events are intentionally ignored for the `statuses` table.

---

_Reviewed: 2026-05-15_  
_Reviewer: Claude (adversarial code review)_  
_Depth: deep_
