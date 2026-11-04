// The app's colours, by day and by night: the same palette as the website (its tokens.css and the
// --ix-* palette of drawer.css), so the two look alike. Fonts: Amiri for titles and Quranic text,
// Tajawal for the interface (src/theme/fonts.ts).

export const light = {
  // the screen: ivory fading a little towards the bottom, faint stars over it
  screen: '#f7f2e7',
  screenEnd: '#f1e7d4',
  stars: '#c5a15a', // the stars' lines (drawn very faint)
  line: '#e8ddc7', // hairlines
  // words and controls: forest green; gold only as an accent
  ink: '#173f32', // titles, names, icons
  text: '#26372f', // body text
  meta: '#a48a50', // second lines, quiet words
  tabInk: '#70552b',
  gold: '#c5a15a',
  goldStrong: '#b8913a',
  brown: '#44372b',
  // surfaces
  card: '#ffffff',
  soft: '#f7f2e7', // tracks, a chosen row, round icon backgrounds
  glass: 'rgba(255, 252, 245, 0.6)', // the floating bottom panel, round top buttons
  divider: '#eeeae2',
  on: '#173f32', // a chosen tab, a main button
  onInk: '#ffffff',
  switchOff: '#d8d0bd',
  shadow: 'rgba(68, 55, 43, 0.08)',
  dim: 'rgba(25, 24, 19, 0.12)',
  // the Quran's panels (the website's --ix-* palette: the index, the tafsir panel)
  panel: '#fffefa',
  surface: '#ffffff',
  pageNum: '#70552b',
  accent: '#173f32', // the bar on the chosen row's edge
  chosenLine: '#dcc99d',
  // the mushaf's paper (the pages' own cream), and how much the night dims the pages
  paper: '#fffce0',
  nightDim: 0,
};

export type Palette = typeof light;

export const dark: Palette = {
  screen: '#222523',
  screenEnd: '#1b1e1c',
  stars: '#c5a15a',
  line: 'rgba(255, 255, 255, 0.1)',
  ink: '#ece3cc',
  text: '#ddd3bb',
  meta: '#c2a971',
  tabInk: '#cdbf9f',
  gold: '#c5a15a',
  goldStrong: '#d9bd84',
  brown: '#ddd3bb',
  card: 'rgba(44, 47, 45, 0.92)',
  soft: 'rgba(255, 255, 255, 0.06)',
  glass: 'rgba(255, 255, 255, 0.07)',
  divider: 'rgba(255, 255, 255, 0.06)',
  on: '#2f6650',
  onInk: '#ffffff',
  switchOff: 'rgba(255, 255, 255, 0.18)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  dim: 'rgba(0, 0, 0, 0.2)',
  panel: '#1f2221',
  surface: '#262927',
  pageNum: '#d9bd84',
  accent: '#c5a15a',
  chosenLine: 'rgba(197, 161, 90, 0.45)',
  paper: '#d7d0b3',
  nightDim: 0.22, // the pages at 78 % of their brightness, as on the website
};

export const radius = { card: 20, button: 22, chip: 16 };
