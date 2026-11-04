// «New memorization»: today's memorization portions (todayHTML of the website). With no memorization plan
// yet it offers «Set up my plan»; with a plan but nothing today it says what comes next.
import { View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, PrimaryButton, Section } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { TaskRow } from '@/components/hifdh/TaskRow';
import { HIF } from '@/i18n/hifdh';
import { dayText, kindOf } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

export function TodayCard() {
  const { startPlan } = useHif(); // also redraws this card whenever `rev` changes
  const st = plan.get();
  const title = kindOf('memorize');

  if (!st.plans.some((p: { type: string }) => p.type === 'memorize')) {
    return (
      <Section title={title}>
        <Hint>{HIF.noPlanYet()}</Hint>
        <PrimaryButton label={HIF.setUpPlan()} onPress={() => startPlan('memorize')} />
      </Section>
    );
  }

  const rows = plan.todayRows().filter((r: Row) => r.plan.type === 'memorize');
  const next = plan.upcomingRows().find((r: Row) => r.plan.type === 'memorize');

  return (
    <Section title={title}>
      {rows.length ? (
        <View>
          {rows.map((r: Row, i: number) => (
            <TaskRow key={`${r.plan.id}|${r.week ?? r.day}`} row={r} first={i === 0} />
          ))}
        </View>
      ) : (
        <Hint>{next ? HIF.nothingTodayNext(dayText(next.day)) : HIF.nothingToday()}</Hint>
      )}
    </Section>
  );
}
