export const TILE = 48;           // CSS px per tile
export const GRID_COLS = 20;
export const GRID_ROWS = 15;
export const SPRITE_RES = 16;    // logical px per sprite

export const C = {
  bgDeep:      '#14121a',
  bgFrame:     '#1f1c26',
  floorA:      '#c9b48a',
  floorB:      '#b89e72',
  floorEdge:   '#8a7654',
  grout:       '#a08962',
  wallDark:    '#322b3a',
  wallMid:     '#463e52',
  wallLight:   '#5a5168',
  deskTop:     '#7a5230',
  deskShade:   '#5a3a20',
  deskEdge:    '#3a2515',
  chair:       '#2c2934',
  chairHL:     '#43404c',
  monitor:     '#1a1d28',
  monitorOn:   '#7fb0e6',
  monitorHL:   '#a8cef0',
  keyboard:    '#3a3744',
  table:       '#4a4055',
  tableHL:     '#5e5269',
  counter:     '#d4cdc0',
  counterHL:   '#e8e2d7',
  appliance:   '#5c5663',
  couch:       '#b87a5a',
  couchHL:     '#cf9a78',
  rug:         '#3a5870',
  plantLeaf:   '#4a8a3a',
  plantDark:   '#2f6224',
  plantPot:    '#6b3a2b',
  door:        '#7e6240',
  doorHL:      '#9c7d56',
  window:      '#7bb7d6',
  windowHL:    '#a5d3e8',
  statusActive:'#5cbf60',
  statusBreak: '#e8a44c',
  statusDND:   '#d84a4a',
  statusAway:  '#8a8590',
  ink:         '#f4ecd8',
  inkDim:      '#a89c84',
  inkSoft:     '#7a7062',
} as const;

export type DesignStatus = 'active' | 'break' | 'dnd' | 'away';

export const STATUS_META: Record<DesignStatus, { label: string; color: string; glyph: string }> = {
  active: { label: 'Am Platz',     color: C.statusActive, glyph: 'dot'   },
  break:  { label: 'Pause',        color: C.statusBreak,  glyph: 'cup'   },
  dnd:    { label: 'Nicht stören', color: C.statusDND,    glyph: 'bar'   },
  away:   { label: 'Abwesend',     color: C.statusAway,   glyph: 'arrow' },
};

export interface PersonVisual {
  shirt: string;
  hair:  string;
  skin:  string;
  style: 'short' | 'long' | 'bun' | 'ponytail' | 'curly' | 'buzz' | 'bald' | 'cap';
  acc:   'none' | 'glasses' | 'headphones' | 'earring';
}

// Placeholder visual styles — one per desk position 1-6.
// Assign in desk order: Suzin(1), Alexander(2), Saskia(3), Oliver(4), Thomas(5), Max(6)
export const DESK_VISUALS: Record<number, PersonVisual> = {
  1: { shirt: '#d8504a', hair: '#3a2a1f', skin: '#e8c39a', style: 'long',     acc: 'none'       },
  2: { shirt: '#4a7cd8', hair: '#1a1410', skin: '#d4a37a', style: 'short',    acc: 'glasses'    },
  3: { shirt: '#4ab87a', hair: '#a8633a', skin: '#f0d4ad', style: 'ponytail', acc: 'none'       },
  4: { shirt: '#d8a44a', hair: '#2a1a14', skin: '#b8845e', style: 'buzz',     acc: 'headphones' },
  5: { shirt: '#a44ad8', hair: '#4a3024', skin: '#e8c39a', style: 'bun',      acc: 'earring'    },
  6: { shirt: '#4ad8c4', hair: '#d8b066', skin: '#f0d4ad', style: 'curly',    acc: 'glasses'    },
};
