// Where each ayah is on each page (the website's /data/ayah-boxes.json, inside the app: small, and
// needed at once): { page: [{ s, a, boxes: [[x0, y0, x1, y1], ...] }] }, in fractions of the page.
import BOXES_HAFS from '../../assets/data/ayah-boxes-hafs.json';
import BOXES_WARSH from '../../assets/data/ayah-boxes.json';
import { HAFS } from './riwaya.js';

const BOXES = HAFS ? BOXES_HAFS : BOXES_WARSH;

export const ayatOn = (page) => BOXES[page] ?? [];

// The surahs with ayat on a page (604 -> [112, 113, 114])
export const surahsOn = (page) => [...new Set(ayatOn(page).map((e) => e.s))];

// The ayah under a point of the page (fractions of its width and height), or null; a little room
// around each line, as a finger is wider than the words
export function ayahAt(page, fx, fy) {
  const pad = 0.006;
  for (const e of ayatOn(page)) {
    if (e.boxes.some(([x0, y0, x1, y1]) => fx >= x0 - pad && fx <= x1 + pad && fy >= y0 && fy <= y1)) return e;
  }
  return null;
}

// Every ayah in reading order, with the first page it is on: [{ s, a, page }]
const ORDER = [];
const seen = new Set();
for (const page of Object.keys(BOXES).map(Number).sort((x, y) => x - y)) {
  for (const { s, a } of BOXES[page]) {
    const key = `${s}:${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ORDER.push({ s, a, page });
  }
}

// The page of an ayah ("2:255" -> 42), the first one it is on
export const pageOf = (s, a) => ORDER.find((e) => e.s === s && e.a === a)?.page ?? null;

// The ayah before (-1) or after (1) an ayah, with its page; null at either end of the Quran
export function stepAyah(s, a, step) {
  const i = ORDER.findIndex((e) => e.s === s && e.a === a);
  return ORDER[i + step] ?? null;
}
