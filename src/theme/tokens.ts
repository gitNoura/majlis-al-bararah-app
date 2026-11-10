// The app's design tokens: the single place for colours, spacing, corner radii and type roles.
//
// Colour: ONE accent (forest green) and a neutral surface scale, in light and dark (the mode is chosen in
// src/theme/theme.tsx: light, dark or auto = the phone's own).
//   surfaces, from the screen outwards:  screen (the page) < card / surface (raised) < surface2 (a track, a
//   chosen row) < surface3 (a pressed or selected state on surface2)
//   words:  ink (titles, icons) > text (body) > meta (second lines)
//   accent: icons, progress, the chosen state;  on / onInk: a filled button and the words on it
// Some keys (gold, goldStrong, brown, panel, paper, nightDim...) exist only because screens not yet rebuilt
// still read them; gold and goldStrong are now the accent, so no screen shows a second colour.
//
// Type: two roles only (src/theme/fonts.ts): `ui` (Tajawal) and `quran` (Amiri: the Quran's and the hadith's
// Arabic, and nothing decorative).
//
// Spacing: 2 / 4 / 8 / 12 / 16 / 24 / 32, nothing in between.

export const light = {
  screen: '#f6f8f5',
  screenEnd: '#f6f8f5',
  stars: '#9bb8aa', // (the faint stars of the old screens; removed with them)
  line: 'rgba(20, 50, 38, 0.12)', // hairlines
  // words and controls
  ink: '#14261e', // titles, names, icons
  text: '#22332b', // body text
  meta: '#5d6d64', // second lines, quiet words
  tabInk: '#5d6d64',
  gold: '#1f5a45', // = accent (kept for screens not yet rebuilt)
  goldStrong: '#17493a',
  brown: '#44372b',
  // surfaces
  card: '#ffffff',
  soft: 'rgba(20, 50, 38, 0.06)', // tracks, a chosen row, round icon backgrounds
  glass: 'rgba(255, 255, 255, 0.72)', // the round buttons over the page
  divider: 'rgba(20, 50, 38, 0.08)',
  on: '#1f5a45', // a filled button, a chosen tab
  onInk: '#ffffff', // the words on it
  switchOff: '#cfd8d2',
  shadow: 'rgba(20, 50, 38, 0.08)',
  dim: 'rgba(20, 24, 22, 0.12)',
  // the Quran's panels (the index, the tafsir panel)
  panel: '#ffffff',
  surface: '#ffffff',
  pageNum: '#1f5a45',
  accent: '#1f5a45',
  chosenLine: 'rgba(31, 90, 69, 0.4)',
  // the mushaf's paper (the pages' own cream), and how much the night dims the pages
  paper: '#fffce0',
  nightDim: 0,
  // the neutral scale and the accent's tint (new)
  surface2: '#eef2ee',
  surface3: '#e3e9e4',
  accentSoft: 'rgba(31, 90, 69, 0.10)',
};

export type Palette = typeof light;

export const dark: Palette = {
  screen: '#141816',
  screenEnd: '#111412',
  stars: '#6fb597',
  line: 'rgba(255, 255, 255, 0.10)',
  ink: '#f1f5f2',
  text: '#e0e8e3',
  meta: '#9db0a5',
  tabInk: '#9db0a5',
  gold: '#6fb597', // = accent
  goldStrong: '#8fd0b2',
  brown: '#ddd3bb',
  card: '#1c211e',
  soft: 'rgba(255, 255, 255, 0.06)',
  glass: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.07)',
  on: '#2f6650',
  onInk: '#ffffff',
  switchOff: 'rgba(255, 255, 255, 0.18)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  dim: 'rgba(0, 0, 0, 0.2)',
  panel: '#1c211e',
  surface: '#1c211e',
  pageNum: '#8fd0b2',
  accent: '#6fb597',
  chosenLine: 'rgba(143, 208, 178, 0.45)',
  paper: '#d7d0b3',
  nightDim: 0.22, // the pages at 78 % of their brightness
  surface2: '#232925',
  surface3: '#2b322d',
  accentSoft: 'rgba(111, 181, 151, 0.16)',
};

export const space = { hair: 2, xs: 4, sm: 8, cozy: 12, md: 16, lg: 24, xl: 32 } as const;

export const radius = { card: 20, button: 22, chip: 16, sheet: 24 };
