// The bottom bar's icons: one family, drawn together on a 24 × 24 grid (a fine 1.6 stroke, round caps and joins). The chosen tab's icon stays an outline
// (no fill); the pill behind it shows which tab is on. (The rest of the app keeps using icons.tsx.)
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = { color: string; active?: boolean; size?: number };

function Frame({ color, active, size = 24, children, fill }: Props & { children: ReactNode; fill?: (props: { fill: string; fillOpacity: number }) => ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

// Home: a soft-cornered house
const HOME = 'M3.6 10.9 12 3.9l8.4 7V19a1.8 1.8 0 0 1-1.8 1.8H5.4A1.8 1.8 0 0 1 3.6 19Z';
export const TabHomeIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <Path {...f} stroke="none" d={HOME} />}>
    <Path d={HOME} />
  </Frame>
);

// Quran: an open book, two pages and a spine
const QURAN_L = 'M12 7.4C10.4 6 8 5.4 5 5.6v11.9c3-.2 5.4.4 7 1.8Z';
const QURAN_R = 'M12 7.4c1.6-1.4 4-2 7-1.8v11.9c-3-.2-5.4.4-7 1.8Z';
export const TabQuranIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <><Path {...f} stroke="none" d={QURAN_L} /><Path {...f} stroke="none" d={QURAN_R} /></>}>
    <Path d={QURAN_L} />
    <Path d={QURAN_R} />
  </Frame>
);

// Memorize: a notepad with a pencil writing on it. The pad's right edge is left open where the pencil crosses it.
const PAD = 'M17.2 14.2v4a2.4 2.4 0 0 1-2.4 2.4H6a2.4 2.4 0 0 1-2.4-2.4V5.8A2.4 2.4 0 0 1 6 3.4h8.8a2.4 2.4 0 0 1 2.4 2.4v.5';
export const TabHifdhIcon = (p: Props) => (
  <Frame {...p}>
    <Path d={PAD} />
    <Path d="M7 8.2h4.6M7 11.4h4.6M7 14.6h3M7 17.8h1.6" />
    <Path d="M21.06 7.07 18.14 5.33 12.77 14.38 12.6 18 15.69 16.12Z" />
    <Path d="M17.02 7.22 19.94 8.96" />
  </Frame>
);

// Library: two books standing, with bands on their spines, and a third leaning on them
const LEAN = 'M15.2 6.5a1 1 0 0 1 .7-1.2l2.6-.7a1 1 0 0 1 1.2.7l3.2 12.6a1 1 0 0 1-.7 1.2l-2.6.7a1 1 0 0 1-1.2-.7z';
export const TabLibraryIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <><Rect {...f} stroke="none" x={3.5} y={4.5} width={4.2} height={15} rx={1} /><Rect {...f} stroke="none" x={9.3} y={4.5} width={4.2} height={15} rx={1} /><Path {...f} stroke="none" d={LEAN} /></>}>
    <Rect x={3.5} y={4.5} width={4.2} height={15} rx={1} />
    <Rect x={9.3} y={4.5} width={4.2} height={15} rx={1} />
    <Path d={LEAN} />
    <Path d="M3.5 8.5h4.2M3.5 15.5h4.2M9.3 8.5h4.2M9.3 15.5h4.2M16.4 9.4l3.6-.95M18.3 16.9l3.6-.95" />
  </Frame>
);

// Settings: two sliders
export const TabSettingsIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <><Circle {...f} stroke="none" cx={15.5} cy={7} r={2.6} /><Circle {...f} stroke="none" cx={8.5} cy={17} r={2.6} /></>}>
    <Path d="M4 7h8.9M18.1 7H20M4 17h1.9M11.1 17H20" />
    <Circle cx={15.5} cy={7} r={2.6} />
    <Circle cx={8.5} cy={17} r={2.6} />
  </Frame>
);
