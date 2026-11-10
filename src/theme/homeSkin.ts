// The Home screen's own palette (Home only: the Hifdh, Quran and Settings screens keep reading src/theme/home.ts).
//
// A quiet cool off-white page with ONE deep ink navy (the ink of every progress mark) and ONE bright blue that only ever
// means "this is where you are now" (today, the juz you are in). The two things that are not neutral are the prayer card,
// which wears the sky of the moment, and the Reading block, a deep navy card with off-white ink and an off-white button.
// The navy is the colour that sits well under every one of the five skies (a dark teal, peach, pale blue, tan, and orange
// into plum): it stands apart from the night, answers the warm skies and belongs with the cool ones. The panel under the
// Reading block is a pale tint of that navy, so it echoes the card above it without copying it.
//
//   paper    the page            surface  the pale navy panel (Hifdh)       ink / meta   words
//   fill     progress marks on paper (navy by day, a lighter blue by night)
//   accent   small blue words    spark    the "you are here" blue
//   page*    the Reading block: its navy, its off-white ink, soft ink, frame line, empty marks, current juz
import { useTheme } from './theme';

export type HomeSkin = {
  paper: string;
  surface: string;
  hairline: string;
  ink: string;
  meta: string;
  track: string; // an empty bar or stub
  fill: string; // progress marks on paper
  accent: string; // small blue words
  spark: string; // bright blue: where you are now
  page: string; // the Reading block's navy
  pageInk: string; // its off-white: words, rosette, filled marks, the button
  pageSoft: string;
  pageLine: string; // its frame and rules
  pageBead: string; // an empty juz mark
  pageHere: string; // the juz being read (a light blue, to read on the navy)
};

const PAGE = {
  pageInk: '#fbf8f1',
  pageSoft: 'rgba(251, 248, 241, 0.76)',
  pageLine: 'rgba(251, 248, 241, 0.3)',
  pageBead: 'rgba(251, 248, 241, 0.16)',
  pageHere: '#8fb2f4',
};

const light: HomeSkin = {
  paper: '#f5f6f8',
  surface: '#ebeff6',
  hairline: 'rgba(31, 51, 84, 0.12)',
  ink: '#131b29',
  meta: '#5b6677',
  track: 'rgba(31, 51, 84, 0.1)',
  fill: '#1f3354',
  accent: '#2c4b86',
  spark: '#3f78e0',
  page: '#1f3354',
  ...PAGE,
};

const dark: HomeSkin = {
  paper: '#10131a',
  surface: '#192030',
  hairline: 'rgba(255, 255, 255, 0.09)',
  ink: '#eceff5',
  meta: '#97a2b5',
  track: 'rgba(255, 255, 255, 0.1)',
  fill: '#8fb2f4',
  accent: '#a3bdf5',
  spark: '#5f96f0',
  page: '#243a62',
  ...PAGE,
};

export const useSkin = (): HomeSkin => (useTheme().isDark ? dark : light);
