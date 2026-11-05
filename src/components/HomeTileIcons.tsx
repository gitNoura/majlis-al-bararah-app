// The home screen's four tiles' icons: plain line icons in the tile's ink, as the app's other icons -
// the Quran (an open book), memorization (a heart: what is kept in the heart), testing (a microphone: recitation),
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
    <Path d="M12 20.5C12 20.5 3.5 15.4 3.5 9.2A4.7 4.7 0 0 1 12 6.6A4.7 4.7 0 0 1 20.5 9.2C20.5 15.4 12 20.5 12 20.5Z" />
  </Frame>
);

export const TestTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Rect x={9} y={3} width={6} height={11} rx={3} />
    <Path d="M5.5 11.5C5.5 15.4 8.4 18 12 18C15.6 18 18.5 15.4 18.5 11.5" />
    <Path d="M12 18V21M9 21H15" />
  </Frame>
);

export const MajalisTileIcon = ({ ink, size }: P) => (
  <Frame ink={ink} size={size}>
    <Circle cx={9} cy={8} r={3.2} />
    <Path d="M3 20C3 16.7 5.7 14.5 9 14.5C12.3 14.5 15 16.7 15 20" />
    <Path d="M16 5.2A3.2 3.2 0 0 1 16 11.4M17.5 14.7C19.6 15.3 21 17.3 21 20" />
  </Frame>
);
