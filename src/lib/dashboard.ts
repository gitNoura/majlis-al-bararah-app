// What the Home dashboard shows, worked out from the data the app already keeps (nothing new is stored):
//   prayerView()      the next prayer and the day's five times   (src/lib/prayer.js)
//   readingView()     where the reader is in the mushaf, its khatma and today's pages  ('lastPage', src/lib/wird.ts)
//   memorizedCells()  the share of each juz memorized, from the Hifdh ledger  (src/lib/hifdh/plan.js)
//   hifdhToday()      how many of today's new / revision portions are done
//   activityGrid()    the last four weeks, one cell a day, by how many kinds of activity (src/lib/activity.js)
// Every function reads the saved state when it is called, so the screen calls them again whenever it comes into view.
import type { Row } from '@/components/hifdh/StopSheet';
import type { Phase } from '@/components/PrayerSky';
import { LANG, t } from '@/i18n/i18n';
import { activeDays } from '@/lib/activity';
import * as hijri from '@/lib/hijri';
import { juzRange } from '@/lib/hifdh';
import { isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { clockTime, nextPrayer, place, skyNow, skyTimes, times } from '@/lib/prayer';
import { pageOf } from '@/lib/boxes';
import { AJZA, TOTAL_PAGES } from '@/lib/quran';
import { dayKey } from '@/lib/storage';
import { loadWird, wirdStop } from '@/lib/wird';

// ---------- the date ----------

// «Friday, 25 Rabi al-Thani 1448 AH»: the weekday and the Hijri date (empty if the date cannot be worked out)
export function dateLine(): string {
  try {
    const now = new Date();
    const h = hijri.hijri(hijri.noon(now));
    let day = now.toLocaleDateString(LANG, { weekday: 'long' });
    if (LANG === 'fr') day = day[0].toUpperCase() + day.slice(1);
    const month = hijri.monthName(h.m);
    return LANG === 'ar' ? `${day}، ${h.d} ${month} ${h.y} هـ` : LANG === 'fr' ? `${day} ${h.d} ${month} ${h.y} H` : `${day}, ${h.d} ${month} ${h.y} AH`;
  } catch {
    return '';
  }
}

// ---------- prayer ----------

const FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export type PrayerView = {
  list: { key: (typeof FIVE)[number]; name: string; at: string; next: boolean; past: boolean }[];
  next: string; // the next prayer's name
  h: number; // the time left to it
  m: number;
  phase: Phase; // the sky of the moment (see SKIES)
  sun: number; // how far the sun is through its day: 0 at sunrise, 1 at sunset
} | null;

// The prayers card takes the sky of the moment, whatever the app's day / night: worked out from the sun at the place
// (skyNow: the night from the dusk's end to al-Fajr, the dawn, midday, the warm afternoon, the sunset's glow).
export type Sky = { sky: readonly [string, string, string]; ink: string; soft: string; circle: string; next: string; nextIcon: string };
const LIGHT_INK = { ink: '#173f32', soft: '#5f6650', circle: 'rgba(23, 63, 50, 0.08)', next: '#173f32', nextIcon: '#fffdf5' };
const NIGHT_INK = { ink: '#f6eedb', soft: '#d6cbb0', circle: 'rgba(255, 255, 255, 0.12)', next: '#f3e2b0', nextIcon: '#1b2a33' };
export const SKIES: Record<Phase, Sky> = {
  night: { sky: ['#101b26', '#1b2b38', '#2a3c45'], ...NIGHT_INK },
  dawn: { sky: ['#f3cfc4', '#f7e3d3', '#e6eef0'], ...LIGHT_INK },
  midday: { sky: ['#c9e1ec', '#e0eef0', '#eef3e6'], ...LIGHT_INK },
  afternoon: { sky: ['#f4d6b8', '#f3e6d2', '#e8ebdb'], ...LIGHT_INK },
  sunset: { sky: ['#e69a6c', '#c97a6c', '#7a5a72'], ...NIGHT_INK, nextIcon: '#7a3f3a' },
};
// The Reading card is the prayers card's deeper companion: for each sky, a darker, more saturated gradient of the same
// hue (so the two cards read as one family at every hour), white words, a ring and a button that suit it.
export type ReadingSky = { grad: readonly [string, string]; ink: string; soft: string; track: string; btn: string; btnInk: string; shadow: string };
export const READING_SKIES: Record<Phase, ReadingSky> = {
  night: { grad: ['#21474a', '#0f2a2e'], ink: '#f6eedb', soft: 'rgba(246,238,219,0.72)', track: 'rgba(246,238,219,0.2)', btn: '#f3e2b0', btnInk: '#1b2a33', shadow: 'rgba(8, 20, 24, 0.45)' },
  dawn: { grad: ['#b96b66', '#7c4a5d'], ink: '#ffffff', soft: 'rgba(255,255,255,0.8)', track: 'rgba(255,255,255,0.24)', btn: '#fff3ea', btnInk: '#6d3f52', shadow: 'rgba(124, 74, 93, 0.38)' },
  midday: { grad: ['#3f8199', '#235b70'], ink: '#ffffff', soft: 'rgba(255,255,255,0.8)', track: 'rgba(255,255,255,0.24)', btn: '#ffffff', btnInk: '#1f566b', shadow: 'rgba(35, 91, 112, 0.38)' },
  afternoon: { grad: ['#ad7442', '#7a4d2c'], ink: '#ffffff', soft: 'rgba(255,255,255,0.8)', track: 'rgba(255,255,255,0.24)', btn: '#fff4e4', btnInk: '#6f4526', shadow: 'rgba(122, 77, 44, 0.38)' },
  sunset: { grad: ['#8c5373', '#4c3a5e'], ink: '#fff6ea', soft: 'rgba(255,246,234,0.78)', track: 'rgba(255,246,234,0.22)', btn: '#f3e2b0', btnInk: '#4a3552', shadow: 'rgba(76, 58, 94, 0.42)' },
};

// without a place: the sky by the clock
export const skyByClock = (): Phase => {
  const h = new Date().getHours();
  return h < 6 || h >= 19 ? 'night' : h < 8 ? 'dawn' : h < 15 ? 'midday' : h < 17 ? 'afternoon' : 'sunset';
};

// null while no place has been chosen (the card then asks for one)
export function prayerView(): PrayerView {
  const p = place();
  if (!p) return null;
  const now = new Date();
  const today = times(now, p);
  const next = nextPrayer(p);
  if (!today || !next) return null;
  const minutes = Math.max(0, Math.floor((next.at.getTime() - now.getTime()) / 60000));
  return {
    list: FIVE.map((k) => ({ key: k, name: t(`pr_${k}`), at: clockTime(today[k]), next: k === next.key, past: today[k] < now && k !== next.key })),
    next: t(`pr_${next.key}`),
    h: Math.floor(minutes / 60),
    m: minutes % 60,
    phase: (skyNow(p) ?? skyByClock()) as Phase,
    sun: (() => {
      const st = skyTimes(now, p);
      return st ? (now.getTime() - st.sunrise.getTime()) / (st.sunset.getTime() - st.sunrise.getTime()) : 0.5;
    })(),
  };
}

// The sky of the moment, on its own (the Reading card wears the same sky as the prayers card)
export function skyPhase(): Phase {
  const p = place();
  return ((p ? skyNow(p) : null) ?? skyByClock()) as Phase;
}

// ---------- reading ----------

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// One number (0 to 1) per juz: how far the reader has come through it, by page. The marker is the page being read,
// so the juz before it are full, the one it is in is part full, and the rest are empty.
export function readingCells(page: number): number[] {
  return AJZA.map((j: { page: number }, i: number) => {
    const end = i < AJZA.length - 1 ? AJZA[i + 1].page : TOTAL_PAGES + 1; // the next juz's first page
    return clamp((page - j.page) / (end - j.page));
  });
}

// «Continue reading» follows the mark the reader put in Read («Mark here», the wird's stop), NOT the marker that
// follows every page turn in every mode (Listen and Recite included). No mark yet: reading has not begun.
export function readingView() {
  const pin = wirdStop();
  const started = pin != null;
  const [ps, pa] = (pin?.shown ?? '').split(':').map(Number);
  const page = pin ? ((ps && pageOf(ps, pa)) || pin.page) : 1;
  const wird = loadWird();
  const cells = started ? readingCells(page) : readingCells(1);
  return {
    started,
    page,
    cells,
    percent: started ? Math.round(clamp((page - 1) / TOTAL_PAGES) * 100) : 0,
    juzFull: cells.filter((n) => n >= 1).length,
    pagesToday: wird.pages?.[dayKey()]?.length ?? 0,
    khatmas: wird.khatmas || 0,
  };
}

// ---------- memorization ----------

// The share of each juz that is in the ledger (its ranges are [from, to) positions; a juz is [first, last] positions)
export function memorizedCells(): number[] {
  plan.ready();
  const ledger: [number, number][] = plan.get()?.ledger ?? [];
  return Array.from({ length: 30 }, (_, i) => {
    const [first, last] = juzRange(i + 1) as [number, number];
    let n = 0;
    for (const [a, b] of ledger) n += Math.max(0, Math.min(b, last + 1) - Math.max(a, first));
    return clamp(n / (last - first + 1));
  });
}

export function hifdhToday() {
  plan.ready();
  const hasPlan = (plan.get()?.plans?.length ?? 0) > 0;
  const rows = plan.todayRows() as Row[];
  const count = (type: string) => {
    const mine = rows.filter((r) => r.plan.type === type);
    return { total: mine.length, done: mine.filter(isDone).length };
  };
  const plans = (plan.get()?.plans ?? []) as { type: string }[];
  return { hasPlan, hasMemorize: plans.some((x) => x.type === 'memorize'), hasRevise: plans.some((x) => x.type === 'revise'), memorize: count('memorize'), revise: count('revise') };
}

// ---------- activity ----------

// The last four weeks as 28 cells, a week to a row (it begins on Monday, as the Hifdh weeks do), the current week last.
// level: how many kinds of activity the day had (0 to 3: the mushaf, adhkar, ahadith...); future: a day still to come.
export function activityGrid(): { day: string; level: number; future: boolean }[] {
  const days = activeDays() as Map<string, Set<string>>;
  const now = new Date();
  const today = dayKey(now);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - 21);
  return Array.from({ length: 28 }, (_, i) => {
    const key = dayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    return { day: key, level: Math.min(3, days.get(key)?.size ?? 0), future: key > today };
  });
}
