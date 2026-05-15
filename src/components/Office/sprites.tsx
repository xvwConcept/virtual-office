import { C, type DesignStatus, type PersonVisual, STATUS_META } from './officeTokens';

// Pixel rect helper
const px = (x: number, y: number, fill: string, key: string, w = 1, h = 1, opacity = 1) => (
  <rect key={key} x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} shapeRendering="crispEdges" />
);

// ── Floor ─────────────────────────────────────────────────────────────
export function Floor({ variant = 'A' }: { variant?: 'A' | 'B' }) {
  const base = variant === 'A' ? C.floorA : C.floorB;
  return (
    <g>
      {px(0, 0, base, 'bg', 16, 16)}
      {px(0, 7, C.grout, 's1', 16, 1, 0.4)}
      {px(0, 15, C.grout, 's2', 16, 1, 0.4)}
      {px(3, 3, C.floorEdge, 'd1', 1, 1, 0.5)}
      {px(11, 4, C.floorEdge, 'd2', 1, 1, 0.5)}
      {px(6, 11, C.floorEdge, 'd3', 1, 1, 0.5)}
      {px(13, 13, C.floorEdge, 'd4', 1, 1, 0.5)}
    </g>
  );
}

// ── Walls ─────────────────────────────────────────────────────────────
export function WallTop() {
  return (
    <g>
      {px(0, 0, C.wallDark, 'b', 16, 16)}
      {px(0, 0, C.wallMid, 'm', 16, 12)}
      {px(0, 0, C.wallLight, 't', 16, 3)}
      {px(0, 11, C.wallDark, 's', 16, 1)}
    </g>
  );
}
export function WallSide() {
  return (
    <g>
      {px(0, 0, C.wallDark, 'b', 16, 16)}
      {px(1, 0, C.wallMid, 'm', 14, 16)}
      {px(2, 0, C.wallLight, 'h', 2, 16)}
    </g>
  );
}
export function WallSolid() {
  return (
    <g>
      {px(0, 0, C.wallDark, 'b', 16, 16)}
      {px(0, 0, C.wallMid, 'm', 16, 12)}
      {px(0, 0, C.wallLight, 't', 16, 3)}
    </g>
  );
}
export function Window() {
  return (
    <g>
      <WallSolid />
      {px(2, 2, C.wallDark, 'f', 12, 8)}
      {px(3, 3, C.window, 'g', 10, 6)}
      {px(3, 3, C.windowHL, 'h', 5, 2)}
      {px(7, 3, C.wallDark, 'm', 2, 6)}
      {px(3, 5, C.wallDark, 'mh', 10, 1)}
      {px(11, 4, '#ffffff', 'sg', 1, 1, 0.7)}
    </g>
  );
}
export function Door() {
  return (
    <g>
      {px(0, 0, C.wallDark, 'b', 16, 16)}
      {px(2, 0, C.door, 'd', 12, 14)}
      {px(2, 0, C.doorHL, 'hl', 12, 2)}
      {px(2, 0, C.doorHL, 'lv', 2, 14)}
      {px(11, 7, C.bgDeep, 'kn', 2, 2)}
    </g>
  );
}
export function WallArt({ variant = 0 }: { variant?: number }) {
  const palettes = [
    ['#d8504a', '#e8a44c', '#4a7cd8'],
    ['#4ab87a', '#d8a44a', '#322b3a'],
    ['#a44ad8', '#7bb7d6', '#f4ecd8'],
    ['#d84a8e', '#4ad8c4', '#322b3a'],
  ];
  const pal = palettes[variant % palettes.length];
  return (
    <g>
      <WallSolid />
      {px(2, 3, '#2a221c', 'f', 12, 9)}
      {px(3, 4, pal[2], 'bg', 10, 7)}
      {px(4, 5, pal[0], 's1', 4, 3)}
      {px(8, 7, pal[1], 's2', 4, 3)}
      {px(5, 9, pal[1], 's3', 2, 2)}
      {px(2, 3, '#5a4a3a', 'fh', 12, 1)}
    </g>
  );
}

// ── Desk ──────────────────────────────────────────────────────────────
export function DeskTop({ lampOn = false }: { lampOn?: boolean }) {
  return (
    <g>
      <Floor />
      {px(0, 8, C.deskTop, 'ds', 16, 8)}
      {px(0, 8, C.deskShade, 'sh', 16, 2)}
      {px(0, 14, C.deskEdge, 'ed', 16, 2)}
      {px(7, 6, C.monitor, 'ms', 2, 3)}
      {px(3, 0, C.monitor, 'mb', 10, 7)}
      {px(4, 1, C.monitorOn, 'sc', 8, 5)}
      {px(4, 1, C.monitorHL, 'hl', 3, 1)}
      {px(1, 7, '#2a2530', 'lp', 2, 3)}
      {px(0, 5, '#2a2530', 'lh', 4, 2)}
      {lampOn && (
        <>
          {px(0, 5, C.statusBreak, 'll', 4, 1, 0.95)}
          {px(0, 7, C.statusBreak, 'lg', 4, 5, 0.18)}
        </>
      )}
    </g>
  );
}
export function DeskBottom({ status }: { status?: DesignStatus | null }) {
  const mugColor =
    status === 'break' ? C.statusBreak :
    status === 'dnd'   ? C.statusDND   :
    status === 'away'  ? C.statusAway  : '#c4a878';
  return (
    <g>
      <Floor />
      {px(0, 0, C.deskShade, 'shh', 16, 1)}
      {px(0, 0, C.deskTop, 'ds', 16, 7)}
      {px(0, 6, C.deskEdge, 'ed', 16, 1)}
      {px(3, 2, C.keyboard, 'kb', 10, 3)}
      {px(4, 3, C.monitorHL, 'k1', 1, 1)}
      {px(6, 3, C.monitorHL, 'k2', 1, 1)}
      {px(8, 3, C.monitorHL, 'k3', 1, 1)}
      {px(10, 3, C.monitorHL, 'k4', 1, 1)}
      {px(13, 1, mugColor, 'mug', 2, 3)}
      {px(13, 1, C.monitorHL, 'mh', 2, 1)}
      {px(1, 2, C.ink, 'pp', 1, 3, 0.85)}
    </g>
  );
}

// ── Chair + halo ──────────────────────────────────────────────────────
export function ChairBack({ status }: { status?: DesignStatus | null }) {
  const halo = status ? STATUS_META[status].color : null;
  return (
    <g>
      {halo && (
        <>
          {px(0, 9, halo, 'h0', 16, 7, 0.18)}
          {px(1, 10, halo, 'h1', 14, 5, 0.28)}
          {px(2, 11, halo, 'h2', 12, 3, 0.42)}
        </>
      )}
      {px(3, 0, C.chair, 'cb', 10, 4)}
      {px(3, 0, C.chairHL, 'ch', 10, 1)}
      {px(2, 11, C.chair, 'se', 12, 4)}
      {px(2, 11, C.chairHL, 'sh', 12, 1)}
      {px(3, 15, C.chair, 'w1', 2, 1)}
      {px(11, 15, C.chair, 'w2', 2, 1)}
    </g>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────
function HairLayer({ style, hair }: { style: PersonVisual['style']; hair: string }) {
  switch (style) {
    case 'short': return (<>
      {px(4, 2, hair, 'ht', 8, 1)}{px(4, 1, hair, 'hu', 8, 1)}{px(5, 0, hair, 'hc', 6, 1)}
      {px(4, 3, hair, 'hl', 1, 1)}{px(11, 3, hair, 'hr', 1, 1)}
    </>);
    case 'long': return (<>
      {px(4, 2, hair, 'ht', 8, 1)}{px(4, 1, hair, 'hu', 8, 1)}{px(5, 0, hair, 'hc', 6, 1)}
      {px(3, 3, hair, 'sl', 1, 5)}{px(12, 3, hair, 'sr', 1, 5)}
      {px(4, 6, hair, 'sb1', 1, 1)}{px(11, 6, hair, 'sb2', 1, 1)}
    </>);
    case 'bun': return (<>
      {px(4, 2, hair, 'ht', 8, 1)}{px(4, 1, hair, 'hu', 8, 1)}{px(5, 0, hair, 'hc', 6, 1)}
      {px(7, -1, hair, 'bu', 2, 1)}{px(6, 0, hair, 'bd', 4, 1)}
      {px(4, 3, hair, 'hl', 1, 1)}{px(11, 3, hair, 'hr', 1, 1)}
    </>);
    case 'ponytail': return (<>
      {px(4, 2, hair, 'ht', 8, 1)}{px(4, 1, hair, 'hu', 8, 1)}{px(5, 0, hair, 'hc', 6, 1)}
      {px(12, 3, hair, 'pt1', 2, 1)}{px(13, 4, hair, 'pt2', 2, 2)}
      {px(4, 3, hair, 'hl', 1, 1)}
    </>);
    case 'curly': return (<>
      {px(4, 2, hair, 'ht', 8, 1)}{px(3, 1, hair, 'h1', 1, 2)}{px(5, 0, hair, 'h2', 2, 1)}
      {px(8, 0, hair, 'h3', 2, 1)}{px(12, 1, hair, 'h4', 1, 2)}{px(11, 0, hair, 'h5', 1, 1)}
      {px(4, 0, hair, 'h6', 1, 1)}{px(3, 3, hair, 'hl', 1, 1)}{px(12, 3, hair, 'hr', 1, 1)}
    </>);
    case 'buzz': return (<>
      {px(5, 2, hair, 'ht', 6, 1)}{px(5, 1, hair, 'hu', 6, 1, 0.6)}
    </>);
    case 'bald': return <>{px(5, 2, hair, 'hl', 6, 1, 0.4)}</>;
    case 'cap': return (<>
      {px(4, 1, '#2a2530', 'cap1', 8, 2)}{px(5, 0, '#2a2530', 'cap2', 6, 1)}
      {px(3, 2, '#2a2530', 'brim', 10, 1)}{px(7, 1, hair, 'lg', 1, 1, 0.8)}
    </>);
    default: return null;
  }
}

function AccessoryLayer({ acc }: { acc: PersonVisual['acc'] }) {
  if (acc === 'glasses') return (<>
    {px(5, 4, '#1a1410', 'gl', 1, 1)}{px(10, 4, '#1a1410', 'gr', 1, 1)}
    {px(6, 4, '#1a1410', 'gb', 4, 1, 0.55)}
  </>);
  if (acc === 'headphones') return (<>
    {px(4, 0, '#1a1410', 'hb1', 8, 1)}{px(5, -1, '#1a1410', 'hb2', 6, 1)}
    {px(3, 3, '#1a1410', 'el', 1, 2)}{px(12, 3, '#1a1410', 'er', 1, 2)}
  </>);
  if (acc === 'earring') return <>{px(4, 5, '#e8c44c', 'ee', 1, 1)}</>;
  return null;
}

export function Avatar({ visual, status }: { visual: PersonVisual; status?: DesignStatus | null }) {
  const { shirt, hair, skin, style, acc } = visual;
  const isAway = status === 'away';
  const statusColor = status ? STATUS_META[status].color : null;
  return (
    <g opacity={isAway ? 0.55 : 1}>
      {px(5, 3, skin, 'hd', 6, 3)}
      {px(4, 4, skin, 'el', 1, 1)}
      {px(11, 4, skin, 'er', 1, 1)}
      {px(5, 5, '#00000022', 'fs', 6, 1)}
      <HairLayer style={style} hair={hair} />
      <AccessoryLayer acc={acc} />
      {px(7, 6, skin, 'nk', 2, 1)}
      {px(3, 7, shirt, 'sh', 10, 5)}
      {px(3, 7, '#00000033', 'ss', 10, 1)}
      {px(3, 11, '#00000033', 'sb', 10, 1)}
      {px(3, 8, skin, 'al', 1, 2)}
      {px(12, 8, skin, 'ar', 1, 2)}
      {statusColor && (
        <g>
          {px(12, 0, C.bgDeep, 'sbb', 4, 4)}
          {px(13, 0, C.bgDeep, 'sb1', 1, 1)}
          {px(15, 0, C.bgDeep, 'sb2', 1, 1)}
          {px(12, 1, statusColor, 'sd', 4, 2)}
          {px(13, 0, statusColor, 'sd2', 2, 4)}
          {px(13, 1, '#ffffff', 'hl', 1, 1, 0.9)}
        </g>
      )}
      {status === 'break' && (<>
        {px(2, -1, C.statusBreak, 'br', 2, 1, 0.7)}
        {px(2, 0, C.statusBreak, 'br2', 2, 1)}
        {px(1, 1, C.statusBreak, 'br3', 1, 1)}
      </>)}
      {status === 'dnd' && (<>
        {px(0, 0, C.statusDND, 'z1', 3, 1)}
        {px(1, 1, '#ffffff', 'z2', 1, 1, 0.9)}
      </>)}
    </g>
  );
}

// ── Decor ─────────────────────────────────────────────────────────────
export function Plant() {
  return (
    <g>
      <Floor />
      {px(5, 11, C.plantPot, 'p', 6, 4)}{px(5, 11, C.couchHL, 'ph', 6, 1)}
      {px(6, 6, C.plantDark, 'l1', 4, 5)}{px(4, 7, C.plantDark, 'l2', 2, 4)}
      {px(10, 7, C.plantDark, 'l3', 2, 4)}{px(6, 5, C.plantLeaf, 'h1', 4, 3)}
      {px(5, 8, C.plantLeaf, 'h2', 2, 2)}{px(9, 8, C.plantLeaf, 'h3', 2, 2)}
      {px(7, 2, C.plantLeaf, 'h4', 2, 4)}{px(8, 1, C.plantLeaf, 'h5', 1, 2, 0.8)}
    </g>
  );
}
export function MeetTableTop() {
  return (
    <g>
      <Floor />
      {px(0, 4, C.table, 't', 16, 12)}{px(0, 4, C.tableHL, 'h', 16, 2)}
      {px(6, 7, C.monitor, 'l', 4, 3)}{px(7, 8, C.monitorOn, 'ls', 2, 1)}
    </g>
  );
}
export function MeetTableBot() {
  return (
    <g>
      <Floor />
      {px(0, 0, C.table, 't', 16, 6)}{px(0, 5, C.bgDeep, 'e', 16, 1)}
    </g>
  );
}
export function MeetChair() {
  return (
    <g>
      <Floor />
      {px(3, 0, C.chair, 'b', 10, 3)}{px(3, 0, C.chairHL, 'h', 10, 1)}
    </g>
  );
}
export function KitchenCounter() {
  return (
    <g>
      <Floor />
      {px(0, 2, C.counter, 'c', 16, 12)}{px(0, 2, C.counterHL, 'h', 16, 1)}
      {px(0, 13, C.appliance, 'e', 16, 1)}{px(4, 6, C.window, 's', 8, 4)}
      {px(4, 6, C.windowHL, 'sh', 8, 1)}
    </g>
  );
}
export function KitchenAppliance() {
  return (
    <g>
      <Floor />
      {px(2, 1, C.appliance, 'a', 12, 13)}{px(2, 1, C.chairHL, 'h', 12, 1)}
      {px(3, 5, C.bgDeep, 'd', 10, 1)}{px(12, 3, C.statusActive, 'l', 1, 1)}
    </g>
  );
}
export function CouchLeft() {
  return (
    <g>
      <Floor />
      {px(2, 4, C.couch, 'b', 14, 10)}{px(2, 4, C.couchHL, 'h', 14, 2)}
      {px(2, 4, C.couch, 'ar', 3, 10)}{px(2, 4, C.couchHL, 'ah', 3, 2)}
    </g>
  );
}
export function CouchRight() {
  return (
    <g>
      <Floor />
      {px(0, 4, C.couch, 'b', 14, 10)}{px(0, 4, C.couchHL, 'h', 14, 2)}
      {px(11, 4, C.couch, 'ar', 3, 10)}{px(11, 4, C.couchHL, 'ah', 3, 2)}
    </g>
  );
}
export function Rug() {
  return (
    <g>
      <Floor />
      {px(0, 0, C.rug, 'r', 16, 16)}{px(0, 0, '#5a7d96', 'h', 16, 2)}
      {px(0, 14, '#2a4358', 's', 16, 2)}{px(7, 6, '#5a7d96', 'd', 2, 4)}
      {px(2, 4, '#ffffff22', 'n1', 1, 1)}{px(13, 11, '#ffffff22', 'n2', 1, 1)}
    </g>
  );
}
