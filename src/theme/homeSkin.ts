// The Home screen's own palette (Home only: the Hifdh, Quran and Settings screens keep reading src/theme/home.ts).
//
// A quiet neutral page with ONE deep forest (the ink of every progress mark) and ONE marigold that only ever means "this is
// where you are now" (today). The two things that are not neutral are the prayer card, which wears the sky of the moment, and
// the wird card, which is a single muted gold. The sky changes five times a day (night, dawn, midday, afternoon, sunset: a
// deep teal, peach, pale blue, tan, orange and plum) and the gold is the one colour that sits well under every one of them:
// pale straws vanish into the dawn and the afternoon, a mustard is heavy at midday, and this champagne gold stays yellow, soft
// and clearly apart from the sky above it. Its words are a warm umber, not green.
//
//   paper    the page                      ink / meta   words
//   hairline the rule above a section      track        an empty bar or stub
//   fill     progress marks on paper (forest by day, a lighter green by night)
//   accent   small green words             spark        the "you are here" marigold
//   wird*    the wird card: its gold, its umber ink, its soft ink, its empty line
import { useTheme } from './theme';

export type HomeSkin = {
  paper: string;
  hairline: string;
  ink: string;
  meta: string;
  track: string; // an empty bar or stub
  fill: string; // progress marks on paper
  accent: string; // small green words
  spark: string; // marigold: where you are now
  wird: string; // the wird card's gold
  wirdInk: string; // its words and its button
  wirdSoft: string; // its quiet words
  wirdTrack: string; // the empty part of its khatma line
};

const WIRD = { wirdInk: '#2f2610', wirdSoft: '#54482a', wirdTrack: 'rgba(47, 38, 16, 0.16)' };

const light: HomeSkin = {
  paper: '#f4f5f3',
  hairline: 'rgba(20, 28, 24, 0.1)',
  ink: '#141c18',
  meta: '#5f6b65',
  track: 'rgba(20, 28, 24, 0.09)',
  fill: '#173f32',
  accent: '#1f5a45',
  spark: '#f2b231',
  wird: '#ead797',
  ...WIRD,
};

const dark: HomeSkin = {
  paper: '#121513',
  hairline: 'rgba(255, 255, 255, 0.09)',
  ink: '#eef2ef',
  meta: '#9aa6a0',
  track: 'rgba(255, 255, 255, 0.1)',
  fill: '#6fb597',
  accent: '#7cc2a3',
  spark: '#f2b231',
  wird: '#d8c585', // a shade deeper at night, so it does not glare
  ...WIRD,
};

export const useSkin = (): HomeSkin => (useTheme().isDark ? dark : light);
