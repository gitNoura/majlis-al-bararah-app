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
  wash: readonly [string, string, string]; // Home's page: Home's own off-white (top, middle, bottom) for the glass to sit on
  glass: string; // the cards' fill
  glassShadow: string; // and their soft shadow (neutral)
  cardShadow: string; // the cards' raised look: a tight, a middle and a wide soft shadow, stacked
  glassTop: string; // a card's gradient: its lit top...
  glassBottom: string; // ...and its slightly deeper bottom (a little dimension)
  vivid: string; // the ring and the reading bar: a fresh emerald-teal
  halo: string; // the soft glow around them
  tabBar: string; // the bottom bar's own surface (solid, so the page never shows through it)
  glassTrack: string; // an empty progress bar inside a glass card
  glassBtn: string; // the round arrow button inside a glass card
  well: string; // the Hifdh page's empty chips: the top tabs' track, a day not kept, the listen / recite buttons (a clean tint, never a grey wash)
  mark: string; // Home's progress bars and today's activity bar: a neutral charcoal (parchment at night), no green
  markSoft: string; // the other days' activity bars
  hue: string; // the progress bars, and today's activity bar (a neutral charcoal in light mode, parchment in dark)
  hueSoft: string; // its paler partner: the other active days' bars
  hueDeep: string; // a deeper, quieter shade of it: the hadith's words
  glow: string; // the soft halo around the green progress bars and today's activity bar
  glowOpacity: number;
  doneBg: string; // a card whose work is finished: a light green fill...
  doneLine: string; // ...and its green edge
};

const PAGE = { pageInk: '#173f32', pageLine: 'rgba(23, 63, 50, 0.32)', pageBead: 'rgba(23, 63, 50, 0.14)', pageButton: '#ffffff' };

const light: HomeSkin = {
  paper: '#f4f5f3',
  pill: 'rgba(9, 74, 61, 0.08)',
  pillTrack: 'rgba(9, 74, 61, 0.14)',
  surface: '#ffffff',
  soft: '#dce9df',
  softTrack: 'rgba(255, 255, 255, 0.75)',
  softTop: '#dce9df',
  softBottom: '#dce9df',
  softLine: 'transparent',
  surfaceTop: '#ffffff',
  surfaceBottom: '#ffffff',
  goBg: '#094A3D',
  goInk: '#ffffff',
  buttonInk: '#094A3D',
  bar: '#9cc4ae',
  hairline: 'rgba(20, 28, 24, 0.1)',
  ink: '#141c18',
  meta: '#5f6b65',
  track: 'rgba(20, 28, 24, 0.09)',
  fill: '#094A3D',
  accent: '#0C5A49',
  spark: '#0F6B58',
  page: '#f9f7ee',
  pageSoft: 'rgba(23, 63, 50, 0.74)',
  pageHere: '#0F6B58',
  wash: ['#f1f2ef', '#f4f5f3', '#f4f5f3'], // Home's own off-white (paper)
  glass: '#ffffff',
  glassShadow: 'rgba(0, 0, 0, 0.07)',
  cardShadow: '0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 10px rgba(0, 0, 0, 0.05), 0px 14px 28px rgba(0, 0, 0, 0.07)',
  glassTop: '#ffffff',
  glassBottom: '#eef0ec',
  vivid: '#12A88A', // (light mode takes the prayer card's sky instead: components/home/useSkyAccent.ts)
  halo: 'rgba(18, 168, 138, 0.5)',
  tabBar: '#ffffff',
  glassTrack: 'rgba(9, 74, 61, 0.12)',
  glassBtn: 'rgba(255, 255, 255, 0.92)',
  well: '#eeeeea', // a neutral off-white, the page's own: no tint
  mark: '#2e3230',
  markSoft: '#b4b7b3',
  hue: '#2e3230', // the progress bars and today's activity bar: a neutral charcoal in light mode, no green
  hueSoft: '#c4c7c3', // the other active days' bars
  hueDeep: '#094A3D',
  glow: '#2e3230',
  glowOpacity: 0.07,
  doneBg: '#f6f6f3', // light mode: a finished card only slips a shade from white, with a neutral edge
  doneLine: 'rgba(20, 28, 24, 0.14)',
  ...PAGE,
};

// Dark mode is its own design, not the light one turned over: a deep green-black page, panels that are lit at the top and deeper
// below, a real deep forest for the soft panel, and the warm parchment of the Quran's night pages (not a bright mint) for what
// is lit: the ring, today's bar, the wide button. Words are a warm off-white.
const dark: HomeSkin = {
  paper: '#121212',
  pill: 'rgba(255, 255, 255, 0.09)',
  pillTrack: 'rgba(255, 255, 255, 0.16)',
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
  accent: '#ece4c8',
  spark: '#e9dfbd',
  page: darkTokens.paper,
  pageInk: '#ece8dc',
  pageSoft: 'rgba(236, 232, 220, 0.66)',
  pageLine: 'rgba(255, 255, 255, 0.14)',
  pageBead: 'rgba(255, 255, 255, 0.1)',
  pageHere: '#e9dfbd',
  pageButton: '#ece4c8',
  wash: ['#141414', '#151515', '#151515'], // near-black
  glass: '#202020', // solid: a sheet or the bar never shows the page through it

  glassShadow: 'rgba(0, 0, 0, 0.35)',
  cardShadow: '0px 1px 2px rgba(0, 0, 0, 0.30), 0px 6px 14px rgba(0, 0, 0, 0.25), 0px 16px 32px rgba(0, 0, 0, 0.30)',
  glassTop: 'rgba(255, 255, 255, 0.08)',
  glassBottom: 'rgba(255, 255, 255, 0.015)',
  vivid: '#e9dfbd',
  halo: 'rgba(233, 223, 189, 0.5)',
  tabBar: '#202020',
  glassTrack: 'rgba(255, 255, 255, 0.14)',
  glassBtn: 'rgba(255, 255, 255, 0.12)',
  well: 'rgba(255, 255, 255, 0.16)',
  mark: '#e9dfbd',
  markSoft: '#5c6660',
  hue: '#e9dfbd', // dark mode: a deeper light green
  hueSoft: 'rgba(236, 228, 200, 0.35)',
  hueDeep: '#cfc6a3',
  glow: '#ece4c8',
  glowOpacity: 0.12,
  doneBg: '#262626', // dark mode: a finished card stays neutral (no green), edged in the parchment
  doneLine: 'rgba(233, 223, 189, 0.28)',
  goBg: '#343635',
  goInk: '#ece4c8',
  buttonInk: '#1d1d1d',
};

// (unused since the Hifdh tab wears Home's dark look)
const hifdhDark: Partial<HomeSkin> = {
  // only hints: the page and the white panel stay the same grey as Home; the soft panel is barely green, what is lit is gold
  soft: '#252a27',
  softTop: '#2a302c',
  softBottom: '#222623',
  softLine: 'rgba(236, 228, 200, 0.14)',
  bar: '#8f8a73',
  fill: '#e9dfbd',
  accent: '#ece4c8',
  spark: '#e9dfbd',
  goBg: '#3a3832',
};

// The Hifdh tab in light mode: no pale green anywhere, just neutral greys and white (dark mode is Home's own)
const hifdhLight: Partial<HomeSkin> = {
  soft: '#ebecea',
  softTop: '#ebecea',
  softBottom: '#ebecea',
  pill: 'rgba(20, 28, 24, 0.06)',
  pillTrack: 'rgba(20, 28, 24, 0.12)',
  glassTrack: 'rgba(20, 28, 24, 0.1)',
};

export const useSkin = (): HomeSkin => {
  const isDark = useTheme().isDark;
  const tint = useContext(HifdhTintContext);
  void tint; // (the neutral Hifdh look is now every page's light look)
  return isDark ? dark : { ...light, ...hifdhLight };
};
