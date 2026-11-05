// The Quran's night mode, in full screen: the screen around the page dark ('normal'), or the same dimmed
// paper as the page ('dim'). The page itself is dimmed at night either way (78 % of its light, as on the
// website), its colours never changed. Chosen in full screen or the Quran's settings, kept on the phone
// ('mushafNightPage').
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

// the dimmed page's paper (the night paper at 78 %), for the screen around it in full screen
export const DIM_PAPER = '#a8a28c';
