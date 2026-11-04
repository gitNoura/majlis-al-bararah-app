// Full screen shows less of the empty paper, so the text is bigger (the website's «zoom-pages»,
// screens/reader.css): pages 3-604 without the side margin of word meanings and without the paper
// above the surah / hizb labels and below the colour legend. Which part of the page picture shows, as
// fractions of the picture: from x, y, w wide and h high (it can reach past the picture: paper there).
// Normal reading shows the whole picture.
import { HAFS } from '@/lib/riwaya';

export type Crop = { x: number; y: number; w: number; h: number };

const WHOLE: Crop = { x: 0, y: 0, w: 1, h: 1 };
// the frame of the text, measured on the pages: the right-hand (odd) pages have their margin on the
// left, the left-hand (even) ones on the right
const WARSH = { right: 2.65 / 132.45, left: 29.67 / 132.45, y: 6.78 / 112.99, w: 100 / 132.45, h: 100 / 112.99 };
const HAFS_FRAME = { right: 1.83 / 127.31, left: 25.39 / 127.31, y: 5.58 / 111.61, w: 100 / 127.31, h: 100 / 111.61 };
const FRAME = HAFS ? HAFS_FRAME : WARSH;

// the page's shape (width / height): 1400 × 2000, and in full screen 1400 × 2344 (Hafs 1400 × 2281)
export const PAGE_SHAPE = 1400 / 2000;
export const FULL_SHAPE = (FRAME.w * 1400) / (FRAME.h * 2000);

export function cropOf(page: number, full: boolean): Crop {
  'worklet';
  if (!full) return WHOLE;
  // the opening pages (1, 2) have no such frame: the whole page, paper above and below it
  if (page < 3) {
    const h = PAGE_SHAPE / FULL_SHAPE;
    return { x: 0, y: -(h - 1) / 2, w: 1, h };
  }
  return { x: page % 2 ? FRAME.right : FRAME.left, y: FRAME.y, w: FRAME.w, h: FRAME.h };
}
