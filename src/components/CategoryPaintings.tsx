// A painting for each category of adhkar, each its own little scene of what it is about: a house for
// the home, a table with food, someone ill in bed, someone worried under a grey sky, rain and lightning
// for the weather... Painted in flat soft colours, as the home screen's wird card; people faceless.
// One picture (200 × 180) fits a small round (its middle) and a page's head (its full width, the top
// left left as open sky for the page's words); `mirrored` turns it round for the Arabic layout.
import type { ReactNode } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

const W = 200;
const H = 180;

// ---------- pieces used by several paintings ----------

const Sky = ({ id, top, mid, low }: { id: string; top: string; mid: string; low: string }) => (
  <>
    <Defs>
      {/* the sky's colours over the picture's own height; above it (a whole page) its top colour goes on */}
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor={top} />
        <Stop offset="0.6" stopColor={mid} />
        <Stop offset="1" stopColor={low} />
      </LinearGradient>
    </Defs>
    <Rect x={-200} y={-1200} width={600} height={1580} fill={`url(#${id})`} />
  </>
);

const Hills = ({ far = '#cfd6bd', mid = '#b2c39f', near = '#93a986' }: { far?: string; mid?: string; near?: string }) => (
  <>
    <Path d="M-40 120L0 106L30 112L64 98L100 110L140 94L170 106L240 100V200H-40Z" fill={far} />
    <Path d="M-40 140C10 128 50 136 90 128C130 120 160 132 240 124V200H-40Z" fill={mid} />
    <Path d="M-40 160C20 150 70 156 110 151C150 146 190 154 240 150V200H-40Z" fill={near} />
  </>
);

// a person, faceless: a round head (with a scarf or a cap), a long robe; standing at (x, y feet)
const Person = ({ x, y, s = 1, robe, head = '#e9c9a6', scarf }: { x: number; y: number; s?: number; robe: string; head?: string; scarf?: string }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M-7 0C-7.5-10-6.5-20-4.5-25Q0-27.5 4.5-25C6.5-20 7.5-10 7 0Z" fill={robe} />
    <Circle cx={0} cy={-29.5} r={4.2} fill={head} />
    {scarf && <Path d="M-5.2-29C-5.4-35.5 5.4-35.5 5.2-29L6-24Q0-21.5-6-24Z" fill={scarf} />}
  </G>
);

const Window = ({ x, y, w, h, frame, light }: { x: number; y: number; w: number; h: number; frame: string; light: string }) => (
  <G>
    <Path d={`M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`} fill={frame} />
    <Path d={`M${x + 2} ${y + h - 2}V${y + w / 2}A${w / 2 - 2} ${w / 2 - 2} 0 0 1 ${x + w - 2} ${y + w / 2}V${y + h - 2}Z`} fill={light} />
  </G>
);

const Lantern = ({ x, y, s = 1, glow = '#ffd98a' }: { x: number; y: number; s?: number; glow?: string }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M0-14V-8" stroke="#a88a52" strokeWidth={0.8} />
    <Circle cx={0} cy={0} r={11} fill={glow} opacity={0.22} />
    <Path d="M-4-8H4L5-5H-5Z" fill="#b8913a" />
    <Path d="M-5-5H5L4 5H-4Z" fill={glow} />
    <Path d="M-5-5H5L4 5H-4Z" fill="none" stroke="#b8913a" strokeWidth={0.8} />
    <Path d="M-4 5H4L2 8H-2Z" fill="#b8913a" />
  </G>
);

const Crescent = ({ x, y, r = 9, color = '#f6e7c1' }: { x: number; y: number; r?: number; color?: string }) => (
  <Path d={`M${x} ${y - r}a${r} ${r} 0 1 0 ${r * 0.4} ${r * 1.9}a${r * 0.78} ${r * 0.78} 0 1 1 -${r * 0.4} -${r * 1.9}z`} fill={color} />
);

const Stars = ({ points }: { points: number[][] }) => (
  <>
    {points.map(([x, y, r], i) => (
      <Circle key={i} cx={x} cy={y} r={r} fill="#fff6dc" opacity={0.85} />
    ))}
  </>
);

// ---------- the paintings ----------


// a book of hadith: closed, standing a little turned on a low wooden stand, its leather in its colour with
// a gold frame and a round gold medallion; an arched window behind, a lantern's warm light
const bookPainting = (id: string, leather: string, dark: string) => (
  <>
    <Sky id={`p-book-${id}`} top="#efe2c8" mid="#f6eedd" low="#ecdcc0" />
    <Window x={34} y={50} w={34} h={52} frame="#d8c7a4" light="#fbf3e0" />
    <Lantern x={176} y={52} s={1.05} />
    <Circle cx={134} cy={100} r={46} fill="#fff3d6" opacity={0.65} />
    <Rect x={-10} y={140} width={220} height={60} fill="#cdb894" />
    {/* the stand */}
    <Path d="M96 142H172L166 150H102Z" fill="#8a6440" />
    <Rect x={104} y={150} width={4} height={8} fill="#7a5638" />
    <Rect x={160} y={150} width={4} height={8} fill="#7a5638" />
    {/* the book: its spine, its pages' edge, its cover */}
    <Path d="M108 140L116 64L122 66L114 142Z" fill={dark} />
    <Path d="M156 140L162 70L166 72L160 142Z" fill="#f4ecd8" />
    <Path d="M114 142L122 66L164 70L158 142Z" fill={leather} />
    <Path d="M120 134L126 76L156 79L151 134Z" fill="none" stroke="#e5c27a" strokeWidth={1.4} />
    <Path d="M123.5 130L128.5 81L152.5 83.5L148 130Z" fill="none" stroke="#e5c27a" strokeWidth={0.7} opacity={0.8} />
    <Circle cx={138.6} cy={106} r={8} fill="none" stroke="#e5c27a" strokeWidth={1.4} />
    <Circle cx={138.6} cy={106} r={3.4} fill="#e5c27a" />
    {/* the ribbon */}
    <Path d="M146 141l1 12l-3-3l-3 3l1-12z" fill="#c9a24c" />
  </>
);

// the misbaha's 33 beads, evenly along a drop hanging from the peg (100, 26) down to the long bead
// (100, 132): the drop's line sampled, then a bead at every 33rd of its length (the bottom left open)
const MISBAHA_BEADS: number[][] = (() => {
  const pts: number[][] = [];
  for (let i = 0; i <= 400; i++) {
    const tt = Math.PI + (i / 400) * Math.PI * 2;
    pts.push([100 + 50 * Math.sin(tt) * Math.abs(Math.sin(tt / 2)), 26 + 53 * (1 - Math.cos(tt))]);
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1];
  return Array.from({ length: 33 }, (_, b) => {
    const want = (total * (b + 0.5)) / 33;
    const j = len.findIndex((l) => l >= want);
    return pts[Math.max(0, j)];
  });
})();

const PAINTINGS: Record<string, () => ReactNode> = {
  // a cosy house with a lit door and windows, a path, a round tree
  home: () => (
    <>
      <Sky id="p-home" top="#f6d9bf" mid="#fbeedd" low="#f4e3c4" />
      <Hills far="#dcd6bd" />
      <Path d="M150 152C148 132 150 118 156 110C164 100 178 104 180 118C182 132 176 144 168 152Z" fill="#7d9a6c" />
      <Rect x={164} y={140} width={3} height={14} fill="#7a5a3c" />
      <Rect x={96} y={104} width={58} height={48} fill="#f4e4c8" />
      <Path d="M90 106L125 80L160 106Z" fill="#c2674a" />
      <Path d="M118 152V132A7 7 0 0 1 132 132V152Z" fill="#2e6a4e" />
      <Circle cx={129} cy={142} r={0.9} fill="#f3d77e" />
      <Rect x={102} y={116} width={11} height={11} rx={1.5} fill="#ffd98a" />
      <Rect x={138} y={116} width={11} height={11} rx={1.5} fill="#ffd98a" />
      <Path d="M107.5 116V127M102 121.5H113M143.5 116V127M138 121.5H149" stroke="#e0b762" strokeWidth={0.8} />
      <Path d="M118 152C114 162 108 170 104 180H146C140 170 134 162 132 152Z" fill="#e8dcc2" />
    </>
  ),

  // a laid table: a steaming platter of couscous with its vegetables in the middle, round bread, a bowl of
  // salad, a jug and glasses of water, on a white cloth
  food: () => (
    <>
      <Sky id="p-food" top="#f3dcc4" mid="#f7e8d6" low="#efd9bd" />
      <Rect x={-10} y={116} width={220} height={80} fill="#b07c52" />
      <Path d="M-10 112H210V150H-10Z" fill="#fbf7ef" />
      <Path d="M-10 150H210" stroke="#c2674a" strokeWidth={2} />
      <Path d="M-10 146H210" stroke="#e0b28a" strokeWidth={0.8} />
      {/* steam over the platter */}
      {[122, 134, 146].map((x) => (
        <Path key={x} d={`M${x} 92q-4-6 0-12q4-6 0-12`} stroke="#ffffff" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.9} />
      ))}
      {/* the platter: couscous heaped, carrots, courgettes, chickpeas */}
      <Ellipse cx={134} cy={124} rx={30} ry={8} fill="#c9a24c" />
      <Ellipse cx={134} cy={122} rx={27} ry={6.5} fill="#e7c27a" />
      <Path d="M110 122Q134 92 158 122Z" fill="#f2d48c" />
      {[[124, 112, '#e8843f'], [134, 104, '#e8843f'], [144, 112, '#e8843f'], [129, 116, '#7fa35a'], [140, 108, '#7fa35a'], [150, 117, '#7fa35a'], [119, 118, '#e2b06c'], [136, 115, '#e2b06c']].map(([x, y, col], i) => (
        <Ellipse key={i} cx={x as number} cy={y as number} rx={3.4} ry={1.6} fill={col as string} transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} />
      ))}
      {/* round bread, cut */}
      <Ellipse cx={86} cy={126} rx={15} ry={5.5} fill="#d99a55" />
      <Path d="M71 125Q86 117 101 125L86 127Z" fill="#e8b876" />
      <Path d="M78 122l6 4M90 121l-4 5" stroke="#b97c3c" strokeWidth={0.8} />
      {/* a bowl of salad */}
      <Path d="M168 122H192Q190 132 180 133Q170 132 168 122Z" fill="#f1ece2" />
      {[172, 177, 182, 187].map((x, i) => (
        <Circle key={x} cx={x} cy={121 - (i % 2)} r={2.6} fill={i % 2 ? '#8cb86a' : '#d9534f'} />
      ))}
      {/* the jug and two glasses */}
      <Path d="M58 98H68L70 104V120Q63 123 56 120V104Z" fill="#e9eef0" opacity={0.95} />
      <Path d="M70 106Q76 108 70 116" stroke="#cfd8dc" strokeWidth={1.6} fill="none" />
      <Path d="M57 108H69V119Q63 121 57 119Z" fill="#a9d4e2" opacity={0.7} />
      <Rect x={100} y={128} width={6} height={9} rx={1} fill="#dff0f5" opacity={0.95} />
      <Rect x={162} y={128} width={6} height={9} rx={1} fill="#dff0f5" opacity={0.95} />
    </>
  ),

  // someone ill in bed: lying under the blanket, a cool cloth on the forehead, a thermometer; on the
  // bedside table the medicine - a bottle, capsules - and a glass of water; a pale blue room, a window
  illness: () => (
    <>
      <Sky id="p-ill" top="#d9e3ee" mid="#ebf0f3" low="#e3ded6" />
      <Window x={146} y={36} w={38} h={54} frame="#c3cbd5" light="#e8f2fb" />
      <Path d="M146 54Q152 70 150 90M184 54Q178 70 180 90" stroke="#b9c7d8" strokeWidth={4} fill="none" opacity={0.7} />
      <Rect x={-10} y={146} width={220} height={60} fill="#d6cdbf" />
      {/* the bedside table, the medicine and the water on it */}
      <Rect x={58} y={122} width={28} height={24} rx={2} fill="#b48a62" />
      <Rect x={60} y={132} width={24} height={1.2} fill="#9a7552" />
      <Rect x={62} y={110} width={7} height={12} rx={1.5} fill="#e08a4e" />
      <Rect x={61.5} y={107} width={8} height={4} rx={1} fill="#f6f4ee" />
      <Rect x={63} y={114} width={5} height={4} rx={0.6} fill="#f6f4ee" opacity={0.9} />
      <G transform="rotate(-18 76 120)">
        <Rect x={72} y={118.5} width={8} height={3.4} rx={1.7} fill="#ffffff" />
        <Rect x={72} y={118.5} width={4} height={3.4} rx={1.7} fill="#d9534f" />
      </G>
      <Rect x={78} y={112} width={6} height={10} rx={1} fill="#e3f1f6" opacity={0.95} />
      <Rect x={78.6} y={115} width={4.8} height={6.4} fill="#a9d4e2" opacity={0.7} />
      {/* the bed */}
      <Path d="M88 146V102A4 4 0 0 1 96 102V146Z" fill="#9a7552" />
      <Rect x={184} y={114} width={5} height={32} rx={2} fill="#9a7552" />
      <Rect x={90} y={126} width={98} height={12} rx={3} fill="#efe9df" />
      <Rect x={92} y={138} width={3} height={8} fill="#8a6848" />
      {/* lying ill: the head on the pillow, the cool cloth on the forehead, the thermometer */}
      <Ellipse cx={108} cy={121} rx={14} ry={6} fill="#ffffff" />
      <Circle cx={110} cy={115.5} r={6.2} fill="#ecd2b4" />
      <Path d="M104 114C104 107 116 107 116.2 114Q110 111.5 104 114Z" fill="#5a4a3a" />
      <Rect x={103.5} y={108.5} width={13} height={4} rx={2} fill="#bfe3f0" transform="rotate(-6 110 110)" />
      <Path d="M114 119L123 123" stroke="#f6f4ee" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={123.4} cy={123.2} r={1.1} fill="#d9534f" />
      {/* the blanket over the body, a hand resting on it */}
      <Path d="M114 119C132 108 168 110 186 118V128H112Z" fill="#9fb7cf" />
      <Path d="M126 116Q152 110 178 116" stroke="#8aa4bf" strokeWidth={1} fill="none" />
      <Path d="M150 126V120" stroke="#8aa4bf" strokeWidth={0.8} />
      <Ellipse cx={132} cy={120} rx={3} ry={2} fill="#ecd2b4" />
    </>
  ),

  // someone sitting alone indoors, elbows on the knees and the head in the hands; behind, a window with
  // the rain running down it, a dim lamp
  worry: () => (
    <>
      <Sky id="p-worry" top="#b9c0cb" mid="#cfd2d6" low="#c9c3b8" />
      {/* the window and the rain on it */}
      <Rect x={118} y={34} width={56} height={64} rx={3} fill="#8d97a6" />
      <Rect x={122} y={38} width={48} height={56} fill="#9eabbd" />
      <Path d="M146 38V94M122 66H170" stroke="#8d97a6" strokeWidth={2} />
      {[128, 136, 152, 160, 132, 156, 166].map((x, i) => (
        <Path key={i} d={`M${x} ${42 + (i % 3) * 14}v8`} stroke="#d6dde8" strokeWidth={1.1} strokeLinecap="round" opacity={0.85} />
      ))}
      <Path d="M118 98H174V102H118Z" fill="#a39886" />
      <Rect x={-10} y={142} width={220} height={60} fill="#a99f8f" />
      {/* the dim lamp */}
      <Rect x={70} y={112} width={2} height={30} fill="#7d7468" />
      <Path d="M62 112H80L76 102H66Z" fill="#d9c79a" />
      <Circle cx={71} cy={114} r={14} fill="#ffe6a8" opacity={0.18} />
      {/* sitting on a low seat, head in the hands */}
      <Rect x={124} y={132} width={38} height={10} rx={3} fill="#7d6a58" />
      <Path d="M132 132C130 120 133 110 140 106Q147 104 151 110L154 132Z" fill="#56627a" />
      <Path d="M148 120L160 128L162 142H156L154 132" fill="#4b566c" />
      <Path d="M150 112Q158 112 160 122" stroke="#4b566c" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Circle cx={153} cy={108} r={5} fill="#e2c4a2" />
      <Path d="M148 107C148 100.5 158 100.5 158 107L157.5 104Q153 101 148.5 104Z" fill="#3e3a38" />
      <Ellipse cx={158} cy={114} rx={3} ry={2.2} fill="#e2c4a2" />
    </>
  ),

  // the weather and the moon in one picture, as «morning and evening»: on one side a storm - its cloud,
  // the rain, a lightning bolt - over the hills; beyond a slant the night, the crescent and the stars
  weather: () => (
    <>
      <Defs>
        <ClipPath id="p-wx-cut">
          <Polygon points="118,-40 240,-40 240,220 82,220" />
        </ClipPath>
      </Defs>
      <Sky id="p-wx" top="#8ea3bd" mid="#c4d0db" low="#e3e4dc" />
      <Path d="M42 62q4-14 20-12q8-12 26-6q16-2 18 12q12 2 10 12H38q-8-2 4-6z" fill="#6f7d92" />
      <Path d="M70 68l-8 16h7l-6 16 16-22h-8l6-10z" fill="#f6d77a" />
      {[50, 58, 84, 94, 104].map((x) => (
        <Path key={x} d={`M${x} 70l-5 16M${x - 2} 92l-4 12`} stroke="#9fb0c6" strokeWidth={1.1} strokeLinecap="round" />
      ))}
      <Hills />
      {/* the night beyond the slant */}
      <G clipPath="url(#p-wx-cut)">
        <Sky id="p-wx-night" top="#26305c" mid="#3c3f6e" low="#6a5a86" />
        <Crescent x={158} y={54} r={13} />
        <Stars points={[[128, 40, 1.1], [184, 36, 0.9], [176, 84, 0.9], [134, 88, 0.8], [196, 60, 0.8], [120, 66, 0.7]]} />
        <Hills far="#3a3a62" mid="#2a2b4d" near="#22223f" />
      </G>
    </>
  ),

  // a bedroom at night: the crescent at the window, someone asleep under the covers, a dim lamp
  sleep: () => (
    <>
      <Sky id="p-sleep" top="#2a3360" mid="#3b3f6e" low="#4a4470" />
      <Window x={128} y={32} w={44} h={56} frame="#5c5a86" light="#232a50" />
      <Crescent x={152} y={50} r={8} />
      <Stars points={[[140, 66, 0.9], [160, 74, 0.8], [146, 46, 0.7]]} />
      <Rect x={-10} y={138} width={220} height={60} fill="#2e2e52" />
      <Rect x={48} y={106} width={6} height={40} rx={2} fill="#6c5a78" />
      <Rect x={50} y={124} width={110} height={14} rx={3} fill="#4f5684" />
      <Ellipse cx={68} cy={120} rx={13} ry={6} fill="#c8cbe4" />
      <Circle cx={70} cy={115} r={5.6} fill="#d9b896" />
      <Path d="M64.5 115C64 108 76 108 75.5 115L76 120Q70 122 64 120Z" fill="#7d84b6" />
      <Path d="M74 118C96 108 136 110 160 118V128H72Z" fill="#7d84b6" />
      <Lantern x={176} y={118} s={0.9} />
    </>
  ),

  // a prayer rug before the mihrab's arch, someone in prostration on it
  prayer: () => (
    <>
      <Sky id="p-prayer" top="#e8dfc9" mid="#f2ead8" low="#e7dcc4" />
      <Path d="M108 128V64A34 34 0 0 1 176 64V128Z" fill="#d8c8a4" />
      <Path d="M116 128V68A26 26 0 0 1 168 68V128Z" fill="#2e6a4e" />
      <Path d="M122 128V72A20 20 0 0 1 162 72V128Z" fill="#3c7c5e" />
      <Lantern x={142} y={74} s={1.1} />
      <Rect x={-10} y={128} width={220} height={60} fill="#d9c9a8" />
      <Path d="M84 134H190L182 162H76Z" fill="#a8383f" />
      <Path d="M90 138H184L178 158H84Z" fill="none" stroke="#e5b65c" strokeWidth={1.2} />
      <Path d="M160 140V156M166 142V154" stroke="#e5b65c" strokeWidth={0.9} />
      {/* in prostration: the head down near the mihrab end, the back curved */}
      <Path d="M100 154C100 140 112 132 126 134C134 135 140 142 142 150L144 154Z" fill="#f2efe6" />
      <Circle cx={147} cy={151} r={4.6} fill="#e9c9a6" />
      <Path d="M143 148C144 142 152 143 152 149L151 154H143Z" fill="#f2efe6" />
    </>
  ),

  // wudu: someone sitting on a low stool before a tap, washing, the water running; an ablution place with
  // its arches and a band of zellige, a brass ewer by the wall
  purif: () => (
    <>
      <Sky id="p-purif" top="#e8dcc4" mid="#f3ead8" low="#ece0c8" />
      {/* the arches behind */}
      {[96, 132, 168].map((x) => (
        <Path key={x} d={`M${x} 104V62A16 16 0 0 1 ${x + 32} 62V104Z`} fill="#d9c7a1" />
      ))}
      {/* the band of zellige */}
      <Rect x={-10} y={104} width={220} height={22} fill="#2e6a4e" />
      {Array.from({ length: 16 }, (_, i) => (
        <G key={i}>
          <Path d={`M${i * 14} 108l5 7-5 7-5-7z`} fill={i % 2 ? '#e5b65c' : '#3f7fa6'} />
          <Circle cx={i * 14 + 7} cy={115} r={1.6} fill="#f4ead6" />
        </G>
      ))}
      <Rect x={-10} y={126} width={220} height={70} fill="#d7c6a6" />
      {/* the tap on the wall, the water running into the channel */}
      <Circle cx={170} cy={96} r={4} fill="#b8913a" />
      <Path d="M170 96H160Q155 96 155 101V104" stroke="#c9a24c" strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M163 92V88M160.5 88H165.5" stroke="#b8913a" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M155 106Q155 120 154 132" stroke="#8fd0e2" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Rect x={120} y={140} width={70} height={4} rx={2} fill="#b9a585" />
      {[[150, 136], [160, 138]].map(([x, y], i) => (
        <Path key={i} d={`M${x} ${y}q2 3 0 5q-2-2 0-5z`} fill="#8fd0e2" />
      ))}
      {/* sitting on the stool, washing the hands under the tap */}
      <Rect x={118} y={136} width={16} height={4} rx={1} fill="#9a7552" />
      <Rect x={120} y={140} width={2.4} height={10} fill="#9a7552" />
      <Rect x={130} y={140} width={2.4} height={10} fill="#9a7552" />
      <Path d="M120 136C119 124 121 114 126 110Q131 108 134 112C136 120 135 130 134 136Z" fill="#f2efe6" />
      <Path d="M131 134H146V139H131Z" fill="#f2efe6" />
      <Path d="M143 138V150" stroke="#f2efe6" strokeWidth={4.4} strokeLinecap="round" />
      <Circle cx={129} cy={104} r={4.6} fill="#e9c9a6" />
      <Path d="M124.6 104C124.4 97 133.6 97 133.4 104L133 106H125Z" fill="#ffffff" />
      <Path d="M132 116Q142 118 151 124" stroke="#f2efe6" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Ellipse cx={153} cy={125} rx={3} ry={2} fill="#e2bc96" />
      {/* the brass ewer */}
      <G transform="translate(84 140)">
        <Path d="M-7 0C-10-6-8-14 0-14C8-14 10-6 7 0Z" fill="#c9a24c" />
        <Path d="M-2-14H2L3-19H-3Z" fill="#b8913a" />
        <Path d="M7-9Q14-12 15-18" stroke="#b8913a" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Path d="M-7-10Q-12-8-10-3" stroke="#b8913a" strokeWidth={1.4} fill="none" />
      </G>
    </>
  ),

  // a mosque with its dome and minaret against a golden sky, palms beside it
  mosque: () => (
    <>
      <Sky id="p-mosque" top="#f3d39b" mid="#f8e6c4" low="#f2dcb1" />
      <Circle cx={150} cy={78} r={30} fill="#ffe6a8" opacity={0.6} />
      <Hills far="#e2d2ae" mid="#cbbf96" near="#b2b07e" />
      <Rect x={96} y={104} width={74} height={44} fill="#f4ead6" />
      <Path d="M108 106Q133 62 158 106Z" fill="#e8dcc0" />
      <Path d="M133 70V62" stroke="#c9a24c" strokeWidth={1.2} />
      <Crescent x={133} y={58} r={3} color="#c9a24c" />
      <Rect x={172} y={70} width={9} height={78} fill="#efe2c6" />
      <Path d="M170 70H183L176.5 56Z" fill="#c2674a" />
      <Rect x={171} y={92} width={11} height={3} fill="#d8c7a0" />
      <Path d="M126 148V128A7 7 0 0 1 140 128V148Z" fill="#2e6a4e" />
      {[104, 152].map((x) => (
        <Path key={x} d={`M${x} 136V122A5 5 0 0 1 ${x + 10} 122V136Z`} fill="#ffd98a" />
      ))}
      <Path d="M70 150V112" stroke="#8a6a44" strokeWidth={2.4} />
      <Path d="M70 112q-14-2-20 8M70 112q-10-10-22-6M70 112q14-2 20 8M70 112q10-10 22-6M70 112q0-12-4-16" stroke="#6d8f5a" strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  ),

  // an open wardrobe: robes on their hangers (a jellaba, a thobe, a dress), folded clothes on the shelf,
  // shoes at the bottom
  clothing: () => (
    <>
      <Sky id="p-cloth" top="#e3e3f0" mid="#efedf2" low="#e7e1d8" />
      <Rect x={-10} y={150} width={220} height={60} fill="#d8cdbd" />
      {/* the wardrobe and its open doors */}
      <Rect x={96} y={34} width={84} height={118} rx={3} fill="#a9774c" />
      <Rect x={100} y={38} width={76} height={110} fill="#f1e6d4" />
      <Path d="M96 36L80 44V146L96 152Z" fill="#c48d5c" />
      <Path d="M180 36L196 44V146L180 152Z" fill="#c48d5c" />
      <Circle cx={92} cy={96} r={1.4} fill="#e9c27a" />
      <Circle cx={184} cy={96} r={1.4} fill="#e9c27a" />
      {/* the shelf, folded clothes on it */}
      <Rect x={100} y={56} width={76} height={2.4} fill="#a9774c" />
      <Rect x={106} y={48} width={20} height={8} rx={1.5} fill="#5b6fa8" />
      <Rect x={130} y={50} width={20} height={6} rx={1.5} fill="#e6d3a8" />
      <Rect x={154} y={47} width={18} height={9} rx={1.5} fill="#b5566d" />
      {/* the rail, the robes on it */}
      <Path d="M102 66H174" stroke="#8a6440" strokeWidth={1.6} />
      {[
        [114, '#2e6a4e', 124],
        [138, '#f6f3ec', 132],
        [161, '#7d84b6', 118],
      ].map(([x, col, low], i) => (
        <G key={i}>
          <Path d={`M${x} 66v3M${(x as number) - 7} 73L${x} 69L${(x as number) + 7} 73`} stroke="#8a7a5a" strokeWidth={1} fill="none" />
          <Path d={`M${(x as number) - 8} 73H${(x as number) + 8}L${(x as number) + 10} ${low}H${(x as number) - 10}Z`} fill={col as string} />
          <Path d={`M${(x as number) - 8} 73L${(x as number) - 13} 92L${(x as number) - 8} 94M${(x as number) + 8} 73L${(x as number) + 13} 92L${(x as number) + 8} 94`} fill={col as string} />
          <Path d={`M${x} 74V${(low as number) - 4}`} stroke="#c9a24c" strokeWidth={0.8} opacity={0.8} />
        </G>
      ))}
      {/* shoes */}
      <Path d="M108 146q0-5 8-5h4v5Z" fill="#6b4a32" />
      <Path d="M124 146q0-5 8-5h4v5Z" fill="#6b4a32" />
      <Path d="M150 146q0-4 6-4h6v4Z" fill="#c9a24c" />
    </>
  ),

  // two people greeting each other: facing, a step apart, shaking hands - in a garden
  manners: () => (
    <>
      <Sky id="p-manners" top="#f4d6d9" mid="#f8e8e4" low="#efe0cf" />
      <Hills far="#dcd6c2" mid="#c3cba8" near="#a8b98f" />
      <Path d="M56 152C54 128 58 112 66 104C76 96 88 104 88 120C88 134 82 146 76 152Z" fill="#8fb07a" />
      <Rect x={70} y={140} width={3} height={14} fill="#7a5a3c" />
      {/* the one on the left, in a white robe and a cap */}
      <G transform="translate(118 154) scale(1.45)">
        <Path d="M-7 0C-7.5-10-6.5-20-4.5-25Q0-27.5 4.5-25C6.5-20 7.5-10 7 0Z" fill="#f4f0e6" />
        <Circle cx={0.6} cy={-29.5} r={4.3} fill="#e9c9a6" />
        <Path d="M-3.8-31.5Q0.6-36 5-31.5Z" fill="#ffffff" />
        <Path d="M3-23.5Q9-21 13.5-17" stroke="#f4f0e6" strokeWidth={3.2} strokeLinecap="round" fill="none" />
      </G>
      {/* the one on the right, in a blue robe, a head cloth */}
      <G transform="translate(162 154) scale(-1.45 1.45)">
        <Path d="M-7 0C-7.5-10-6.5-20-4.5-25Q0-27.5 4.5-25C6.5-20 7.5-10 7 0Z" fill="#5b6fa8" />
        <Circle cx={0.6} cy={-29.5} r={4.3} fill="#d7b08a" />
        <Path d="M-4.6-29C-5-36 6-36 5.6-29L-5.4-26Z" fill="#e8e4f4" />
        <Path d="M3-23.5Q9-21 13.5-17" stroke="#5b6fa8" strokeWidth={3.2} strokeLinecap="round" fill="none" />
      </G>
      {/* the two hands, joined */}
      <Ellipse cx={140} cy={129} rx={4.2} ry={2.8} fill="#e2bc96" />
      <Path d="M137 128.5Q140 127 143 128.5" stroke="#c99f76" strokeWidth={0.7} fill="none" />
      {[52, 186, 100].map((x, i) => (
        <Circle key={i} cx={x} cy={156 + (i % 2) * 2} r={2} fill="#e98fa3" />
      ))}
    </>
  ),

  // someone sitting cross-legged on a rug, the misbaha (prayer beads) in the hands, a lantern's light
  dhikr: () => (
    <>
      <Sky id="p-dhikr" top="#e4e1ea" mid="#efecea" low="#e8dfcf" />
      <Window x={64} y={50} w={30} h={50} frame="#d6cbb4" light="#fbf3e0" />
      <Lantern x={176} y={56} s={1.1} />
      <Rect x={-10} y={124} width={220} height={80} fill="#cfc3ad" />
      <Path d="M96 128H186L180 142H102Z" fill="#a8383f" />
      <Path d="M102 130H180L176 139H106Z" fill="none" stroke="#e5b65c" strokeWidth={1} />
      <G transform="translate(141 132) scale(1.5)">
        {/* the crossed legs, the body, the head with its scarf */}
        <Ellipse cx={0} cy={-2.5} rx={15} ry={4.5} fill="#2e6a4e" />
        <Path d="M-10-3C-11-14-8-24-5-27Q0-29 5-27C8-24 11-14 10-3Z" fill="#2e6a4e" />
        <Circle cx={0} cy={-31.5} r={4.4} fill="#e9c9a6" />
        <Path d="M-5.4-31C-5.6-38 5.6-38 5.4-31L6.4-26Q0-23.6-6.4-26Z" fill="#f2ede2" />
        {/* the arms down to the hands, together in the lap */}
        <Path d="M-6-24Q-9-14-3-8M6-24Q9-14 3-8" stroke="#245a41" strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <Ellipse cx={0} cy={-8} rx={3.6} ry={2.2} fill="#e2bc96" />
      </G>
      {/* the misbaha hanging from the hands: a loop of beads and its tassel */}
      {Array.from({ length: 15 }, (_, i) => {
        const a = Math.PI * (i / 14);
        return <Circle key={i} cx={141 + Math.cos(a) * 7} cy={121 + Math.sin(a) * 9} r={1.5} fill="#7a4a2c" />;
      })}
      <Path d="M141 130v4" stroke="#c9a24c" strokeWidth={1.4} />
      <Path d="M139.6 134h2.8l0.8 4h-4.4z" fill="#c9a24c" />
    </>
  ),

  // a road winding through hills to the mountains, a small car on it, birds over
  travel: () => (
    <>
      <Sky id="p-travel" top="#c7e5e1" mid="#e8f2ec" low="#f1e9d4" />
      <Path d="M90 104L120 70L140 92L160 66L196 104Z" fill="#b8c7c4" />
      <Path d="M150 74L160 66L168 76Z" fill="#f4f6f4" />
      <Hills far="#d6d3b5" mid="#bfc89f" near="#a3b48a" />
      <Path d="M112 112C118 124 98 132 106 146C112 158 136 166 150 180H182C170 164 140 154 132 142C124 130 140 122 124 112Z" fill="#e6dcc4" />
      <G transform="translate(118 140)">
        <Path d="M0 8V3L4-2H16L20 3V8Z" fill="#c2674a" />
        <Path d="M5-1H15L17 3H3Z" fill="#cfe5ee" />
        <Circle cx={5} cy={9} r={2.4} fill="#3b3b3b" />
        <Circle cx={15} cy={9} r={2.4} fill="#3b3b3b" />
      </G>
      <Path d="M150 54q2.6-2.6 5.2 0q2.6-2.6 5.2 0M164 46q2.2-2.2 4.4 0q2.2-2.2 4.4 0" stroke="#7b8f8a" strokeWidth={1} fill="none" strokeLinecap="round" />
    </>
  ),

  // the Kaaba - black, its gold band and door - in the white courtyard of tawaf, people round it, the
  // Haram's arcades and minarets behind
  hajj: () => (
    <>
      <Sky id="p-hajj" top="#f2d6a2" mid="#f8e9cc" low="#efe1c6" />
      {/* the arcades, two storeys */}
      <Rect x={-10} y={78} width={220} height={44} fill="#eee3ca" />
      {Array.from({ length: 12 }, (_, i) => (
        <G key={i}>
          <Path d={`M${i * 18 - 6} 98V88A6 6 0 0 1 ${i * 18 + 6} 88V98Z`} fill="#d6c39c" />
          <Path d={`M${i * 18 - 6} 120V110A6 6 0 0 1 ${i * 18 + 6} 110V120Z`} fill="#d6c39c" />
        </G>
      ))}
      {[30, 70, 176].map((x) => (
        <G key={x}>
          <Rect x={x - 3} y={40} width={6} height={40} fill="#f1e6cd" />
          <Rect x={x - 4} y={56} width={8} height={2.4} fill="#d6c39c" />
          <Path d={`M${x - 3.4} 40H${x + 3.4}L${x} 30Z`} fill="#3c7c5e" />
        </G>
      ))}
      {/* the courtyard of tawaf */}
      <Rect x={-10} y={122} width={220} height={70} fill="#f6f3ec" />
      <Ellipse cx={120} cy={146} rx={70} ry={18} fill="#ffffff" />
      {/* the Kaaba: its front, its side, its top; the gold band; the door */}
      <Path d="M106 108H134V146H106Z" fill="#141416" />
      <Path d="M134 108L144 104V141L134 146Z" fill="#26262a" />
      <Path d="M106 108L116 104H144L134 108Z" fill="#323236" />
      <Path d="M106 114H134V118H106Z" fill="#c9a24c" />
      <Path d="M134 114L144 110V114L134 118Z" fill="#a8862f" />
      <Path d="M124 124H131V143H124Z" fill="#c9a24c" />
      <Path d="M125.2 125.5H129.8V141.5H125.2Z" fill="#d9b45a" />
      {/* people walking round it */}
      {Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const x = 124 + Math.cos(a) * 46;
        const y = 146 + Math.sin(a) * 12;
        const behind = Math.sin(a) < -0.2 && Math.abs(x - 124) < 22;
        return behind ? null : <Rect key={i} x={x - 1} y={y - 4} width={2} height={4} rx={1} fill={i % 4 ? '#ffffff' : '#d9d2c2'} stroke="#e6dfd0" strokeWidth={0.3} />;
      })}
    </>
  ),

  // a graveyard at dusk: rows of graves - earth mounds, each with its headstone - a low stone wall, the
  // path between them, tall cypresses
  death: () => (
    <>
      <Sky id="p-death" top="#a9acc2" mid="#d2cfd6" low="#e3dccd" />
      <Path d="M-10 108L40 100L90 106L140 96L210 104V200H-10Z" fill="#c6c3b0" />
      {/* the low wall at the back, its gate */}
      <Rect x={-10} y={104} width={220} height={9} fill="#d9cfbb" />
      <Path d="M-10 104H210" stroke="#bfb39b" strokeWidth={1} />
      <Path d="M96 113V102A6 6 0 0 1 108 102V113Z" fill="#8a7d66" />
      {/* the cypresses */}
      {[30, 44, 166, 182].map((x, i) => (
        <G key={x}>
          <Path d={`M${x} 114C${x - 7} 96 ${x - 5} ${74 + (i % 2) * 8} ${x} ${58 + (i % 2) * 10}C${x + 5} ${74 + (i % 2) * 8} ${x + 7} 96 ${x} 114Z`} fill={i % 2 ? '#56704f' : '#4b6446'} />
        </G>
      ))}
      {/* the ground, the path */}
      <Rect x={-10} y={113} width={220} height={90} fill="#b3b597" />
      <Path d="M96 113H108L126 180H78Z" fill="#d8cdb5" />
      {/* the graves in rows, smaller further back */}
      {[
        [56, 122, 0.7], [78, 122, 0.7], [126, 122, 0.7], [148, 122, 0.7], [170, 122, 0.7],
        [40, 140, 0.9], [66, 140, 0.9], [138, 140, 0.9], [164, 140, 0.9],
        [30, 162, 1.1], [60, 162, 1.1], [146, 162, 1.1], [178, 162, 1.1],
      ].map(([x, y, k], i) => (
        <G key={i} transform={`translate(${x} ${y}) scale(${k})`}>
          <Ellipse cx={0} cy={2} rx={11} ry={3.6} fill="#9c8a6c" />
          <Path d="M-11 2Q0-4 11 2Q0 5-11 2Z" fill="#ad9a7a" />
          <Path d="M-14 3V-8A3 3 0 0 1 -8-8V3Z" fill="#ebe6da" />
          <Path d="M-14 3V-8A3 3 0 0 1 -8-8V3Z" fill="none" stroke="#cfc7b6" strokeWidth={0.6} />
        </G>
      ))}
    </>
  ),

  // Ramadan: the evening sky, a large crescent high on the left, a garland of fanous lanterns, the mosque and its minaret
  // on the horizon, and the iftar laid out - dates, a bowl of harira, water and a jug
  fasting: () => (
    <>
      <Sky id="p-fast" top="#2f3566" mid="#6a4f7c" low="#d6977a" />
      <Crescent x={76} y={54} r={9} />
      <Stars points={[[160, 46, 1], [190, 80, 0.8], [176, 30, 0.8], [146, 82, 0.7], [64, 58, 0.7]]} />
      {/* the garland of lanterns across the sky */}
      <Path d="M92 40Q124 64 164 50" stroke="#c9a24c" strokeWidth={0.8} fill="none" />
      <Lantern x={106} y={60} s={1} glow="#ffc87a" />
      <Lantern x={124} y={66} s={1.15} />
      <Lantern x={144} y={64} s={1} glow="#ff9f7a" />
      {/* the mosque and its minaret on the horizon */}
      <G fill="#4a3d5e" transform="translate(0 -18)">
        <Path d="M40 112q14-20 28 0z" />
        <Rect x={38} y={111} width={32} height={10} />
        <Rect x={74} y={86} width={5} height={35} />
        <Path d="M73.4 86l3.1-8 3.1 8z" />
        <Rect x={52} y={113} width={4} height={6} rx={2} fill="#ffd98a" />
      </G>
      <Hills far="#7d5f72" mid="#5f4d68" near="#4b405a" />
      {/* the iftar */}
      <G transform="translate(0 -14)">
      <Ellipse cx={136} cy={148} rx={50} ry={9} fill="#9a6a43" />
      <Ellipse cx={136} cy={146} rx={48} ry={7.5} fill="#b07c52" />
      <Ellipse cx={112} cy={143} rx={13} ry={4} fill="#f1e6d4" />
      {[105, 110, 115, 120].map((x) => (
        <Ellipse key={x} cx={x} cy={141} rx={2.6} ry={1.6} fill="#6b3a24" />
      ))}
      <Path d="M128 140H150Q148 148 139 149Q130 148 128 140Z" fill="#f4efe6" />
      <Ellipse cx={139} cy={140} rx={11} ry={2.4} fill="#c8743f" />
      {[133, 138, 143].map((x) => (
        <Path key={x} d={`M${x} 136q-2-4 0-7`} stroke="#ffffff" strokeWidth={1} fill="none" opacity={0.8} />
      ))}
      <Rect x={156} y={134} width={6} height={10} rx={1.2} fill="#dff0f5" opacity={0.92} />
      <Path d="M166 130H174L176 134V144Q170 146 164 144V134Z" fill="#c9a24c" />
      </G>
    </>
  ),

  // seeking refuge: someone sitting at night before the mushaf on its stand, a lamp's warm light round
  // them, and a dark mist drawing back at the edges
  whisper: () => (
    <>
      <Sky id="p-whisper" top="#2c3348" mid="#3b4258" low="#4a4a58" />
      <Rect x={-10} y={140} width={220} height={60} fill="#3a3a46" />
      {/* the warm light */}
      <Circle cx={132} cy={118} r={46} fill="#ffd98a" opacity={0.12} />
      <Circle cx={132} cy={118} r={30} fill="#ffd98a" opacity={0.14} />
      {/* the dark wisps, going away */}
      {[
        [18, 70, 30, 16],
        [6, 104, 26, 14],
        [36, 92, 18, 10],
        [194, 64, 24, 13],
        [200, 96, 18, 10],
      ].map(([x, y, rx, ry], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#141621" opacity={0.32 - (i % 3) * 0.06} />
      ))}
      {/* the lamp */}
      <Lantern x={168} y={108} s={1.1} />
      {/* the stand and the open mushaf */}
      <Path d="M138 140L154 120M162 140L146 120" stroke="#8a6440" strokeWidth={3} strokeLinecap="round" />
      <Path d="M136 122Q143 116 150 120Q157 116 164 122L162 128Q156 123 150 126Q144 123 138 128Z" fill="#f6efe0" />
      {/* sitting before it */}
      <G transform="translate(116 142) scale(1.4)">
        <Ellipse cx={0} cy={-2.5} rx={12} ry={3.8} fill="#f2efe6" />
        <Path d="M-8-3C-9-13-6-22-3-25Q1-27 5-25C8-22 10-13 9-3Z" fill="#f2efe6" />
        <Circle cx={1} cy={-29.5} r={4.2} fill="#e9c9a6" />
        <Path d="M-4.4-29C-4.6-36 6.6-36 6.4-29L7.2-24.5Q1-22-5.2-24.5Z" fill="#d7dde6" />
        <Path d="M5-22Q11-18 15-14" stroke="#e7e3d8" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      </G>
    </>
  ),

  // a dark wood at night, someone walking with a lantern in a circle of its light
  fear: () => (
    <>
      <Sky id="p-fear" top="#1f2a3a" mid="#2c3a46" low="#3a4650" />
      <Crescent x={60} y={40} r={7} color="#d9d6c4" />
      {[96, 112, 178, 192].map((x, i) => (
        <Path key={x} d={`M${x} 150L${x - 12} 150L${x} ${70 + (i % 2) * 14}L${x + 12} 150Z`} fill={i % 2 ? '#1d2a2c' : '#243336'} />
      ))}
      <Rect x={-10} y={148} width={220} height={60} fill="#1f2a2c" />
      <Circle cx={146} cy={126} r={30} fill="#ffd98a" opacity={0.18} />
      <Ellipse cx={146} cy={150} rx={26} ry={5} fill="#ffd98a" opacity={0.22} />
      <Person x={140} y={150} s={1.25} robe="#6a7f8c" head="#d9b896" scarf="#56697a" />
      <Path d="M146 124L152 126" stroke="#a88a52" strokeWidth={1} />
      <Lantern x={154} y={132} s={0.75} />
    </>
  ),

  // a family close up: the father, the mother in her hijab, two children between them, holding hands, in
  // the garden in the warm light
  family: () => (
    <>
      <Sky id="p-family" top="#f6d6cf" mid="#fae9df" low="#f1e3cb" />
      <Path d="M-40 128C10 116 50 124 90 118C130 112 160 122 240 116V200H-40Z" fill="#c4cda6" />
      <Path d="M-40 150C20 140 70 146 110 142C150 138 190 146 240 142V200H-40Z" fill="#a9bb8e" />
      <Path d="M24 150C22 126 26 110 34 102C44 94 56 102 56 118C56 132 50 144 44 150Z" fill="#8fb07a" />
      <Rect x={38} y={138} width={3} height={14} fill="#7a5a3c" />
      {/* the father, the two children, the mother */}
      <Person x={92} y={164} s={1.9} robe="#f1ece2" />
      <Person x={120} y={164} s={1.15} robe="#5b8fa8" head="#ecd0ad" />
      <Person x={142} y={164} s={1.05} robe="#e98fa3" head="#ecd0ad" scarf="#f2d36b" />
      <Person x={172} y={164} s={1.85} robe="#7d84b6" head="#e3bf9c" scarf="#5b6fa8" />
      {/* their hands joined */}
      <Path d="M100 124Q108 132 114 134M126 134Q131 136 136 136M148 136Q156 134 164 126" stroke="#e9c9a6" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </>
  ),

  // a small house at night under a dome of soft light: kept safe
  protect: () => (
    <>
      <Sky id="p-protect" top="#25335a" mid="#344a6a" low="#46606e" />
      <Crescent x={64} y={42} r={8} />
      <Stars points={[[40, 60, 0.9], [90, 30, 0.8], [180, 40, 0.8], [196, 70, 0.7]]} />
      <Hills far="#2f4552" mid="#2a3d46" near="#22333a" />
      <Path d="M88 148A50 50 0 0 1 188 148Z" fill="#cfe6d8" opacity={0.14} />
      <Path d="M88 148A50 50 0 0 1 188 148" stroke="#bfe0cf" strokeWidth={1.4} fill="none" opacity={0.6} />
      <Rect x={118} y={118} width={40} height={30} fill="#e6dccb" />
      <Path d="M113 120L138 100L163 120Z" fill="#9b5240" />
      <Path d="M133 148V136A5 5 0 0 1 143 136V148Z" fill="#2e6a4e" />
      <Rect x={122} y={126} width={8} height={8} rx={1} fill="#ffd98a" />
      <Rect x={146} y={126} width={8} height={8} rx={1} fill="#ffd98a" />
    </>
  ),

  // with people: a gathering - four sitting together on cushions round a tray of tea, in a warm room
  // with an arched window, talking, one of them pouring
  people: () => (
    <>
      <Sky id="p-people" top="#f1dcc0" mid="#f7ead8" low="#efdcc0" />
      <Window x={110} y={36} w={34} h={46} frame="#d8bf98" light="#fff3d8" />
      <Lantern x={170} y={50} s={1} />
      <Rect x={-10} y={108} width={220} height={100} fill="#c9a57c" />
      <G transform="translate(0 -20)">
      {/* the rug */}
      <Ellipse cx={128} cy={150} rx={86} ry={16} fill="#a8383f" />
      <Ellipse cx={128} cy={150} rx={78} ry={12.5} fill="none" stroke="#e5b65c" strokeWidth={1.1} />
      {/* the two at the back, sitting cross-legged, facing us */}
      {[
        [104, 136, '#2e6a4e', undefined, '#e9c9a6'],
        [152, 136, '#b5566d', '#f2e6d6', '#e3bf9c'],
      ].map(([x, y, robe, scarf, skin], i) => (
        <G key={i} transform={`translate(${x} ${y}) scale(1.25)`}>
          <Ellipse cx={0} cy={-6} rx={9} ry={3.4} fill="#e8c98e" />
          <Ellipse cx={0} cy={-2.5} rx={12} ry={3.8} fill={robe as string} />
          <Path d="M-8-3C-9-13-6-22-3-25Q0-27 3-25C6-22 9-13 8-3Z" fill={robe as string} />
          <Circle cx={0} cy={-29.5} r={4.2} fill={skin as string} />
          {scarf ? (
            <Path d="M-5.2-29C-5.4-36 5.4-36 5.2-29L6-24.5Q0-22-6-24.5Z" fill={scarf as string} />
          ) : (
            <Path d="M-4-31.5Q0-36 4-31.5Z" fill="#ffffff" />
          )}
        </G>
      ))}
      {/* the tray of tea in the middle: the teapot, the glasses */}
      <Ellipse cx={128} cy={150} rx={20} ry={5} fill="#c9a24c" />
      <Ellipse cx={128} cy={149} rx={17} ry={3.8} fill="#e5c06a" />
      <G transform="translate(128 146)">
        <Path d="M-6 2C-8-3-6-8 0-8C6-8 8-3 6 2Z" fill="#d9dde0" />
        <Path d="M-2.4-8Q0-11 2.4-8Z" fill="#b9bfc4" />
        <Path d="M6-4Q11-5 12-9" stroke="#b9bfc4" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </G>
      {[114, 120, 136, 142].map((x) => (
        <Rect key={x} x={x - 1.6} y={143} width={3.2} height={5} rx={0.8} fill="#e9f0f2" opacity={0.9} />
      ))}
      {/* the two at the front, seen from behind and the side, one pouring */}
      <G transform="translate(78 166) scale(1.4)">
        <Ellipse cx={0} cy={-2.5} rx={11} ry={3.6} fill="#5b6fa8" />
        <Path d="M-7-3C-8-12-6-20-3-23Q0-25 3-23C6-20 8-12 7-3Z" fill="#5b6fa8" />
        <Circle cx={0} cy={-27} r={4} fill="#d7b08a" />
        <Path d="M-4.2-26.5C-4.4-33 4.4-33 4.2-26.5L4.8-22Q0-20-4.8-22Z" fill="#e8e4f4" />
        <Path d="M5-18Q12-17 16-14" stroke="#5b6fa8" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      </G>
      <G transform="translate(178 166) scale(1.4)">
        <Ellipse cx={0} cy={-2.5} rx={11} ry={3.6} fill="#f1ece2" />
        <Path d="M-7-3C-8-12-6-20-3-23Q0-25 3-23C6-20 8-12 7-3Z" fill="#f1ece2" />
        <Circle cx={0} cy={-27} r={4} fill="#e9c9a6" />
        <Path d="M-3.8-29Q0-33 3.8-29Z" fill="#ffffff" />
        <Path d="M-5-18Q-11-16-14-13" stroke="#f1ece2" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      </G>
      </G>
    </>
  ),

  // good news and joy: a gift with its ribbon, a bunch of flowers, a tray of sweets and tea, bits of
  // confetti in the warm air
  news: () => (
    <>
      <Sky id="p-news" top="#f9e1bd" mid="#fcefdc" low="#f5e2c6" />
      {[[30, 40, '#e98fa3'], [60, 26, '#8fc4a0'], [96, 44, '#f2c36b'], [150, 30, '#7d9fd0'], [178, 52, '#e98fa3'], [120, 22, '#e5b65c'], [44, 70, '#7d9fd0'], [186, 84, '#f2c36b']].map(([x, y, col], i) => (
        <Rect key={i} x={x as number} y={y as number} width={4} height={2} rx={0.6} fill={col as string} transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
      <Rect x={-10} y={138} width={220} height={60} fill="#e4cfae" />
      <Ellipse cx={100} cy={140} rx={100} ry={6} fill="#d8bf98" />
      {/* the flowers in a vase */}
      <Path d="M52 138C48 128 50 120 56 116H64C70 120 72 128 68 138Z" fill="#7fb3c9" />
      <Path d="M60 116V92M60 110L50 94M60 108L70 90M60 112L48 104M60 112L72 102" stroke="#6d8f5a" strokeWidth={1.3} />
      {[[60, 88, '#e98fa3'], [49, 92, '#f2c36b'], [71, 88, '#ffffff'], [46, 102, '#e98fa3'], [74, 100, '#f2c36b']].map(([x, y, col], i) => (
        <G key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <Circle key={a} cx={(x as number) + Math.cos((a * Math.PI) / 180) * 3} cy={(y as number) + Math.sin((a * Math.PI) / 180) * 3} r={2.3} fill={col as string} />
          ))}
          <Circle cx={x as number} cy={y as number} r={1.6} fill="#c9a24c" />
        </G>
      ))}
      {/* the gift */}
      <Rect x={96} y={108} width={34} height={30} rx={2} fill="#b5566d" />
      <Rect x={93} y={102} width={40} height={9} rx={2} fill="#c76a80" />
      <Rect x={110} y={102} width={6} height={36} fill="#f2c36b" />
      <Path d="M113 102C104 92 98 98 104 102ZM113 102C122 92 128 98 122 102Z" fill="#f2c36b" />
      {/* the tray of sweets and the tea */}
      <Ellipse cx={164} cy={134} rx={26} ry={6} fill="#c9a24c" />
      <Ellipse cx={164} cy={132} rx={23} ry={4.6} fill="#e5c06a" />
      {[150, 158, 166].map((x, i) => (
        <Path key={x} d={`M${x} 131l3-5 3 5z`} fill={i % 2 ? '#f6efe0' : '#d99a55'} />
      ))}
      <Path d="M174 132V124H182V132Z" fill="#e9f0f2" opacity={0.9} />
      <Rect x={174.6} y={126} width={6.8} height={5.4} fill="#c8743f" opacity={0.85} />
    </>
  ),

  // the misbaha hanging from a wooden peg in an arched niche: its 33 amber beads falling in a drop, two
  // gold beads parting them in threes of eleven, the long bead and the gold tassel; a lantern's warm light
  misbaha: () => (
    <>
      <Sky id="p-misbaha" top="#efe2c8" mid="#f7eedc" low="#ecdcc0" />
      {/* the niche, its gold edge */}
      <Path d="M40 180V64A60 60 0 0 1 160 64V180Z" fill="#d9e2cf" />
      <Path d="M40 180V64A60 60 0 0 1 160 64V180" fill="none" stroke="#c9a24c" strokeWidth={1.4} opacity={0.75} />
      <Circle cx={100} cy={84} r={52} fill="#fff6dc" opacity={0.55} />
      <Lantern x={182} y={46} s={1} />
      {/* the peg */}
      <Rect x={94} y={16} width={12} height={6} rx={2} fill="#7a5638" />
      <Circle cx={100} cy={22} r={3.2} fill="#8a6440" />
      {/* the beads */}
      {MISBAHA_BEADS.map(([x, y], i) => {
        const gold = i === 10 || i === 22;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={gold ? 4.8 : 4.2} fill={gold ? '#c9a24c' : '#9a4f26'} />
            <Circle cx={x - 1.2} cy={y - 1.3} r={1.3} fill="#ffffff" opacity={0.4} />
          </G>
        );
      })}
      {/* the long bead, the tassel */}
      <Ellipse cx={100} cy={142} rx={4.6} ry={8} fill="#6e3518" />
      <Ellipse cx={98.8} cy={138.5} rx={1.2} ry={2.8} fill="#ffffff" opacity={0.3} />
      <Circle cx={100} cy={152.5} r={3} fill="#c9a24c" />
      <Path d="M95.5 155H104.5L107.5 174H92.5Z" fill="#c9a24c" />
      <Path d="M97.5 157V173M100 157V174M102.5 157V173" stroke="#a88a3a" strokeWidth={0.8} />
    </>
  ),

  // the books of hadith: a quiet library - a tall bookcase of leather spines (green, red, blue, gold), an
  // arched window, a lantern, and an open book on its stand before them
  library: () => (
    <>
      <Sky id="p-library" top="#efe1c6" mid="#f6ecda" low="#ead9bb" />
      <Window x={62} y={44} w={32} h={54} frame="#d8c7a4" light="#fbf3e0" />
      <Lantern x={36} y={54} s={1} />
      {/* the bookcase */}
      <Rect x={106} y={30} width={88} height={114} rx={2} fill="#8a6440" />
      <Rect x={110} y={34} width={80} height={106} fill="#6f4f32" />
      {[0, 1, 2].map((row) => (
        <G key={row}>
          <Rect x={110} y={66 + row * 36} width={80} height={3} fill="#8a6440" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
            const cols = ['#2e6a4e', '#8a2f43', '#34569a', '#c9a24c', '#5e3a24', '#2e6a4e', '#8a2f43', '#d8c49a', '#34569a'];
            const h = 24 + ((k * 7 + row * 5) % 7);
            const x = 113 + k * 8.6;
            return (
              <G key={k}>
                <Rect x={x} y={66 + row * 36 - h} width={7.4} height={h} rx={0.8} fill={cols[(k + row * 3) % cols.length]} />
                <Rect x={x + 1.4} y={66 + row * 36 - h + 4} width={4.6} height={1.2} fill="#e5c27a" opacity={0.85} />
              </G>
            );
          })}
        </G>
      ))}
      <Rect x={-10} y={144} width={220} height={60} fill="#cdb894" />
      {/* the open book on its stand */}
      <Path d="M54 150L80 128M106 150L80 128" stroke="#8a6440" strokeWidth={3.4} strokeLinecap="round" />
      <Path d="M52 130Q66 122 80 127Q94 122 108 130L105 138Q92 132 80 136Q68 132 55 138Z" fill="#f6efe0" />
      <Path d="M80 127V136" stroke="#d8c7a0" strokeWidth={0.8} />
      <Path d="M58 130Q68 126 76 129M84 129Q92 126 102 130" stroke="#c9b48f" strokeWidth={0.6} fill="none" />
    </>
  ),

  book_bukhari: () => bookPainting('bukhari', '#1d5c47', '#0f3d2f'),
  book_muslim: () => bookPainting('muslim', '#8a2f43', '#561726'),
  book_nawawi: () => bookPainting('nawawi', '#34569a', '#1c3366'),

  // an open book on its stand (a rahl), a soft light over it
  other: () => (
    <>
      <Sky id="p-other" top="#e2e4e6" mid="#efeeea" low="#e6ded0" />
      <Circle cx={140} cy={92} r={40} fill="#fff6dc" opacity={0.7} />
      <Rect x={-10} y={140} width={220} height={60} fill="#cfc3ad" />
      <Path d="M108 150L152 106M172 150L128 106" stroke="#8a6440" strokeWidth={4} strokeLinecap="round" />
      <Path d="M104 112Q122 100 140 108Q158 100 176 112L172 124Q156 114 140 120Q124 114 108 124Z" fill="#f6efe0" />
      <Path d="M140 108V120" stroke="#d8c7a0" strokeWidth={0.8} />
      <Path d="M112 112Q124 106 136 111M144 111Q156 106 168 112" stroke="#c9b48f" strokeWidth={0.6} fill="none" />
    </>
  ),
};

export const hasPainting = (key: string) => key in PAINTINGS;

// whether the painting is a night one (its words drawn light over it)
const NIGHT = new Set(['sleep', 'fasting', 'fear', 'protect', 'whisper']);
export const isNightPainting = (key: string) => NIGHT.has(key);

// `tall`: a whole page - the picture whole at its bottom, its sky going on up
// `ground`: a wide frame (a page's head) - the picture kept to its ground, where its people and things are
export function CategoryPainting({ name, width, height, mirrored, tall, ground }: { name: string; width: number; height: number; mirrored?: boolean; tall?: boolean; ground?: boolean }) {
  const paint = PAINTINGS[name] ?? PAINTINGS.other;
  // a whole page: as wide as the page, the picture whole at the bottom, its sky going on above it
  const sky = tall ? (W * height) / width - H : 0;
  return (
    <Svg width={width} height={height} viewBox={tall ? `0 ${-sky} ${W} ${H + sky}` : `0 0 ${W} ${H}`} preserveAspectRatio={tall ? 'xMidYMax meet' : ground ? 'xMidYMax slice' : 'xMidYMid slice'} style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}>
      {paint()}
    </Svg>
  );
}
