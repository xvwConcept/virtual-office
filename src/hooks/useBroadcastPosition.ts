import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useOfficeStore } from '../stores/officeStore';

const THROTTLE_MS = 200;

export function useBroadcastPosition() {
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const lastSentRef   = useRef<number>(0);
  const pendingRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (col: number, row: number) => {
      if (!currentUserId) return;

      const send = () => {
        lastSentRef.current = Date.now();
        supabase
          .from('positions')
          .upsert(
            { user_id: currentUserId, col, row, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
      };

      if (pendingRef.current) clearTimeout(pendingRef.current);

      const elapsed = Date.now() - lastSentRef.current;
      if (elapsed >= THROTTLE_MS) {
        send(); // leading edge — fire immediately
      } else {
        // trailing edge — send at end of current interval
        pendingRef.current = setTimeout(send, THROTTLE_MS - elapsed);
      }
    },
    [currentUserId]
  );
}
