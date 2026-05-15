// 20×15 tile map. Each char is a tile code.
// C tiles are assigned to persons in row-major scan order (top→bottom, left→right).
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
