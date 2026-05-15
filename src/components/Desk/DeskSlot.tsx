import { useOfficeStore } from '../../stores/officeStore';
import { OFFICE_GRID } from '../../types';
import { AvatarSprite } from '../Avatar/AvatarSprite';

interface DeskSlotProps {
  position: number;
}

// Feste Schreibtisch-Layouts auf dem Grid (Spalten/Zeilen). Später aus Config.
const DESK_LAYOUT: Record<number, { x: number; y: number }> = {
  1: { x: 3, y: 3 },
  2: { x: 8, y: 3 },
  3: { x: 13, y: 3 },
  4: { x: 3, y: 8 },
  5: { x: 8, y: 8 },
  6: { x: 13, y: 8 },
  7: { x: 16, y: 11 },
};

export function DeskSlot({ position }: DeskSlotProps) {
  const { tileSize } = OFFICE_GRID;
  const layout = DESK_LAYOUT[position];

  const user = useOfficeStore((s) =>
    Object.values(s.users).find((u) => u.desk_position === position) ?? null
  );
  const status = useOfficeStore((s) => (user ? s.statuses[user.id] ?? null : null));
  const selectDesk = useOfficeStore((s) => s.selectDesk);

  if (!layout) return null;

  return (
    <button
      type="button"
      onClick={() => selectDesk(position)}
      className="absolute flex flex-col items-center gap-1 rounded p-1 hover:bg-white/5"
      style={{
        left: layout.x * tileSize,
        top: layout.y * tileSize,
        width: tileSize * 2,
        height: tileSize * 3,
      }}
      title={user ? user.name : `Schreibtisch ${position}`}
    >
      <AvatarSprite avatarId={user?.avatar_id ?? 0} status={status?.status ?? 'offline'} />
      <span className="text-[10px] text-white/70">
        {user?.name ?? `#${position}`}
      </span>
    </button>
  );
}
