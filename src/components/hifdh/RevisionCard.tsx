// «Revision»: today's revision portions (revisionHTML of the website). Revision opens once something is
// memorized: before that the plan button is disabled and any revision rows are locked.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, PrimaryButton, Section } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { TaskRow } from '@/components/hifdh/TaskRow';
import { HIF } from '@/i18n/hifdh';
import { kindOf } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';

export function RevisionCard() {
  const { startPlan } = useHif(); // also redraws this card whenever `rev` changes
  const st = plan.get();
  const known = plan.memorizedCount() > 0;
  const title = kindOf('revise');

  if (!st.plans.some((p: { type: string }) => p.type === 'revise')) {
    return (
      <Section title={title}>
        <Hint>{known ? HIF.reviseHint() : HIF.reviseLocked()}</Hint>
        <PrimaryButton label={HIF.startRevision()} onPress={() => startPlan('revise')} disabled={!known} />
      </Section>
    );
  }

  const rows = plan.todayRows().filter((r: Row) => r.plan.type === 'revise');

  return (
    <Section title={title}>
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
