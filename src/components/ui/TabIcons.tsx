// The bottom bar's icons: one family, drawn together on a 24 × 24 grid (1.8 stroke, round caps and joins). The chosen tab's icon also
// gets a soft fill of its own colour, so it reads as "on" without changing shape. (The rest of the app keeps using icons.tsx.)
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = { color: string; active?: boolean; size?: number };

function Frame({ color, active, size = 24, children, fill }: Props & { children: ReactNode; fill: (props: { fill: string; fillOpacity: number }) => ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {active && fill({ fill: color, fillOpacity: 0.18 })}
      {children}
    </Svg>
  );
}

// Home: a house with its door
const HOME = 'M4 11.4 12 4.2l8 7.2V19a1.5 1.5 0 0 1-1.5 1.5H15v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5H5.5A1.5 1.5 0 0 1 4 19v-7.6Z';
export const TabHomeIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <Path {...f} stroke="none" d={HOME} />}>
    <Path d={HOME} />
  </Frame>
);

// Quran: an open book
const QURAN = 'M12 6.6C10.2 5.2 7.6 4.6 4.5 5v12.6c3.1-.4 5.7.2 7.5 1.6 1.8-1.4 4.4-2 7.5-1.6V5c-3.1-.4-5.7.2-7.5 1.6Z';
export const TabQuranIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <Path {...f} stroke="none" d={QURAN} />}>
    <Path d={QURAN} />
    <Path d="M12 6.6v12.6" />
  </Frame>
);

// Memorize: a closed book with a ribbon marking where you are
const BOOK = 'M7.5 3.8h9A1.5 1.5 0 0 1 18 5.3v13.4a1.5 1.5 0 0 1-1.5 1.5h-9A2 2 0 0 1 5.5 18.2V5.8a2 2 0 0 1 2-2Z';
export const TabHifdhIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <Path {...f} stroke="none" d={BOOK} />}>
    <Path d={BOOK} />
    <Path d="M13.5 3.8v5.4l2-1.3 2 1.3V3.8" />
    <Path d="M9 8.5h1.5M9 12h5.5" />
  </Frame>
);

// Library: three books on a shelf, the last one leaning
export const TabLibraryIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <><Rect {...f} stroke="none" x={4.5} y={4.5} width={4} height={15} rx={1} /><Rect {...f} stroke="none" x={10.5} y={4.5} width={4} height={15} rx={1} /></>}>
    <Rect x={4.5} y={4.5} width={4} height={15} rx={1} />
    <Rect x={10.5} y={4.5} width={4} height={15} rx={1} />
    <Path d="m16.6 6.2 2.9-.8 3.1 12.3-2.9.8z" />
  </Frame>
);

// Settings: two sliders
export const TabSettingsIcon = (p: Props) => (
  <Frame {...p} fill={(f) => <><Circle {...f} stroke="none" cx={15.5} cy={7} r={2.4} /><Circle {...f} stroke="none" cx={8.5} cy={17} r={2.4} /></>}>
    <Path d="M4 7h9.1M17.9 7H20M4 17h2.1M10.9 17H20" />
    <Circle cx={15.5} cy={7} r={2.4} />
    <Circle cx={8.5} cy={17} r={2.4} />
  </Frame>
);
