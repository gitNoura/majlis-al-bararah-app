// «Recite» (تسميع): the page is covered and shows itself back one ayah at a time (play) or one word at a time
// (the bulb), as the reader says it from memory (the way Murajaa's Tasmee does); the eye hides or shows
// everything. This file is the logic; the screen is components/hifdh/ReciteScreen.tsx.
//
// The mushaf is a picture, and the app only knows where each ayah is (src/lib/boxes.js: one box per line the
// ayah touches). A hidden ayah is covered whole, except its number circle, so no word can be missed. Only
// while its words are shown one by one does it need to know where each word is: the ayah's text (from the
// website's data) is cut into words, each gets a share of the ayah's boxes in proportion to its letters, and
// the edges are moved to the real gaps read from the page's picture (./ink.ts).
import { ayatOn, pageOf } from '../boxes.js';
import { fetchData } from '../remote.js';
import { HAFS } from '../riwaya.js';
import { markBox, markEnd, RING_W, snapX } from './ink';

const parse = (key) => key.split(':').map(Number);

// ---------- Words ----------

// Arabic letters only (no marks, no tatweel): what takes room on the line
const LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u06FA-\u06FF]/g;
const letters = (word) => (word.match(LETTER) || []).length;
const SPACE = 0.7; // the space after a word, in letters
const END_MARK = 1.8; // the ayah's number circle, in letters

const textCache = new Map();

// The words of an ayah, in reading order (the text the website holds for the narration that is open)
export async function wordsOf(key) {
  const [surah, ayah] = parse(key);
  if (!textCache.has(surah)) {
    const request = fetchData(`${HAFS ? 'surah-hafs' : 'surah'}/${surah}`);
    request.catch(() => textCache.delete(surah));
    textCache.set(surah, request);
  }
  const list = await textCache.get(surah);
  const entry = list.find((x) => x.ayah === ayah);
  const text = entry ? entry.text.replace(/[\s\u00a0]*[٠-٩0-9]+$/, '') : '';
  return text.split(/\s+/).filter(Boolean);
}

// The parts of an ayah on the pages it touches, in reading order: [{ page, box }]
function partsOf(key) {
  const [surah, ayah] = parse(key);
  const first = pageOf(surah, ayah);
  const parts = [];
  if (first == null) return parts;
  for (const page of [first, first + 1]) {
    const entry = ayatOn(page).find((x) => x.s === surah && x.a === ayah);
    if (entry) for (const box of entry.boxes) parts.push({ page, box });
  }
  return parts;
}

// Where each word of an ayah is: one entry per word, [{ page, box: [x0, y0, x1, y1] }, ...] (a word at a
// line's end can lie on two boxes). Lines run right to left, so a word is found from each box's right edge.
// The number circle is at the left end of the last box: no word's box reaches into it.
export function wordBoxes(key, words) {
  const parts = partsOf(key);
  if (!parts.length || !words.length) return words.map(() => []);
  const total = words.reduce((sum, word) => sum + Math.max(1, letters(word)) + SPACE, 0) + END_MARK;
  const widths = parts.map((part) => part.box[2] - part.box[0]);
  const length = widths.reduce((sum, width) => sum + width, 0);
  let done = 0; // letters so far
  return words.map((word) => {
    const size = Math.max(1, letters(word)) + SPACE;
    const from = (done / total) * length;
    const to = ((done + size) / total) * length;
    done += size;
    const pieces = [];
    let start = 0; // where this box begins along the ayah's length
    parts.forEach((part, i) => {
      const a = Math.max(from, start);
      const b = Math.min(to, start + widths[i]);
      if (b > a) {
        const [x0, y0, x1, y1] = part.box;
        let left = x1 - (b - start);
        let right = x1 - (a - start);
        // an edge inside the line is a guess: move it to the real gap between the words
        if (b === to && b < start + widths[i] - 1e-9) left = snapX(part.page, part.box, left);
        if (a === from && a > start + 1e-9) right = snapX(part.page, part.box, right);
        if (i === parts.length - 1) left = Math.max(left, markEnd(part.page, part.box) ?? x0 + RING_W);
        if (right - left > 1e-6) pieces.push({ page: part.page, box: [left, y0, right, y1] });
      }
      start += widths[i];
    });
    return pieces;
  });
}

// ---------- The session: where the reader is ----------
// { keys, i, w, finished }: the ayat before `i` are fully shown, `i` shows its first `w` words, later ones are hidden.

export const begin = (keys, i = 0) => ({ keys, i, w: 0, finished: false });

const settle = (st) => (st.i >= st.keys.length ? { ...st, i: st.keys.length, w: 0, finished: true } : { ...st, finished: false });

// «Play»: show the whole ayah being worked on, and move to the next
export const showAyah = (st) => (st.finished ? st : settle({ ...st, i: st.i + 1, w: 0 }));

// «Bulb»: show one more word of that ayah; when its last word is shown the ayah is done and the next begins
export function showWord(st, count) {
  if (st.finished) return st;
  return st.w + 1 >= count(st.keys[st.i]) ? showAyah(st) : { ...st, w: st.w + 1 };
}

// Start again from an ayah (a tap on it): the ones before it shown, it and the rest hidden
export function jumpTo(st, key) {
  const at = st.keys.indexOf(key);
  return at < 0 ? st : { ...st, i: at, w: 0, finished: false };
}

// ---------- The veil: what to cover on a page ----------

const PAD_X = 0.0008; // a hair beyond a word's edge, which sits on a real gap
const PAD_Y = 0.004; // the signs above and below the line
const RING_PAD = 0.0015; // between the number circle and what is covered around it

// Boxes that touch on one line become one box (no hairline between them)
function merge(boxes) {
  const merged = [];
  for (const box of [...boxes].sort((p, q) => p[1] - q[1] || p[0] - q[0])) {
    const last = merged[merged.length - 1];
    const sameLine = last && Math.abs(last[1] - box[1]) < 1e-6 && Math.abs(last[3] - box[3]) < 1e-6;
    if (sameLine && box[0] <= last[2] + 1e-6) last[2] = Math.max(last[2], box[2]);
    else merged.push([...box]);
  }
  return merged;
}

// Above and below the number circle: the little signs of the ayah's last word hang over the circle's top, so
// they are covered too; the circle itself is left. [] when the circle is not on this page or its picture is unread.
function ringStrips(key, page) {
  const last = partsOf(key).at(-1);
  if (!last || last.page !== page) return [];
  const ring = markBox(page, last.box);
  if (!ring) return [];
  const [x0, y0, , y1] = last.box;
  const left = Math.max(x0, ring.x0 - 0.001);
  const strips = [];
  if (ring.y0 - RING_PAD > y0 - PAD_Y) strips.push([left, y0 - PAD_Y, ring.x1, ring.y0 - RING_PAD]);
  if (y1 + PAD_Y > ring.y1 + RING_PAD) strips.push([left, ring.y1 + RING_PAD, ring.x1, y1 + PAD_Y]);
  return strips;
}

// Everything of an ayah on a page but its number circle: each of its boxes whole, the last one from the
// circle's right edge. Where the words are does not matter here, so nothing of it can be missed.
function wholeAyah(key, page) {
  const parts = partsOf(key);
  const boxes = [];
  parts.forEach((part, i) => {
    if (part.page !== page) return;
    const [x0, y0, x1, y1] = part.box;
    const from = i === parts.length - 1 ? Math.min(x1, Math.max(x0, markEnd(page, part.box) ?? x0 + RING_W)) : x0;
    if (x1 - from > 1e-6) boxes.push([from, y0 - PAD_Y, x1, y1 + PAD_Y]);
  });
  return [...boxes, ...ringStrips(key, page)];
}

// The words of an ayah from the `shown`th on, on a page (never its number circle)
function wordsFrom(key, page, words, shown) {
  const boxes = [];
  wordBoxes(key, words).forEach((pieces, k) => {
    if (k < shown) return;
    for (const piece of pieces) {
      if (piece.page !== page) continue;
      const [x0, y0, x1, y1] = piece.box;
      boxes.push([x0 - PAD_X, y0 - PAD_Y, x1 + PAD_X, y1 + PAD_Y]);
    }
  });
  return [...boxes, ...ringStrips(key, page)];
}

// What to cover on a page: [{ boxes }], boxes as fractions of the page, for PageCurl's `veils`.
// `override`: 'hide' covers every ayah, 'show' none, null follows the session `st`.
// `wordsByKey`: Map key -> words, for the ayah whose words are shown one by one.
export function veilFor(page, st, wordsByKey, override) {
  if (override === 'show') return [];
  const position = new Map(st.keys.map((key, i) => [key, i]));
  const veil = [];
  for (const { s, a } of ayatOn(page)) {
    const key = `${s}:${a}`;
    const i = position.get(key);
    if (i === undefined) continue; // not part of the session
    if (override !== 'hide' && i < st.i) continue; // already shown
    const shown = override !== 'hide' && i === st.i ? st.w : 0;
    const words = wordsByKey.get(key);
    const boxes = words && shown > 0 ? wordsFrom(key, page, words, shown) : wholeAyah(key, page);
    veil.push({ boxes: merge(boxes) });
  }
  return veil;
}

// The ayat of a portion (Hifdh positions, as the plan keeps them) as keys of the narration that is open
export function keysOfSegs(segs, keyOf, displayKeys) {
  const keys = [];
  for (const [from, to] of segs) for (let g = from; g < to; g++) keys.push(...displayKeys(keyOf(g)));
  return keys;
}