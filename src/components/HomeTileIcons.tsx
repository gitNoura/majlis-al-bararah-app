// The home screen's four tiles' icons: plain line icons in the tile's ink, as the app's other icons -
// the Quran (an open book), memorization (a book with a bookmark), testing (a clipboard with a tick),
// the majalis (two people).
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { ink: string; size?: number };

const Frame = ({ ink, size = 26, children }: { ink: string; size?: number; children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const QuranTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Path d="M12 7C10.2 5.6 7.6 5 4 5.2V18.2C7.6 18 10.2 18.6 12 20C13.8 18.6 16.4 18 20 18.2V5.2C16.4 5 13.8 5.6 12 7Z" />
    <Path d="M12 7V20" />
  </Frame>
);

export const MemorizeTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Path d="M5 19.5V5.5A2.5 2.5 0 0 1 7.5 3H19V21H7.5A2.5 2.5 0 0 1 5 18.5" />
    <Path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H19" />
    <Path d="M11 3V10L13 8.5L15 10V3" />
  </Frame>
);

export const TestTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Rect x={5} y={4.5} width={14} height={16.5} rx={2} />
    <Path d="M9 3H15V6H9Z" />
    <Path d="M9 13.5L11 15.5L15 11.5" />
  </Frame>
);

export const MajalisTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Circle cx={9} cy={8} r={3.2} />
    <Path d="M3 20C3 16.7 5.7 14.5 9 14.5C12.3 14.5 15 16.7 15 20" />
    <Path d="M16 5.2A3.2 3.2 0 0 1 16 11.4M17.5 14.7C19.6 15.3 21 17.3 21 20" />
  </Frame>
);
