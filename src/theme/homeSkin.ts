// The Home screen's own palette (Home only: the Hifdh, Quran and Settings screens keep reading src/theme/home.ts).
//
// The idea: a quiet neutral page, ONE deep forest used as a solid block and as the ink of every progress mark, and ONE
// small spark of marigold that only ever means "this is where you are now" (the next prayer, today, the juz you are
// in). No gradients, no shadows, no second tint: structure comes from scale, space and a single dark block.
//
//   paper    the page            surface  the one white panel (Hifdh)       ink / meta   words
//   forest   the Reading block   forestInk / forestSoft  words on it       bead / beadOn   its 30 juz marks
//   fill     progress marks on paper (forest by day, a lighter green by night)
//   accent   small green words   spark / sparkSoft   the "you are here" marigold
import { useTheme } from './theme';

export type HomeSkin = {
  paper: string;
  surface: string;
  hairline: string;
  ink: string;
  meta: string;
  track: string; // an empty bar or stub
  dotOff: string; // a prayer still to come on the day line
  fill: string; // progress marks on paper
  accent: string; // small green words
  forest: string; // the Reading block
  forestInk: string;
  forestSoft: string;
  bead: string; // an empty juz mark on the forest
  beadOn: string; // a read one
  spark: string; // marigold: where you are now
  sparkSoft: string;
};

const light: HomeSkin = {
  paper: '#f4f5f3',
  surface: '#ffffff',
  hairline: 'rgba(20, 28, 24, 0.1)',
  ink: '#141c18',
  meta: '#5f6b65',
  track: 'rgba(20, 28, 24, 0.09)',
  dotOff: 'rgba(20, 28, 24, 0.28)',
  fill: '#173f32',
  accent: '#1f5a45',
  forest: '#173f32',
  forestInk: '#f7f5ec',
  forestSoft: 'rgba(247, 245, 236, 0.72)',
  bead: 'rgba(247, 245, 236, 0.2)',
  beadOn: '#f7f5ec',
  spark: '#f2b231',
  sparkSoft: 'rgba(242, 178, 49, 0.3)',
};

const dark: HomeSkin = {
  paper: '#121513',
  surface: '#1b201d',
  hairline: 'rgba(255, 255, 255, 0.09)',
  ink: '#eef2ef',
  meta: '#9aa6a0',
  track: 'rgba(255, 255, 255, 0.1)',
  dotOff: 'rgba(255, 255, 255, 0.3)',
  fill: '#6fb597',
  accent: '#7cc2a3',
  forest: '#1c4a3a',
  forestInk: '#f7f5ec',
  forestSoft: 'rgba(247, 245, 236, 0.72)',
  bead: 'rgba(247, 245, 236, 0.18)',
  beadOn: '#f7f5ec',
  spark: '#f2b231',
  sparkSoft: 'rgba(242, 178, 49, 0.3)',
};

export const useSkin = (): HomeSkin => (useTheme().isDark ? dark : light);
