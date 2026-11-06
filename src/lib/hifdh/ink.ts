// Reads a mushaf page's own picture to find what the ayah boxes alone cannot tell: where the words and the
// ayah's number circle really are on a line. Used by recite.js to cover words exactly and never the circle.
//
// A line's box is turned into columns that hold ink or not. The empty runs are the gaps between words. The
// circle sits at the left end of an ayah's last line and has the same width on every page (RING_W); it often
// touches the last word, so its end is found from where its own ink begins, not from a gap alone.
//
// Until a page's picture is read, every function answers "unknown" (the guess, or null) and nothing breaks.
import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia';

import { pageUrl } from '@/lib/remote';

/** [x0, y0, x1, y1], fractions of the page picture. */
type Box = number[];
type Grey = { w: number; h: number; lum: Uint8Array };
/** The columns of one line's box: which hold ink (`inked[i]` is column `xa + i`). */
type Columns = { xa: number; ya: number; yb: number; w: number; h: number; cut: number; inked: boolean[]; minRun: number };

/** The number circle's width, as a fraction of the page's width. */
export const RING_W = 0.05;

const PAGES_KEPT = 8;
const greys = new Map<number, Grey>();
const reading = new Map<number, Promise<boolean>>();
const columnsCache = new Map<string, Columns | null>();

/** Reads a page's picture into a grey level per pixel. Resolves true once it is available. */
export function loadInk(page: number): Promise<boolean> {
  if (greys.has(page)) return Promise.resolve(true);
  let request = reading.get(page);
  if (!request) {
    request = Skia.Data.fromURI(pageUrl(page))
      .then((data) => {
        const image = Skia.Image.MakeImageFromEncoded(data);
        if (!image) return false;
        const w = image.width();
        const h = image.height();
        const rgba = image.readPixels(0, 0, { width: w, height: h, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
        if (!rgba) return false;
        const lum = new Uint8Array(w * h);
        for (let i = 0, j = 0; i < lum.length; i++, j += 4) lum[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
        greys.set(page, { w, h, lum });
        forgetOldest();
        return true;
      })
      .catch(() => false)
      .finally(() => reading.delete(page));
    reading.set(page, request);
  }
  return request;
}

function forgetOldest() {
  if (greys.size <= PAGES_KEPT) return;
  const oldest = greys.keys().next().value as number;
  greys.delete(oldest);
  for (const key of [...columnsCache.keys()]) if (key.startsWith(`${oldest}:`)) columnsCache.delete(key);
}

function columnsOf(page: number, box: Box): Columns | null {
  const key = `${page}:${box.join(',')}`;
  if (columnsCache.has(key)) return columnsCache.get(key) ?? null;
  const grey = greys.get(page);
  if (!grey) return null;
  const { w, h, lum } = grey;
  const xa = Math.max(0, Math.floor(box[0] * w));
  const xb = Math.min(w, Math.ceil(box[2] * w));
  const ya = Math.max(0, Math.floor(box[1] * h));
  const yb = Math.min(h, Math.ceil(box[3] * h));
  let columns: Columns | null = null;
  if (xb - xa >= 4 && yb - ya >= 2) {
    // The paper's grey is the light end of what the box holds; ink is clearly darker than it.
    const histogram = new Uint32Array(256);
    for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) histogram[lum[y * w + x]]++;
    let lightest = Math.floor((xb - xa) * (yb - ya) * 0.1);
    let paper = 255;
    for (; paper > 0 && lightest > histogram[paper]; paper--) lightest -= histogram[paper];
    const cut = paper - 60;
    const inked: boolean[] = [];
    for (let x = xa; x < xb; x++) {
      let dark = 0;
      for (let y = ya; y < yb && dark < 2; y++) if (lum[y * w + x] < cut) dark++;
      inked.push(dark >= 2);
    }
    columns = { xa, ya, yb, w, h, cut, inked, minRun: Math.max(2, Math.round(w * 0.003)) };
  }
  columnsCache.set(key, columns);
  return columns;
}

/** The middle of each run of empty columns along a line (fractions of the page, left to right). */
function gapsOf(page: number, box: Box): number[] {
  const columns = columnsOf(page, box);
  if (!columns) return [];
  const gaps: number[] = [];
  let run = 0;
  for (let i = 0; i <= columns.inked.length; i++) {
    if (i < columns.inked.length && !columns.inked[i]) {
      run++;
      continue;
    }
    if (run >= columns.minRun) gaps.push((columns.xa + i - run / 2) / columns.w);
    run = 0;
  }
  return gaps;
}

/** Moves a guessed word edge `x` to the nearest real gap of the line's box, if one is near enough. */
export function snapX(page: number, box: Box, x: number): number {
  const tolerance = Math.max(0.012, (box[2] - box[0]) * 0.08);
  let best = x;
  let nearest = tolerance;
  for (const gap of gapsOf(page, box)) {
    const distance = Math.abs(gap - x);
    if (distance < nearest) {
      nearest = distance;
      best = gap;
    }
  }
  return Math.min(box[2], Math.max(box[0], best));
}

/** Where the number circle ends, in the last box of an ayah (fraction of the page); null while the picture is unread. */
export function markEnd(page: number, box: Box): number | null {
  const columns = columnsOf(page, box);
  const first = columns?.inked.indexOf(true) ?? -1;
  if (!columns || first < 0) return null;
  const guess = first + RING_W * columns.w;
  const from = Math.max(0, Math.floor(guess - 0.006 * columns.w));
  const to = Math.min(columns.inked.length, guess + 0.014 * columns.w);
  let end = guess;
  let nearest = Infinity;
  for (let i = from; i < to; i++) {
    if (!columns.inked[i] && Math.abs(i - guess) < nearest) {
      nearest = Math.abs(i - guess);
      end = i;
    }
  }
  return Math.min(box[2], (columns.xa + end) / columns.w);
}

/**
 * The number circle itself, in the last box of an ayah: its left and right edges and its top and bottom
 * (fractions of the page). Its height is read from its middle columns, where the little signs of the word
 * before it cannot reach.
 */
export function markBox(page: number, box: Box): { x0: number; x1: number; y0: number; y1: number } | null {
  const columns = columnsOf(page, box);
  const grey = greys.get(page);
  const right = markEnd(page, box);
  if (!columns || !grey || right == null) return null;
  const left = columns.xa + columns.inked.indexOf(true);
  const width = right * columns.w - left;
  const middleFrom = left + Math.floor(width * 0.35);
  const middleTo = left + Math.ceil(width * 0.65);
  let top = -1;
  let bottom = -1;
  for (let y = columns.ya; y < columns.yb; y++) {
    for (let x = middleFrom; x <= middleTo; x++) {
      if (grey.lum[y * grey.w + x] < columns.cut) {
        if (top < 0) top = y;
        bottom = y;
        break;
      }
    }
  }
  if (top < 0) return null;
  return { x0: left / columns.w, x1: right, y0: top / columns.h, y1: (bottom + 1) / columns.h };
}