// HOME, the memorization and revision cards' words: the plan's name, its pace, and one line under it: what today holds
// («Today: Hizb 2»), or that it is a rest day and when the next session is.
// Everything is read from the plans' saved state each time it is called.
import { DASH } from '@/i18n/dashboard';
import * as core from '@/lib/hifdh/core';
import { isDone, portionName, rangeLabel, unitCount, weekLine, weekdayName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

type Unit = 'ayah' | 'page' | 'thumun' | 'hizb' | 'juz';
type Version = { unit: Unit; amount: number; days: number[]; divide?: Unit };
type Plan = { id: string; type: string; period?: string; range: number[][] | null; start: string; versions: Version[] };
type Row = { plan: Plan; day: string; week?: number | null; segs?: number[][]; version: Version };

export type PlanCardView = { title: string; pace: string; foot: string; percent: number };

export function planCardView(kind: 'memorize' | 'revise'): PlanCardView | null {
  plan.ready();
  const day = plan.today() as string;
  const all = (plan.get().plans as Plan[]).filter((p) => p.type === kind);
  if (!all.length) return null;
  const p = all.find((x) => !core.isPaused(x, day)) ?? all[0];
  const v = core.versionAt(p, day) as Version;

  // the pace: a weekly amount, or a daily one with the days of the week it runs on
  const weekly = p.period === 'week' || core.isBlock(v);
  const amount = unitCount(v.unit, v.amount) as string;
  const pace = [weekly ? DASH.perWeek(amount) : DASH.perDay(amount)];
  if (!weekly && v.days.length < 7) pace.push(DASH.daysAWeek(v.days.length));

  // the line under it: today's portion, or a rest day and the next session
  let foot: string;
  const row = (plan.todayRows() as Row[]).find((r) => r.plan.id === p.id);
  if (row) {
    foot = isDone(row) ? DASH.doneToday() : row.segs?.length ? DASH.todayIs(portionName(row.segs, core.shownUnit(row.version))) : weekLine(row);
  } else {
    const next = (plan.upcomingRows() as Row[]).find((r) => r.plan.id === p.id);
    const when = !next ? null : next.day === core.addDays(day, 1) ? DASH.sessionTomorrow() : DASH.sessionOn(weekdayName(core.weekdayOf(next.day), 'long'));
    foot = [DASH.restDay(), when].filter(Boolean).join(' · ');
  }

  return { title: rangeLabel(p.range, p.type) as string, pace: pace.join(' · '), foot, percent: (plan.planProgress(kind) ?? 0) * 100 };
}
