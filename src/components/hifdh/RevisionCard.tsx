// «Revision»: today's revision portions (revisionHTML of the website). Revision opens once something is
// memorized: before that the plan button is disabled and any revision rows are locked.
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
  const { startPlan, openMemorized } = useHif(); // also redraws this card whenever `rev` changes
  const { c } = useTheme();
  const st = plan.get();
  const known = plan.memorizedCount() > 0;
  const title = HIF.cardMurajaa();

  if (!st.plans.some((p: { type: string }) => p.type === 'revise')) {
    return (
      <Section title={title} accent="blue" icon={(color) => <RepeatIcon color={color} size={22} />}>
        <Txt size={15} weight={700} color={c.ink}>
          {HIF.noRevPlan()}
        </Txt>
        <Hint>{known ? HIF.noRevPlanSub() : HIF.noRevPlanLocked()}</Hint>
        <PrimaryButton label={known ? HIF.startRevision() : HIF.memorizedTitle()} onPress={() => (known ? startPlan('revise') : openMemorized())} />
      </Section>
    );
  }

  const rows = plan.todayRows().filter((r: Row) => r.plan.type === 'revise');

  if (rows.length && rows.every(isDone)) return <DoneCard rows={rows} revise />; // done: the same card turns into the congratulation

  return (
    <Section title={title} accent="blue" icon={(color) => <RepeatIcon color={color} size={22} />}>
      {rows.length ? (
        <View>
          {rows.map((r: Row, i: number) => (
            <TaskRow key={`${r.plan.id}|${r.week ?? r.day}`} row={r} locked={!known} first={i === 0} />
          ))}
        </View>
      ) : (
        <Hint>{HIF.noRevision()}</Hint>
      )}
      {!known && <Hint>{HIF.reviseLocked()}</Hint>}
    </Section>
  );
}
