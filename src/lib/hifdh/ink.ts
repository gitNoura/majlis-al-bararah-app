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
  const ring = ringRight(page, box, columns);
  const byGap = (columns.xa + end) / columns.w;
  return Math.min(box[2], ring == null ? byGap : Math.min(byGap, ring));
}

const ringCache = new Map<string, number | null>();

/**
 * The right edge of the number circle itself: the ink connected to the circle's leftmost pixels, followed no
 * further than a circle is wide (the last word often touches it). The nearest empty column (above) can lie a few
 * pixels past the circle and leave slivers of the word beside it uncovered; this edge cannot.
 */
function ringRight(page: number, box: Box, columns: Columns): number | null {
  const key = `${page}:${box.join(',')}`;
  if (ringCache.has(key)) return ringCache.get(key) ?? null;
  const grey = greys.get(page);
  const first = columns.inked.indexOf(true);
  let result: number | null = null;
  if (grey && first >= 0) {
    const { w, lum } = grey;
    const x0 = columns.xa + first;
    const limit = Math.min(columns.xa + columns.inked.length - 1, x0 + Math.ceil((RING_W + 0.003) * w));
    const cw = limit - x0 + 1;
    const ch = columns.yb - columns.ya;
    const seen = new Uint8Array(cw * ch);
    const stack: number[] = [];
    for (let y = 0; y < ch; y++) {
      if (lum[(columns.ya + y) * w + x0] < columns.cut) {
        seen[y * cw] = 1;
        stack.push(y * cw);
      }
    }
    let far = 0;
    while (stack.length) {
      const at = stack.pop() as number;
      const cx = at % cw;
      const cy = (at - cx) / cw;
      if (cx > far) far = cx;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
          const n = ny * cw + nx;
          if (seen[n] || lum[(columns.ya + ny) * w + x0 + nx] >= columns.cut) continue;
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (stack.length === 0 && far > 0) result = (x0 + far + 2) / w;
  }
  ringCache.set(key, result);
  return result;
}

// ---------- The page's own lines and frame ----------

const cutCache = new Map<number, number>();

/** The grey level below which a pixel of this page is ink: the paper's light end less 60. */
function pageCut(page: number): number | null {
  const grey = greys.get(page);
  if (!grey) return null;
  const known = cutCache.get(page);
  if (known != null) return known;
  const histogram = new Uint32Array(256);
  for (let i = 0; i < grey.lum.length; i++) histogram[grey.lum[i]]++;
  let lightest = Math.floor(grey.lum.length * 0.1);
  let paper = 255;
  for (; paper > 0 && lightest > histogram[paper]; paper--) lightest -= histogram[paper];
  cutCache.set(page, paper - 60);
  return paper - 60;
}

const frameCache = new Map<string, { x0: number; x1: number } | null>();

/**
 * Where the text area ends inside the page's frame: the columns just inside the thin border lines on the left and
 * the right (fractions of the page), found as columns that are ink all the way down. `minX` / `maxX` are the
 * extremes of the ayat's boxes on the page, which sit close to those lines. null while the picture is unread or
 * when no line is found. A cover kept inside these columns never takes a piece of the border with it.
 */
export function frameInner(page: number, minX: number, maxX: number): { x0: number; x1: number } | null {
  const key = `${page}:${minX.toFixed(4)}:${maxX.toFixed(4)}`;
  const known = frameCache.get(key);
  if (known !== undefined) return known;
  const grey = greys.get(page);
  const cut = pageCut(page);
  if (!grey || cut == null) return null;
  const { w, h, lum } = grey;
  const ya = Math.floor(h * 0.2);
  const yb = Math.floor(h * 0.8);
  const solid = (x: number) => {
    let dark = 0;
    for (let y = ya; y < yb; y++) if (lum[y * w + x] < cut) dark++;
    return dark >= (yb - ya) * 0.92;
  };
  let left: number | null = null;
  for (let x = Math.max(0, Math.floor((minX - 0.04) * w)); x <= Math.ceil((minX + 0.004) * w); x++) if (solid(x)) left = x + 1;
  let right: number | null = null;
  for (let x = Math.min(w - 1, Math.ceil((maxX + 0.04) * w)); x >= Math.floor((maxX - 0.004) * w); x--) if (solid(x)) right = x;
  const result = { x0: left != null ? left / w : minX, x1: right != null ? right / w : maxX };
  const found = left != null || right != null;
  frameCache.set(key, found ? result : null);
  return found ? result : null;
}

const spanCache = new Map<string, [number, number]>();

/**
 * The rows a line's cover takes, `y0`..`y1` being the line's box on the page (fractions): from the quietest row
 * (fewest ink pixels across the text area) near the line's top to the quietest near its bottom. The signs that
 * hang over and under the line go with it, and the line beside it - the basmala above, an ayah left uncovered -
 * keeps its own. null while the picture is unread.
 */
export function lineSpan(page: number, y0: number, y1: number, x0: number, x1: number): [number, number] | null {
  const grey = greys.get(page);
  const cut = pageCut(page);
  if (!grey || cut == null) return null;
  const key = `${page}:${y0.toFixed(4)}:${y1.toFixed(4)}:${x0.toFixed(3)}:${x1.toFixed(3)}`;
  const known = spanCache.get(key);
  if (known) return known;
  const { w, h, lum } = grey;
  const xa = Math.max(0, Math.floor(x0 * w));
  const xb = Math.min(w, Math.ceil(x1 * w));
  const quiet = (y: number, lo: number, hi: number) => {
    let best = Math.round(y);
    let least = Infinity;
    for (let r = Math.max(0, Math.floor(lo)); r <= Math.min(h - 1, Math.ceil(hi)); r++) {
      let ink = 0;
      for (let x = xa; x < xb; x++) if (lum[r * w + x] < cut) ink++;
      const score = ink + Math.abs(r - y) * 0.25; // the nearer row wins a tie
      if (score < least) {
        least = score;
        best = r;
      }
    }
    return best;
  };
  const win = 0.012 * h;
  const top = quiet(y0 * h, y0 * h - win, y0 * h + win * 0.5);
  const bottom = quiet(y1 * h, y1 * h - win * 0.5, y1 * h + win);
  const span: [number, number] = [top / h, (bottom + 1) / h];
  spanCache.set(key, span);
  return span;
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