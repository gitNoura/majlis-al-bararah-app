// «Revision»: today's revision portions (revisionHTML of the website). The reader says what to revise: nothing
// has to be entered as memorized first.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { View } from 'react-native';

import { RepeatIcon } from '@/components/icons';
import { useTheme } from '@/theme/theme';

import { useHif } from '@/components/hifdh/HifProvider';
import { DoneCard } from '@/components/hifdh/DoneCard';
import { Hint, PrimaryButton, Section } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { TaskRow } from '@/components/hifdh/TaskRow';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

export function RevisionCard() {
  const { startPlan } = useHif(); // also redraws this card whenever `rev` changes
  const { c } = useTheme();
  const st = plan.get();
  const title = HIF.cardMurajaa();

  if (!st.plans.some((p: { type: string }) => p.type === 'revise')) {
    return (
      <Section title={title} icon={(color) => <RepeatIcon color={color} size={22} />}>
        <Txt size={15} weight={700} color={c.ink}>
          {HIF.noRevPlan()}
        </Txt>
        <Hint>{HIF.noRevPlanSub()}</Hint>
        <PrimaryButton label={HIF.startRevision()} onPress={() => startPlan('revise')} />
      </Section>
    );
  }

  const rows = plan.todayRows().filter((r: Row) => r.plan.type === 'revise');

  if (rows.length && rows.every(isDone)) return <DoneCard rows={rows} revise />; // done: the same card turns into the congratulation

  return (
    <Section title={title} icon={(color) => <RepeatIcon color={color} size={22} />}>
      {rows.length ? (
        <View>
          {rows.map((r: Row, i: number) => (
            <TaskRow key={`${r.plan.id}|${r.week ?? r.day}`} row={r} first={i === 0} />
          ))}
        </View>
      ) : (
        <Hint>{HIF.noRevision()}</Hint>
      )}
    </Section>
  );
}
