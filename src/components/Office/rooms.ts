import { OFFICE_MAP, WALKABLE_TILES } from './officeMap';

export type RoomId = 'office' | 'meeting';

/** Top-right walkable floor tile on the main office map (row 1, col 18). */
function topRightWalkable(map: string[]): { row: number; col: number } {
  for (let r = 0; r < map.length; r++) {
    const line = map[r] ?? '';
    for (let c = line.length - 1; c >= 0; c--) {
      if (WALKABLE_TILES.has(line[c])) return { row: r, col: c };
    }
  }
  return { row: 1, col: 18 };
}

export const OFFICE_WARP_POS = topRightWalkable(OFFICE_MAP);
export const OFFICE_WARP_ZONE = new Set([`${OFFICE_WARP_POS.row}-${OFFICE_WARP_POS.col}`]);

/** Bottom-left exit in meeting room — return to main office. */
export const MEETING_WARP_ZONE = new Set(['13-1', '13-2', '14-1']);

export const MEETING_ROOM_MAP: string[] = [
  '====================', //  0
  '|..................|', //  1
  '|..................|', //  2
  '|......TTTT........|', //  3
  '|......tttt........|', //  4
  '|......cccc........|', //  5
  '|..................|', //  6
  '|..P..........P....|', //  7
  '|..................|', //  8
  '|..................|', //  9
  '|..................|', // 10
  '|..................|', // 11
  '|..................|', // 12
  '|..................|', // 13
  '|/.................|', // 14 — back to office
];

export const ROOM_META: Record<RoomId, { title: string; subtitle: string }> = {
  office:  { title: 'VIRTUAL OFFICE', subtitle: '20×15' },
  meeting: { title: 'MEETING ROOM',   subtitle: 'Konferenz' },
};

export function getRoomMap(room: RoomId): string[] {
  return room === 'office' ? OFFICE_MAP : MEETING_ROOM_MAP;
}

export function getWarpTarget(room: RoomId): { room: RoomId; row: number; col: number } | null {
  if (room === 'office') return { room: 'meeting', row: 13, col: 2 };
  if (room === 'meeting') return { room: 'office', row: OFFICE_WARP_POS.row, col: OFFICE_WARP_POS.col };
  return null;
}

export function isWarpTile(room: RoomId, row: number, col: number): boolean {
  const key = `${row}-${col}`;
  return room === 'office' ? OFFICE_WARP_ZONE.has(key) : MEETING_WARP_ZONE.has(key);
}
