// The ayah index of Hifdh: every ayah has a position (0-6213) in mushaf order, so a range is just
// two numbers. Positions and keys ("2:255") are in WARSH numbering, the same as the notes and the
// highlights (src/core/ayahmap.js converts a tapped Hafs key into the Warsh keys that hold it).
import { AHZAB } from '../quran.js';

// Ayat in each surah, Warsh numbering (the sum is 6214). Same as public/data/surah/N.json.
export const COUNTS = [
  7, 285, 200, 175, 122, 167, 206, 76, 130, 109, 121, 111, 44, 54, 99, 128, 110, 105, 99, 134, 111, 76, 119, 62, 77, 226,
  95, 88, 69, 59, 33, 30, 73, 54, 46, 82, 182, 86, 72, 84, 53, 50, 89, 56, 36, 34, 39, 29, 18, 45, 60, 47, 61, 55, 77, 99,
  28, 21, 24, 13, 14, 11, 11, 18, 12, 12, 31, 52, 52, 44, 30, 28, 18, 55, 39, 31, 50, 40, 45, 42, 29, 19, 36, 25, 22, 17,
  19, 26, 32, 20, 15, 21, 11, 8, 8, 20, 5, 8, 9, 11, 10, 8, 3, 9, 5, 5, 6, 3, 6, 3, 5, 4, 5, 6,
];

export const TOTAL = COUNTS.reduce((a, b) => a + b, 0);

// START[s - 1]: the position of the first ayah of surah s
const START = COUNTS.map((_, i) => COUNTS.slice(0, i).reduce((a, b) => a + b, 0));

// "2:255" -> position, and back
export const ordOf = (key) => {
  const [s, a] = key.split(':').map(Number);
  return START[s - 1] + a - 1;
};
export function keyOf(ord) {
  const s = surahOf(ord);
  return `${s}:${ord - START[s - 1] + 1}`;
}
export function surahOf(ord) {
  let lo = 0;
  let hi = 113;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (START[mid] <= ord) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
export const ayahOf = (ord) => ord - START[surahOf(ord) - 1] + 1;

// Ranges are [first, last] positions, both included.
export const surahRange = (s) => [START[s - 1], START[s - 1] + COUNTS[s - 1] - 1];

// A hizb starts at the ayah told by AHZAB (src/reader/quran.js) and ends before the next one.
function hizbRange(n) {
  const first = ordOf(`${AHZAB[n - 1].surah}:${AHZAB[n - 1].ayah}`);
  const last = n < 60 ? ordOf(`${AHZAB[n].surah}:${AHZAB[n].ayah}`) - 1 : TOTAL - 1;
  return [first, last];
}
// A juz is two ahzab.
export const juzRange = (n) => [hizbRange(n * 2 - 1)[0], hizbRange(n * 2)[1]];

// The surahs that have at least one ayah inside [a, b], each with the part of it that is inside.
export function surahsIn(a, b) {
  const list = [];
  for (let s = surahOf(a); s <= surahOf(b); s++) {
    const [x, y] = surahRange(s);
    list.push({ surah: s, range: [Math.max(a, x), Math.min(b, y)] });
  }
  return list;
}
