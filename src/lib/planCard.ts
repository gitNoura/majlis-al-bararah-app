// HOME, the memorization and revision cards' words: the plan's name, its pace (and, for memorization, the days left), and one line
// under it: how many units are memorized out of the plan's range (memorization), or what today holds (revision).
// Everything is read from the plans' saved state each time it is called.
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { UNIT_PLURAL, isDone, num, portionName, rangeLabel, unitCount, weekLine, weekdayName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

type Unit = 'ayah' | 'page' | 'thumun' | 'hizb' | 'juz';
type Version = { unit: Unit; amount: number; days: number[]; divide?: Unit };
type Plan = { id: string; type: string; period?: string; range: number[][] | null; start: string; versions: Version[] };
type Row = { plan: Plan; day: string; week?: number | null; segs?: number[][]; version: Version };

export type PlanCardView = { title: string; pace: string; foot: string; percent: number };

// Arabic counts after a number as a singular noun («٦٠ حزباً»)
const AR_AFTER_NUMBER: Record<Unit, string> = { ayah: 'آية', page: 'صفحة', thumun: 'ثمناً', hizb: 'حزباً', juz: 'جزءاً' };
const unitWord = (unit: Unit) => (LANG === 'ar' ? AR_AFTER_NUMBER[unit] : UNIT_PLURAL[unit]());

// the units of the plan's range that are memorized, out of all the units in it (a unit counts when all its ayat are)
function memorizedUnits(p: Plan, unit: Unit): { done: number; total: number } {
  const U = plan.units();
  const info = U.unit[unit];
  const ledger = core.rangesToBits(plan.get().ledger, U.N);
  const inRange = p.range ? core.rangesToBits(p.range, U.N) : null;
  let total = 0;
  let done = 0;
  for (let g = 0; g < U.N; g++) {
    if (inRange && !inRange[g]) continue;
    const w = 1 / info.size[info.uid[g]];
    total += w;
    if (ledger[g]) done += w;
  }
  return { done: Math.min(Math.floor(done + 1e-6), Math.round(total)), total: Math.round(total) };
}

export function planCardView(kind: 'memorize' | 'revise'): PlanCardView | null {
  plan.ready();
  const day = plan.today() as string;
  const all = (plan.get().plans as Plan[]).filter((p) => p.type === kind);
  if (!all.length) return null;
  const p = all.find((x) => !core.isPaused(x, day)) ?? all[0];
  const v = core.versionAt(p, day) as Version;

  // the pace: a weekly amount, or a daily one with the days of the week it runs on; a memorization plan adds the days left
  const weekly = p.period === 'week' || core.isBlock(v);
  const amount = unitCount(v.unit, v.amount) as string;
  const pace = [weekly ? DASH.perWeek(amount) : DASH.perDay(amount)];
  if (!weekly && v.days.length < 7) pace.push(DASH.daysAWeek(v.days.length));
  if (kind === 'memorize') {
    const end = plan.forecast(p) as string | null;
    if (end) pace.push(DASH.daysLeft(Math.max(0, core.daysBetween(day, end))));
  }

  let foot: string;
  if (kind === 'memorize') {
    const m = memorizedUnits(p, v.unit);
    foot = DASH.unitsDone(num(m.done), num(m.total), unitWord(v.unit));
  } else {
    const row = (plan.todayRows() as Row[]).find((r) => r.plan.id === p.id);
    if (row) {
      foot = isDone(row) ? DASH.doneToday() : row.segs?.length ? DASH.todayIs(portionName(row.segs, core.shownUnit(row.version))) : weekLine(row);
    } else {
      const next = (plan.upcomingRows() as Row[]).find((r) => r.plan.id === p.id);
      const when = !next ? null : next.day === core.addDays(day, 1) ? DASH.sessionTomorrow() : DASH.sessionOn(weekdayName(core.weekdayOf(next.day), 'long'));
      foot = [DASH.restDay(), when].filter(Boolean).join(' · ');
    }
  }

  return { title: rangeLabel(p.range, p.type) as string, pace: pace.join(' · '), foot, percent: (plan.planProgress(kind) ?? 0) * 100 };
}
