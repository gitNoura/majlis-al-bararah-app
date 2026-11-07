// The Quran's position: ONE marker, plus an exact pin.
//   marker: the page being read. It follows every page turn and is saved at once ('lastPage', the key the website
//           and the Listen / Recite screens already read).
//   pin:    an ayah the reader marked with «Mark here» (kept in the wird's `stop`, src/lib/wird.ts). It stays where it
//           was put until it is moved, however many pages are turned.
import { TOTAL_PAGES } from '@/lib/quran';
import { readJSON, writeJSON } from '@/lib/storage';
import { wirdStop } from '@/lib/wird';

const KEY = 'lastPage';

export const clampPage = (p: number) => Math.min(TOTAL_PAGES, Math.max(1, Math.round(p) || 1));

export function savedPage(): number {
  const p = Number(readJSON(KEY, 1));
  return p >= 1 && p <= TOTAL_PAGES ? p : 1;
}

export const savePage = (page: number) => writeJSON(KEY, clampPage(page));

// the pin: { page, shown } (shown: the ayah as numbered in the narration read, "2:255"), or null
export const savedPin = wirdStop;
