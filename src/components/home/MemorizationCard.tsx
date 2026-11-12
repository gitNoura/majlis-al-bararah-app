// HOME, memorization and revision: two glass cards (PlanRingCard), each showing its plan: the name, the pace (memorization: and the days
// left), a line under it (memorized so far, or what today holds) and the ring with how far the plan is through its whole run. With no plan of that kind yet the card is a plain invitation to create
// one; a day with nothing planned says so. A tap opens the Hifdh tab. Everything is read from the plans' saved state.
'use no memo'; // reads saved state (the plans) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';

import { PlanCard } from '@/components/home/PlanCard';
import { PlanRingCard } from '@/components/home/PlanRingCard';
import { DASH } from '@/i18n/dashboard';
import { HIF } from '@/i18n/hifdh';
import { hifdhOverview } from '@/lib/dashboard';
import { planCardView } from '@/lib/planCard';

type Kind = 'memorize' | 'revise';
type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

function Plan({ kind, label, part, invite, inviteSub, nothingToday }: { kind: Kind; label: string; part: Part; invite: string; inviteSub: string; nothingToday: string }) {
  const open = () => router.navigate('/hifdh');
  const pct = part.progress == null ? null : part.progress * 100;

  // no plan yet: an invitation that says what this is for, words only (no arrow)
  if (!part.has) return <PlanCard label={label} title={invite} sub={inviteSub} action={DASH.createPlan()} arrow={false} onPress={open} a11y={`${label} ${invite}`} />;

  // the plan's name and pace, how far it is, and one line under the ring
  const view = planCardView(kind);
  if (!view) return <PlanCard label={label} title={nothingToday} onPress={open} a11y={`${label} ${nothingToday}`} />;
  return <PlanRingCard label={label} {...view} percent={pct ?? view.percent} onPress={open} a11y={`${label} ${view.title}`} />;
}

export function MemorizationCard() {
  const o = hifdhOverview();
  return (
    <>
      <Plan kind="memorize" label={DASH.memorizePlan()} part={o.memorize} invite={DASH.startHifdh()} inviteSub={DASH.startHifdhSub()} nothingToday={HIF.nothingToday()} />
      <Plan kind="revise" label={DASH.revisionPlan()} part={o.revise} invite={DASH.startRevise()} inviteSub={DASH.startReviseSub()} nothingToday={HIF.noRevision()} />
    </>
  );
}
