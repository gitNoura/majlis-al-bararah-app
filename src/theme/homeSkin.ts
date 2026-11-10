// The Home screen's own palette (Home only: the Hifdh, Quran and Settings screens keep reading src/theme/home.ts).
//
// A quiet neutral page with ONE deep forest (the ink of every progress mark) and ONE marigold that only ever means "this is
// where you are now" (today, the juz you are in). The two things that are not neutral are the prayer card, which wears the
// sky of the moment, and the Reading block, which is a mushaf page: the Quran tab's own paper (src/theme/tokens.ts: the
// pages' cream) with forest ink, so Home's block looks like the page it opens.
//
//   paper    the page            surface  the one white panel (Hifdh)       ink / meta   words
//   fill     progress marks on paper (forest by day, a lighter green by night)
//   accent   small green words   spark / sparkSoft   the "you are here" marigold
//   page*    the mushaf page of the Reading block: its paper, ink, soft ink, frame line, empty marks, current juz
import { useTheme } from './theme';
import { dark as darkTokens, light as lightTokens } from './tokens';

export type HomeSkin = {
  paper: string;
  surface: string;
  hairline: string;
  ink: string;
  meta: string;
  track: string; // an empty bar or stub
  fill: string; // progress marks on paper
  accent: string; // small green words
  spark: string; // marigold: where you are now
  page: string; // the mushaf page
  pageInk: string;
  pageSoft: string;
  pageLine: string; // its frame and rules
  pageBead: string; // an empty juz mark
  pageHere: string; // the juz being read (a deeper marigold, to read on cream)
};

const PAGE = { pageInk: '#173f32', pageLine: 'rgba(23, 63, 50, 0.32)', pageBead: 'rgba(23, 63, 50, 0.14)', pageHere: '#b9770e' };

const light: HomeSkin = {
  paper: '#f4f5f3',
  surface: '#ffffff',
  hairline: 'rgba(20, 28, 24, 0.1)',
  ink: '#141c18',
  meta: '#5f6b65',
  track: 'rgba(20, 28, 24, 0.09)',
  fill: '#173f32',
  accent: '#1f5a45',
  spark: '#f2b231',
  page: lightTokens.paper,
  pageSoft: 'rgba(23, 63, 50, 0.74)',
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
  spark: '#f2b231',
  page: darkTokens.paper,
  pageSoft: 'rgba(23, 63, 50, 0.8)',
  ...PAGE,
};

export const useSkin = (): HomeSkin => (useTheme().isDark ? dark : light);
