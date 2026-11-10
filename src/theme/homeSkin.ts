// The Home screen's own palette (Home only: the Hifdh, Quran and Settings screens keep reading src/theme/home.ts).
//
// A quiet neutral page with ONE deep forest (the ink of every progress mark) and ONE fresher green that only ever means "this
// is where you are now" (today, the juz you are in). The two things that are not neutral are the prayer card, which wears the
// sky of the moment, and the Reading block, a small off-white page with forest ink and a white button.
//
//   paper    the page            surface  the one white panel (Hifdh)       ink / meta   words
//   fill     progress marks on paper (forest by day, a lighter green by night)
//   accent   small green words   spark    the "you are here" green
//   page*    the Reading block: its off-white, ink, soft ink, frame line, empty marks, current juz, button
import { useTheme } from './theme';
import { dark as darkTokens } from './tokens';

export type HomeSkin = {
  paper: string;
  surface: string;
  hairline: string;
  ink: string;
  meta: string;
  track: string; // an empty bar or stub
  fill: string; // progress marks on paper
  accent: string; // small green words
  spark: string; // a fresher green: where you are now
  page: string; // the Reading block's off-white
  pageInk: string;
  pageSoft: string;
  pageLine: string; // its frame and rules, and the edge of its button
  pageBead: string; // an empty juz mark
  pageHere: string; // the juz being read (a fresher green, to read beside the forest ones)
  pageButton: string; // the white button
};

const PAGE = { pageInk: '#173f32', pageLine: 'rgba(23, 63, 50, 0.32)', pageBead: 'rgba(23, 63, 50, 0.14)', pageButton: '#ffffff' };

const light: HomeSkin = {
  paper: '#f4f5f3',
  surface: '#ffffff',
  hairline: 'rgba(20, 28, 24, 0.1)',
  ink: '#141c18',
  meta: '#5f6b65',
  track: 'rgba(20, 28, 24, 0.09)',
  fill: '#173f32',
  accent: '#1f5a45',
  spark: '#2a9266',
  page: '#f9f7ee',
  pageSoft: 'rgba(23, 63, 50, 0.74)',
  pageHere: '#2a9266',
  ...PAGE,
};

const dark: HomeSkin = {
  paper: '#121513',
  surface: '#1b201d',
  hairline: 'rgba(255, 255, 255, 0.09)',
  ink: '#eef2ef',
  meta: '#9aa6a0',
  track: 'rgba(255, 255, 255, 0.1)',
  fill: '#6fb597',
  accent: '#7cc2a3',
  spark: '#4fbf8a',
  page: darkTokens.paper,
  pageSoft: 'rgba(23, 63, 50, 0.8)',
  pageHere: '#1f7a52',
  ...PAGE,
};

export const useSkin = (): HomeSkin => (useTheme().isDark ? dark : light);
