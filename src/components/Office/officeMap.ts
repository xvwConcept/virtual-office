// 20×15 tile map. Each char is a tile code.
// C tiles are assigned to persons in row-major scan order (top→bottom, left→right).

// Tiles the player avatar can walk onto.
export const WALKABLE_TILES = new Set(['.', '/', 'C', 'c', 'R', 'L', 'l']);

// Entering any of these tiles auto-sets the user's status to "pause".
export const BREAK_ZONE_TILES = new Set(['R', 'L', 'l']);

// Exit door + corridor under pause zone — sets status to offline (Abwesend).
export const DOOR_TILE = '/';
export const DOOR_ZONE_KEYS = new Set(['12-13', '13-13', '14-11']);

export const OFFICE_MAP: string[] = [
  '====================', //  0
  '|.WW.A..WW.A..WW.A.|', //  1
  '|..................|', //  2
  '|..D...D...D.......|', //  3
  '|..d...d...d.......|', //  4
  '|..C...C...C....P..|', //  5
  '|..................|', //  6
  '|.............TTTT.|', //  7
  '|..D...D...D..tttt.|', //  8
  '|..d...d...d..cccc.|', //  9
  '|..C...C...C.......|', // 10
  '|..................|', // 11
  '|.kKKK....RRRR.LLLL|', // 12
  '|.P.......RRRR.llll|', // 13
  '===========/========', // 14
];
