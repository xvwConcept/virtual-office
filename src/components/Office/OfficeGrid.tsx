import { DESK_COUNT, OFFICE_GRID } from '../../types';
import { DeskSlot } from '../Desk/DeskSlot';

export function OfficeGrid() {
  const { cols, rows, tileSize } = OFFICE_GRID;

  return (
    <div
      className="relative rounded-lg border border-white/10 bg-[var(--color-card)] shadow-2xl"
      style={{ width: cols * tileSize, height: rows * tileSize }}
    >
      {Array.from({ length: DESK_COUNT }, (_, i) => (
        <DeskSlot key={i + 1} position={i + 1} />
      ))}
    </div>
  );
}
