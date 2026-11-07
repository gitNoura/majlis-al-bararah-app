// What the Home dashboard shows, worked out from the data the app already keeps (nothing new is stored):
//   prayerView()      the next prayer and the day's five times   (src/lib/prayer.js)
//   readingView()     where the reader is in the mushaf, its khatma and today's pages  ('lastPage', src/lib/wird.ts)
//   memorizedCells()  the share of each juz memorized, from the Hifdh ledger  (src/lib/hifdh/plan.js)
//   hifdhToday()      how many of today's new / revision portions are done
//   activityGrid()    the last four weeks, one cell a day, by how many kinds of activity (src/lib/activity.js)
// Every function reads the saved state when it is called, so the screen calls them again whenever it comes into view.
import type { Row } from '@/components/hifdh/StopSheet';
import { LANG, t } from '@/i18n/i18n';
import { activeDays } from '@/lib/activity';
import * as hijri from '@/lib/hijri';
import { juzRange } from '@/lib/hifdh';
import { isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { clockTime, nextPrayer, place, times } from '@/lib/prayer';
import { savedPage } from '@/lib/position';
import { AJZA, TOTAL_PAGES } from '@/lib/quran';
import { dayKey, readJSON } from '@/lib/storage';
import { loadWird } from '@/lib/wird';

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
} | null;

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
  };
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

export function readingView() {
  const started = readJSON('lastPage', null) != null;
  const page = savedPage();
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
  return { hasPlan, memorize: count('memorize'), revise: count('revise') };
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
