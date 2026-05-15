import { useEffect, useMemo } from 'react';
import { useFitScale } from '../../hooks/useFitScale';
import { useUsers } from '../../hooks/useUsers';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';
import { usePositions } from '../../hooks/usePositions';
import { useAvatarMovement } from '../../hooks/useAvatarMovement';
import { useOfficeStore } from '../../stores/officeStore';
import type { StatusValue, User } from '../../types';
import { TILE, GRID_COLS, GRID_ROWS, SPRITE_RES, C, STATUS_META, DESK_VISUALS, type DesignStatus } from './officeTokens';
import { OFFICE_MAP } from './officeMap';
import { getRoomMap, ROOM_META, isWarpTile } from './rooms';
import {
  Floor, WallTop, WallSide, WallSolid, Window, Door, WallArt,
  DeskTop, DeskBottom, ChairBack, Avatar,
  Plant, MeetTableTop, MeetTableBot, MeetChair,
  KitchenCounter, KitchenAppliance, CouchLeft, CouchRight, Rug,
} from './sprites';

const toDesign: Record<StatusValue, DesignStatus> = {
  online:  'active',
  pause:   'break',
  dnd:     'dnd',
  offline: 'away',
};

const floorVariant = (r: number, c: number): 'A' | 'B' =>
  (r + c) % 2 === 0 ? 'A' : 'B';

// Compute seat positions once (OFFICE_MAP is a module constant).
const SEATS: { row: number; col: number; deskPosition: number }[] = [];
(() => {
  let idx = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (OFFICE_MAP[r]?.[c] === 'C') {
        SEATS.push({ row: r, col: c, deskPosition: idx + 1 });
        idx++;
      }
    }
  }
})();

// O(1) lookups keyed at module level (OFFICE_MAP is a constant)
const SEAT_BY_DESK = Object.fromEntries(SEATS.map((s) => [s.deskPosition, s]));
const SEAT_AT_TILE = Object.fromEntries(SEATS.map((s) => [`${s.row}-${s.col}`, s]));

export function OfficeView() {
  const { loading, error } = useUsers();
  useRealtimeStatus();
  usePositions();

  const users         = useOfficeStore((s) => s.users);
  const statuses      = useOfficeStore((s) => s.statuses);
  const currentUserId = useOfficeStore((s) => s.currentUserId);
  const avatarPos     = useOfficeStore((s) => s.avatarPos);
  const setAvatarPos  = useOfficeStore((s) => s.setAvatarPos);
  const positions     = useOfficeStore((s) => s.positions);
  const pulsingUsers      = useOfficeStore((s) => s.pulsingUsers);
  const currentRoom       = useOfficeStore((s) => s.currentRoom);
  const roomTransitioning = useOfficeStore((s) => s.roomTransitioning);

  const currentUser = currentUserId ? users[currentUserId] : null;
  const inOffice = currentRoom === 'office';
  const roomMap = getRoomMap(currentRoom);
  const roomMeta = ROOM_META[currentRoom];
  const mySeat = currentUser ? (SEAT_BY_DESK[currentUser.desk_position] ?? null) : null;

  // Place avatar at own desk on first load (before broadcast exists).
  useEffect(() => {
    if (inOffice && mySeat && !avatarPos) {
      setAvatarPos({ row: mySeat.row, col: mySeat.col });
    }
  }, [inOffice, mySeat?.row, mySeat?.col, avatarPos, setAvatarPos]);

  useAvatarMovement(mySeat?.row ?? null, mySeat?.col ?? null);

  // Memoize per-seat design status — must run before any early return (Rules of Hooks)
  const seatData = useMemo(() => {
    const userByDesk: Record<number, User> = {};
    for (const u of Object.values(users)) userByDesk[u.desk_position] = u;
    return Object.fromEntries(
      SEATS.map(({ deskPosition }) => {
        const user = userByDesk[deskPosition];
        const rawStatus = user ? statuses[user.id]?.status ?? 'offline' : 'offline';
        const designStatus = toDesign[rawStatus as StatusValue] ?? 'away';
        return [deskPosition, { user, designStatus }];
      })
    );
  }, [users, statuses]);

  const lampOnCols = useMemo(() => new Set(
    SEATS.filter(({ deskPosition }) => {
      const ds = seatData[deskPosition]?.designStatus;
      return ds === 'active' || ds === 'dnd';
    }).map(({ col }) => col)
  ), [seatData]);

  const W    = GRID_COLS * SPRITE_RES;
  const H    = GRID_ROWS * SPRITE_RES;
  const CSSW = GRID_COLS * TILE;
  const CSSH = GRID_ROWS * TILE;
  const FRAME_PAD = 24;
  const frameW = CSSW + FRAME_PAD;
  const frameH = CSSH + FRAME_PAD;
  const { ref: viewportRef, scale } = useFitScale(frameW, frameH);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: C.bgDeep, color: C.ink, fontFamily: 'ui-monospace, monospace' }}>
      Lade Büro …
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: C.bgDeep, color: '#ef476f', fontFamily: 'ui-monospace, monospace' }}>
      Fehler: {error}
    </div>
  );

  // Render static tiles (no avatars — rendered as a separate floating layer below)
  let artCount = 0;
  const tiles: React.ReactNode[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const code = roomMap[r]?.[c] ?? '.';
      const key  = `${r}-${c}`;
      const tx   = c * SPRITE_RES;
      const ty   = r * SPRITE_RES;

      const seat      = SEAT_AT_TILE[`${r}-${c}`];
      const seatBelow = SEAT_AT_TILE[`${r + 1}-${c}`];

      let content: React.ReactNode = null;
      switch (code) {
        case '=': content = <WallTop />; break;
        case '|': content = <WallSide />; break;
        case '#': content = <WallSolid />; break;
        case 'W': content = <Window />; break;
        case 'A': content = <WallArt variant={artCount++} />; break;
        case '/': content = <Door />; break;
        case 'D': content = <DeskTop lampOn={inOffice && lampOnCols.has(c)} />; break;
        case 'd': {
          const ds = seatBelow ? seatData[seatBelow.deskPosition]?.designStatus : null;
          content = <DeskBottom status={ds} />;
          break;
        }
        case 'C': {
          const ds = seat ? seatData[seat.deskPosition]?.designStatus : null;
          content = (
            <g>
              <Floor variant={floorVariant(r, c)} />
              <ChairBack status={ds} />
            </g>
          );
          break;
        }
        case 'P': content = <Plant />; break;
        case 'T': content = <MeetTableTop />; break;
        case 't': content = <MeetTableBot />; break;
        case 'c': content = <MeetChair />; break;
        case 'K': content = <KitchenCounter />; break;
        case 'k': content = <KitchenAppliance />; break;
        case 'L': content = <CouchLeft />; break;
        case 'l': content = <CouchRight />; break;
        case 'R': content = <Rug />; break;
        default:  content = <Floor variant={floorVariant(r, c)} />; break;
      }

      tiles.push(<g key={key} transform={`translate(${tx} ${ty})`}>{content}</g>);
    }
  }

  const visibleUsers = inOffice
    ? Object.values(users)
    : currentUser ? [currentUser] : [];

  const avatarEls: React.ReactNode[] = visibleUsers.map((user) => {
    const visual = DESK_VISUALS[user.desk_position];
    if (!visual) return null;

    const rawStatus = statuses[user.id]?.status ?? 'offline';
    const designStatus = toDesign[rawStatus as StatusValue] ?? 'away';
    const pulsing = !!pulsingUsers[user.id];

    let pos: { col: number; row: number };
    if (user.id === currentUserId && avatarPos) {
      pos = { col: avatarPos.col, row: avatarPos.row };
    } else {
      pos = positions[user.id] ?? (
        SEAT_BY_DESK[user.desk_position]
          ? { col: SEAT_BY_DESK[user.desk_position].col, row: SEAT_BY_DESK[user.desk_position].row }
          : null
      );
    }

    if (!pos) return null;

    return (
      <g
        key={user.id}
        transform={`translate(${pos.col * SPRITE_RES} ${pos.row * SPRITE_RES})`}
        style={{
          transition: user.id === currentUserId ? 'transform 70ms linear' : 'transform 220ms linear',
        }}
        className={pulsing ? 'avatar-pulse' : undefined}
      >
        <Avatar visual={visual} status={designStatus} />
      </g>
    );
  });

  // Status summary
  const designStatuses = Object.values(seatData).map((d) => d.designStatus);
  const summary = (['active', 'break', 'dnd', 'away'] as DesignStatus[]).map((k) => ({
    k,
    n: designStatuses.filter((s) => s === k).length,
    ...STATUS_META[k],
  }));

  return (
    <div ref={viewportRef} className="office-viewport">
      <div
        style={{
          width: frameW * scale,
          height: frameH * scale,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: frameW,
            height: frameH,
          }}
        >
          <div
            className={roomTransitioning ? 'room-warp' : undefined}
            style={{
              padding: 12, background: C.bgFrame,
              boxShadow: `inset 0 0 0 4px ${C.bgDeep}`,
            }}
          >
            <div style={{ position: 'relative', width: CSSW, height: CSSH }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width={CSSW}
              height={CSSH}
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block', background: C.bgDeep }}
            >
              <defs>
                <radialGradient id="vig" cx="50%" cy="50%" r="70%">
                  <stop offset="60%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
                </radialGradient>
              </defs>

              {tiles}

              {inOffice && (
                <>
                  <rect x={10 * SPRITE_RES} y={12 * SPRITE_RES} width={4 * SPRITE_RES} height={2 * SPRITE_RES}
                    fill={C.statusBreak} fillOpacity={0.08} />
                  <rect x={15 * SPRITE_RES} y={12 * SPRITE_RES} width={4 * SPRITE_RES} height={2 * SPRITE_RES}
                    fill={C.statusBreak} fillOpacity={0.08} />
                </>
              )}

              {!inOffice && Array.from({ length: GRID_ROWS }, (_, r) =>
                Array.from({ length: GRID_COLS }, (_, c) =>
                  isWarpTile(currentRoom, r, c) ? (
                    <rect
                      key={`warp-${r}-${c}`}
                      x={c * SPRITE_RES}
                      y={r * SPRITE_RES}
                      width={SPRITE_RES}
                      height={SPRITE_RES}
                      fill={C.inkSoft}
                      fillOpacity={0.12}
                    />
                  ) : null
                )
              )}

              {avatarEls}

              <rect x="0" y="0" width={W} height={H} fill="url(#vig)" />
            </svg>

            {inOffice && (
              <div style={{
                position: 'absolute',
                left: 12 * TILE + TILE,
                top: 11 * TILE + TILE * 0.6,
                transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 7px',
                background: C.bgDeep + 'ee',
                border: `1px solid ${C.statusBreak}44`,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 9, letterSpacing: 1,
                color: C.statusBreak,
                whiteSpace: 'nowrap', pointerEvents: 'none',
              }}>
                ☕ PAUSE ZONE
              </div>
            )}

            {!inOffice && (
              <div style={{
                position: 'absolute',
                left: 1 * TILE,
                bottom: 2 * TILE,
                padding: '2px 7px',
                background: C.bgDeep + 'ee',
                border: `1px solid ${C.inkSoft}55`,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 9, letterSpacing: 1,
                color: C.inkSoft,
                pointerEvents: 'none',
              }}>
                ← BÜRO
              </div>
            )}

            {visibleUsers.map((user) => {
              const rawStatus = statuses[user.id]?.status ?? 'offline';
              const designStatus = toDesign[rawStatus as StatusValue] ?? 'away';
              const col_ = STATUS_META[designStatus].color;
              const name = user.name ?? `Desk ${user.desk_position}`;

              let pos: { col: number; row: number };
              if (user.id === currentUserId && avatarPos) {
                pos = { col: avatarPos.col, row: avatarPos.row };
              } else {
                pos = positions[user.id] ?? (
                  SEAT_BY_DESK[user.desk_position]
                    ? { col: SEAT_BY_DESK[user.desk_position].col, row: SEAT_BY_DESK[user.desk_position].row }
                    : null
                );
              }
              if (!pos) return null;

              const sx = pos.col * TILE + TILE / 2;
              const sy = (pos.row + 1) * TILE + 4;

              return (
                <div key={user.id} style={{
                  position: 'absolute', left: sx, top: sy,
                  transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '2px 6px 2px 4px',
                  background: C.bgDeep + 'ee',
                  border: `1px solid ${C.wallLight}`,
                  boxShadow: `0 2px 0 ${C.bgDeep}`,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 10, lineHeight: 1.2, color: C.ink,
                  whiteSpace: 'nowrap', pointerEvents: 'none',
                  transition: 'left 220ms linear, top 220ms linear',
                }}>
                  <span style={{ width: 6, height: 6, background: col_, boxShadow: `0 0 6px ${col_}`, display: 'block',
                    transition: 'background 0.3s, box-shadow 0.3s' }} />
                  <span style={{ letterSpacing: 0.5 }}>{name}</span>
                </div>
              );
            })}

            {/* Top-left title */}
            <div style={{
              position: 'absolute', left: 12, top: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11, letterSpacing: 2,
              background: C.bgDeep + 'ee', color: C.ink,
              padding: '6px 10px',
              border: `1px solid ${C.wallLight}`,
              boxShadow: `0 3px 0 ${C.bgDeep}`,
            }}>
              {roomMeta.title} · {roomMeta.subtitle}
              {inOffice ? ` · ${SEATS.length} PLÄTZE` : ''}
            </div>

            {inOffice && (
            <div style={{
              position: 'absolute', right: 12, top: 12,
              display: 'flex', gap: 6,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11, letterSpacing: 1,
            }}>
              {summary.map((x) => (
                <div key={x.k} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px',
                  background: C.bgDeep + 'ee',
                  border: `1px solid ${C.wallLight}`,
                  boxShadow: `0 3px 0 ${C.bgDeep}`,
                  color: C.ink,
                }}>
                  <span style={{ width: 8, height: 8, background: x.color, boxShadow: `0 0 8px ${x.color}`, display: 'block',
                    transition: 'background 0.3s, box-shadow 0.3s' }} />
                  <span>{x.n}</span>
                  <span style={{ color: C.inkDim, fontSize: 9 }}>{x.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
