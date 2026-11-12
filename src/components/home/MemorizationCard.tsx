// HOME, memorization and revision: two glass cards (PlanCard), each showing TODAY'S portion of its plan, named the way the Hifdh page
// names it (the surah and ayat, and under it the hizb · thumun or the pages), with how far the plan is through its whole run: the
// percentage, the bar, and the days done out of all its days. With no plan of that kind yet the card is a plain invitation to create
// one; a day with nothing planned says so. A tap opens the Hifdh tab. Everything is read from the plans' saved state.
'use no memo'; // reads saved state (the plans) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';

import { PlanCard } from '@/components/home/PlanCard';
import { DASH } from '@/i18n/dashboard';
import { HIF } from '@/i18n/hifdh';
import { hifdhOverview } from '@/lib/dashboard';
import * as core from '@/lib/hifdh/core';
import { rangeLines } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

const digits = (n: number) => n.toLocaleString('en');

type Kind = 'memorize' | 'revise';
type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

function Plan({ kind, label, part, none, nothingToday }: { kind: Kind; label: string; part: Part; none: string; nothingToday: string }) {
  const open = () => router.navigate('/hifdh');
  const pct = part.progress == null ? null : part.progress * 100;

  if (!part.has) return <PlanCard label={label} title={none} sub={DASH.createPlan()} onPress={open} a11y={`${label} ${none}`} />;

  // today's first portion of this kind of plan (a weekly plan that is complete has none left to name)
  const row = plan.todayRows().find((r: { plan: { type: string } }) => r.plan.type === kind);
  const lines = row?.segs.length ? rangeLines(row.segs, core.shownUnit(row.version)) : null;
  const title = lines?.title ?? (row?.week != null ? HIF.weekComplete() : nothingToday);
  const days = part.days ? DASH.planDays(digits(part.days.done), digits(part.days.total)) : null;
  const sub = [lines?.sub, days].filter(Boolean).join(' · ');

  return <PlanCard label={label} title={title} sub={sub} percent={pct ?? 0} onPress={open} a11y={`${label} ${title}`} />;
}

export function MemorizationCard() {
  const o = hifdhOverview();
  return (
    <>
      <Plan kind="memorize" label={HIF.cardHifdh()} part={o.memorize} none={HIF.noHifdhPlan()} nothingToday={HIF.nothingToday()} />
      <Plan kind="revise" label={HIF.cardMurajaa()} part={o.revise} none={HIF.noRevPlan()} nothingToday={HIF.noRevision()} />
    </>
  );
}
