import { useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';
import { useAvatarMovement } from '../../hooks/useAvatarMovement';
import { useOfficeStore } from '../../stores/officeStore';
import type { StatusValue } from '../../types';
import { TILE, GRID_COLS, GRID_ROWS, SPRITE_RES, C, STATUS_META, DESK_VISUALS, type DesignStatus } from './officeTokens';
import { OFFICE_MAP } from './officeMap';
import {
  Floor, WallTop, WallSide, WallSolid, Window, Door, WallArt,
  DeskTop, DeskBottom, ChairBack, Avatar,
  Plant, MeetTableTop, MeetTableBot, MeetChair,
  KitchenCounter, KitchenAppliance, CouchLeft, CouchRight, Rug,
} from './sprites';

// Map our status values to the design's status model
const toDesign: Record<StatusValue, DesignStatus> = {
  online:  'active',
  pause:   'break',
  dnd:     'dnd',
  offline: 'away',
};

const floorVariant = (r: number, c: number): 'A' | 'B' =>
  (r + c) % 2 === 0 ? 'A' : 'B';

export function OfficeView() {
  const { loading, error } = useUsers();
  useRealtimeStatus();

  const users          = useOfficeStore((s) => s.users);
  const statuses       = useOfficeStore((s) => s.statuses);
  const currentUserId  = useOfficeStore((s) => s.currentUserId);
  const avatarPos      = useOfficeStore((s) => s.avatarPos);
  const setAvatarPos   = useOfficeStore((s) => s.setAvatarPos);

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

  const W    = GRID_COLS * SPRITE_RES;  // 320 logical px
  const H    = GRID_ROWS * SPRITE_RES;  // 240 logical px
  const CSSW = GRID_COLS * TILE;        // 960 css px
  const CSSH = GRID_ROWS * TILE;        // 720 css px

  // Collect seat positions in row-major order, assign desk_position 1…6
  let seatIdx = 0;
  const seats: { row: number; col: number; deskPosition: number }[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (OFFICE_MAP[r]?.[c] === 'C') {
        seats.push({ row: r, col: c, deskPosition: seatIdx + 1 });
        seatIdx++;
      }
    }
  }

  const currentUser = currentUserId ? users[currentUserId] : null;
  const mySeat = seats.find((s) => s.deskPosition === currentUser?.desk_position) ?? null;

  // Place avatar at own desk on first load
  useEffect(() => {
    if (mySeat && !avatarPos) {
      setAvatarPos({ row: mySeat.row, col: mySeat.col });
    }
  }, [mySeat?.row, mySeat?.col, avatarPos, setAvatarPos]);

  useAvatarMovement(mySeat?.row ?? null, mySeat?.col ?? null);

  // Build lookup: deskPosition → { name, designStatus }
  const seatData = Object.fromEntries(
    seats.map(({ deskPosition }) => {
      const user = Object.values(users).find((u) => u.desk_position === deskPosition);
      const rawStatus = user ? statuses[user.id]?.status ?? 'offline' : 'offline';
      const designStatus = toDesign[rawStatus as StatusValue] ?? 'away';
      return [deskPosition, { user, designStatus }];
    })
  );

  // Which desk columns have active/dnd (lamp glow)
  const lampOnCols = new Set(
    seats
      .filter(({ deskPosition }) => {
        const ds = seatData[deskPosition]?.designStatus;
        return ds === 'active' || ds === 'dnd';
      })
      .map(({ col }) => col)
  );

  // Render tiles
  let artCount = 0;
  const tiles: React.ReactNode[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const code = OFFICE_MAP[r]?.[c] ?? '.';
      const key  = `${r}-${c}`;
      const tx   = c * SPRITE_RES;
      const ty   = r * SPRITE_RES;

      // Find which seat this tile belongs to
      const seat = seats.find((s) => s.row === r && s.col === c);
      const seatBelow = seats.find((s) => s.col === c && s.row === r + 1);

      let content: React.ReactNode = null;
      switch (code) {
        case '=': content = <WallTop />; break;
        case '|': content = <WallSide />; break;
        case '#': content = <WallSolid />; break;
        case 'W': content = <Window />; break;
        case 'A': content = <WallArt variant={artCount++} />; break;
        case '/': content = <Door />; break;
        case 'D': content = <DeskTop lampOn={lampOnCols.has(c)} />; break;
        case 'd': {
          const ds = seatBelow ? seatData[seatBelow.deskPosition]?.designStatus : null;
          content = <DeskBottom status={ds} />;
          break;
        }
        case 'C': {
          if (seat) {
            const { designStatus } = seatData[seat.deskPosition];
            const visual = DESK_VISUALS[seat.deskPosition];
            const isMe = seat.deskPosition === currentUser?.desk_position;
            content = (
              <g>
                <Floor variant={floorVariant(r, c)} />
                <ChairBack status={designStatus} />
                {/* Current user's avatar is rendered as a free-moving element */}
                {visual && !isMe && <Avatar visual={visual} status={designStatus} />}
              </g>
            );
          } else {
            content = <Floor variant={floorVariant(r, c)} />;
          }
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

      tiles.push(
        <g key={key} transform={`translate(${tx} ${ty})`}>{content}</g>
      );
    }
  }

  // Status summary (top-right overlay)
  const designStatuses = Object.values(seatData).map((d) => d.designStatus);
  const summary = (['active', 'break', 'dnd', 'away'] as DesignStatus[]).map((k) => ({
    k,
    n: designStatuses.filter((s) => s === k).length,
    ...STATUS_META[k],
  }));

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: C.bgDeep,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {/* Frame */}
        <div style={{
          padding: 12,
          background: C.bgFrame,
          boxShadow: `inset 0 0 0 4px ${C.bgDeep}`,
        }}>
          <div style={{ position: 'relative', width: CSSW, height: CSSH }}>
            {/* SVG pixel map */}
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

              {/* Break-zone floor tint */}
              <rect x={10 * SPRITE_RES} y={12 * SPRITE_RES} width={4 * SPRITE_RES} height={2 * SPRITE_RES}
                fill={C.statusBreak} fillOpacity={0.08} />
              <rect x={15 * SPRITE_RES} y={12 * SPRITE_RES} width={4 * SPRITE_RES} height={2 * SPRITE_RES}
                fill={C.statusBreak} fillOpacity={0.08} />

              {/* Current user's free-moving avatar */}
              {currentUser && avatarPos && (() => {
                const myVisual = DESK_VISUALS[currentUser.desk_position];
                const myRaw = statuses[currentUserId!]?.status ?? 'offline';
                const myDesign = toDesign[myRaw as StatusValue] ?? 'away';
                if (!myVisual) return null;
                return (
                  <g
                    transform={`translate(${avatarPos.col * SPRITE_RES} ${avatarPos.row * SPRITE_RES})`}
                    style={{ transition: 'transform 70ms linear' }}
                  >
                    <Avatar visual={myVisual} status={myDesign} />
                  </g>
                );
              })()}

              <rect x="0" y="0" width={W} height={H} fill="url(#vig)" />
            </svg>

            {/* Break-zone label */}
            <div style={{
              position: 'absolute',
              left: 12 * TILE + TILE,
              top: 11 * TILE + TILE * 0.6,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 7px',
              background: C.bgDeep + 'ee',
              border: `1px solid ${C.statusBreak}44`,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 9,
              letterSpacing: 1,
              color: C.statusBreak,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>
              ☕ PAUSE ZONE
            </div>

            {/* Name + status pills */}
            {seats.map(({ row, col, deskPosition }) => {
              const { user, designStatus } = seatData[deskPosition];
              const name = user?.name ?? `Desk ${deskPosition}`;
              const col_ = STATUS_META[designStatus].color;
              const sx = col * TILE + TILE / 2;
              const sy = (row + 1) * TILE + 4;
              return (
                <div key={deskPosition} style={{
                  position: 'absolute',
                  left: sx,
                  top: sy,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px 2px 4px',
                  background: C.bgDeep + 'ee',
                  border: `1px solid ${C.wallLight}`,
                  boxShadow: `0 2px 0 ${C.bgDeep}`,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 10,
                  lineHeight: 1.2,
                  color: C.ink,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  <span style={{ width: 6, height: 6, background: col_, boxShadow: `0 0 6px ${col_}`, display: 'block' }} />
                  <span style={{ letterSpacing: 0.5 }}>{name}</span>
                </div>
              );
            })}

            {/* Top-left title */}
            <div style={{
              position: 'absolute', left: 12, top: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11, letterSpacing: 2,
              background: C.bgDeep + 'ee',
              color: C.ink,
              padding: '6px 10px',
              border: `1px solid ${C.wallLight}`,
              boxShadow: `0 3px 0 ${C.bgDeep}`,
            }}>
              VIRTUAL OFFICE · 20×15 · {seats.length} PLÄTZE
            </div>

            {/* Top-right status summary */}
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
                  <span style={{ width: 8, height: 8, background: x.color, boxShadow: `0 0 8px ${x.color}`, display: 'block' }} />
                  <span>{x.n}</span>
                  <span style={{ color: C.inkDim, fontSize: 9 }}>{x.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
