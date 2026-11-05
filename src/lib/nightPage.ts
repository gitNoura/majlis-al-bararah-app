// How the mushaf's pages look in the Quran's night mode, chosen in the Quran's settings and kept on the
// phone ('mushafNightPage'). The page's own colours are never changed:
// - 'normal': the page as by day, on the dark screen;
// - 'dim': the page dimmer (78 % of its light, as on the website), and in full screen the screen around
//   it the same dimmed paper.
import { useSyncExternalStore } from 'react';

import { readJSON, writeJSON } from '@/lib/storage';

export type NightPage = 'normal' | 'dim';

let value: NightPage = readJSON('mushafNightPage', 'normal') === 'dim' ? 'dim' : 'normal';
const listeners = new Set<() => void>();

export function setNightPage(v: NightPage) {
  value = v;
  writeJSON('mushafNightPage', v);
  listeners.forEach((l) => l());
}

export function useNightPage(): NightPage {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => value,
  );
}

// the day's paper (the normal page at night keeps it)
export const DAY_PAPER = '#fffce0';
// the dimmed page's paper (the night paper at 78 %), for the screen around it in full screen
export const DIM_PAPER = '#a8a28c';
