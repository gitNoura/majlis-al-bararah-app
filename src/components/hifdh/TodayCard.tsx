// «New memorization»: today's memorization portions (todayHTML of the website). With no memorization plan
// yet it offers «Set up my plan»; with a plan but nothing today it says what comes next.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { View } from 'react-native';

import { BookOpenIcon } from '@/components/icons';
import { useTheme } from '@/theme/theme';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, PrimaryButton, Section } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { TaskRow } from '@/components/hifdh/TaskRow';
import { HIF } from '@/i18n/hifdh';
import { dayText, kindOf } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

export function TodayCard() {
  const { startPlan } = useHif(); // also redraws this card whenever `rev` changes
  const { c } = useTheme();
  const st = plan.get();
  const title = kindOf('memorize');

  if (!st.plans.some((p: { type: string }) => p.type === 'memorize')) {
    return (
      <Section title={title} subtitle={HIF.todaySub()} icon={<BookOpenIcon color={c.ink} size={22} />}>
        <Hint>{HIF.noPlanYet()}</Hint>
        <PrimaryButton label={HIF.setUpPlan()} onPress={() => startPlan('memorize')} />
      </Section>
    );
  }

  const rows = plan.todayRows().filter((r: Row) => r.plan.type === 'memorize');
  const next = plan.upcomingRows().find((r: Row) => r.plan.type === 'memorize');

  return (
    <Section title={title} subtitle={HIF.todaySub()} icon={<BookOpenIcon color={c.ink} size={22} />}>
      {rows.length ? (
        <View>
          {rows.map((r: Row, i: number) => (
            <TaskRow key={`${r.plan.id}|${r.week ?? r.day}`} row={r} first={i === 0} />
          ))}
        </View>
      ) : (
        <Hint>{next ? HIF.nothingTodayNext(dayText(next.day)) : HIF.nothingToday()}</Hint>
      )}
      {rows.some((r: Row) => r.status !== 'done' && r.status !== 'partial' && r.week == null) && <Hint>{HIF.holdHint()}</Hint>}
    </Section>
  );
}
