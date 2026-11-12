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
import { useContext } from 'react';

import { HifdhTintContext } from './home';
import { useTheme } from './theme';
import { dark as darkTokens } from './tokens';

export type HomeSkin = {
  paper: string;
  pill: string; // a small tinted pill on the page (the prayer card's `circle`, on the page itself)
  pillTrack: string; // an empty bar on such a pill
  gold: string; // the section titles: the prayer card's cream-yellow (a deeper gold of it on the light page, where the cream could not be read)
  surface: string;
  soft: string; // the light green of a soft panel (the memorization card)
  softTrack: string; // an empty bar on that soft panel
  softTop: string; // the soft panel's gradient (one flat colour in light mode, a lit top and a deeper bottom in dark)
  softBottom: string;
  softLine: string; // its hairline
  surfaceTop: string; // the white panel's gradient, the same way
  surfaceBottom: string;
  goBg: string; // the round arrow button: its fill...
  goInk: string; // ...and its arrow
  buttonInk: string; // the words on the wide button
  bar: string; // a sage green for the activity bars (softer than the forest, deeper than the soft panel)
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
  pill: 'rgba(23, 63, 50, 0.08)',
  pillTrack: 'rgba(23, 63, 50, 0.14)',
  gold: '#8f6d12',
  surface: '#ffffff',
  soft: '#dce9df',
  softTrack: 'rgba(255, 255, 255, 0.75)',
  softTop: '#dce9df',
  softBottom: '#dce9df',
  softLine: 'transparent',
  surfaceTop: '#ffffff',
  surfaceBottom: '#ffffff',
  goBg: '#173f32',
  goInk: '#ffffff',
  buttonInk: '#173f32',
  bar: '#9cc4ae',
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

// Dark mode is its own design, not the light one turned over: a deep green-black page, panels that are lit at the top and deeper
// below, a real deep forest for the soft panel, and the warm parchment of the Quran's night pages (not a bright mint) for what
// is lit: the ring, today's bar, the wide button. Words are a warm off-white.
const dark: HomeSkin = {
  paper: '#121212',
  pill: 'rgba(255, 255, 255, 0.09)',
  pillTrack: 'rgba(255, 255, 255, 0.16)',
  gold: '#f3e2b0',
  surface: '#1c1c1c',
  surfaceTop: '#232323',
  surfaceBottom: '#191919',
  soft: '#262726',
  softTop: '#2c2d2c',
  softBottom: '#222322',
  softLine: 'rgba(255, 255, 255, 0.06)',
  softTrack: 'rgba(255, 255, 255, 0.12)',
  bar: '#5c6660',
  hairline: 'rgba(255, 255, 255, 0.08)',
  ink: '#eeeeea',
  meta: '#a3a39d',
  track: 'rgba(255, 255, 255, 0.1)',
  fill: '#e9dfbd', // what is lit: the parchment of the Quran's night pages
  accent: '#b4c8b8',
  spark: '#a8c4ae',
  page: darkTokens.paper,
  pageInk: '#ece8dc',
  pageSoft: 'rgba(236, 232, 220, 0.66)',
  pageLine: 'rgba(255, 255, 255, 0.14)',
  pageBead: 'rgba(255, 255, 255, 0.1)',
  pageHere: '#a8c4ae',
  pageButton: '#ece4c8',
  goBg: '#343635',
  goInk: '#ece4c8',
  buttonInk: '#1d1d1d',
};

// The Hifdh tab in dark mode: a forest-green page and panels, with gold for what is lit (see HifdhTint in home.ts)
const hifdhDark: Partial<HomeSkin> = {
  // only hints: the page and the white panel stay the same grey as Home; the soft panel is barely green, what is lit is gold
  soft: '#252a27',
  softTop: '#2a302c',
  softBottom: '#222623',
  softLine: 'rgba(228, 196, 109, 0.14)',
  bar: '#56665d',
  fill: '#e4c46d',
  accent: '#a9cdb8',
  spark: '#b5dcc0',
  goBg: '#33403a',
};

export const useSkin = (): HomeSkin => {
  const isDark = useTheme().isDark;
  const tint = useContext(HifdhTintContext);
  return isDark ? (tint ? { ...dark, ...hifdhDark } : dark) : light;
};
