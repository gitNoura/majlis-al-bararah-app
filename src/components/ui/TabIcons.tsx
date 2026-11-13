// The bottom bar's icons: one family of solid glyphs (filled shapes with small cut-outs, no outlines), drawn together on a 24 × 24 grid
// with softly rounded corners. Every tab keeps the same solid icon; the pill behind it and the darker ink show which tab is on.
// (The rest of the app keeps using icons.tsx.)
import type { ReactNode } from 'react';
import Svg, { Circle, G, Defs, Mask, Path, Rect } from 'react-native-svg';

type Props = { color: string; active?: boolean; size?: number };

function Frame({ color, size = 24, children }: Props & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="-2.5 -2.5 29 29" fill={color}>
      {children}
    </Svg>
  );
}

// Home: a solid house with the door cut out of its foot
const HOME = 'M11.3 3.4a1 1 0 0 1 1.4 0l8 6.6a1 1 0 0 1 .3.8V19a2 2 0 0 1-2 2h-3.5a.5.5 0 0 1-.5-.5V15a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5.5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2v-8.2a1 1 0 0 1 .3-.8Z';
export const TabHomeIcon = (p: Props) => (
  <Frame {...p}>
    <Path d={HOME} />
  </Frame>
);

// Quran: a solid open book, two pages with the spine between them
const QURAN_L = 'M11 6.9C9.4 5.7 7.2 5.2 4.6 5.4A1.1 1.1 0 0 0 3.6 6.5v10.9c0 .6.5 1.1 1.1 1 2.4-.2 4.5.3 6.3 1.4Z';
const QURAN_R = 'M13 6.9c1.6-1.2 3.8-1.7 6.4-1.5a1.1 1.1 0 0 1 1 1.1v10.9c0 .6-.5 1.1-1.1 1-2.4-.2-4.5.3-6.3 1.4Z';
export const TabQuranIcon = (p: Props) => (
  <Frame {...p}>
    <Path d={QURAN_L} />
    <Path d={QURAN_R} />
  </Frame>
);

// Memorize: a solid notepad with its lines cut out
const PAD =
  'M6.5 3h11A3.5 3.5 0 0 1 21 6.5v11a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 17.5v-11A3.5 3.5 0 0 1 6.5 3Z M7.5 8.2h9a.9.9 0 0 1 0 1.8h-9a.9.9 0 0 1 0-1.8Z M7.5 11.1h9a.9.9 0 0 1 0 1.8h-9a.9.9 0 0 1 0-1.8Z M7.5 14h5a.9.9 0 0 1 0 1.8h-5a.9.9 0 0 1 0-1.8Z';
export const TabHifdhIcon = (p: Props) => (
  <Frame {...p}>
    <Path d={PAD} fillRule="evenodd" />
  </Frame>
);

// Library: two solid books standing and a third leaning on them
const B1 = 'M4.2 4h2.2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z';
const B2 = 'M10 4h2.2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z';
const B3 = 'M15.6 5.3 17.7 4.7a1 1 0 0 1 1.2.7l3.4 13.6a1 1 0 0 1-.7 1.2l-2.1.6a1 1 0 0 1-1.2-.7L14.9 6.5a1 1 0 0 1 .7-1.2Z';
export const TabLibraryIcon = (p: Props) => (
  <Frame {...p}>
    <Path d={B1} />
    <Path d={B2} />
    <Path d={B3} />
  </Frame>
);

// Settings: a solid gear (six teeth) with its hole cut out
export const TabSettingsIcon = (p: Props) => (
  <Frame {...p}>
    <Defs>
      <Mask id="gearHole">
        <Rect width={24} height={24} fill="#fff" />
        <Circle cx={12} cy={12} r={3} fill="#000" />
      </Mask>
    </Defs>
    <G mask="url(#gearHole)">
      <Circle cx={12} cy={12} r={6.4} />
      {[0, 60, 120].map((a) => (
        <Rect key={a} x={10.2} y={2.6} width={3.6} height={18.8} rx={1.3} transform={`rotate(${a} 12 12)`} />
      ))}
    </G>
  </Frame>
);
