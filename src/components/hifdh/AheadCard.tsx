// «Ahead of schedule»: for whoever has finished today's plan and wants to go on (aheadHTML of the website).
// First an offer to start tomorrow's plan; once opened (or once something ahead is done) the next portions
// are listed. Nothing is drawn while today's plan is unfinished or there is nothing ahead.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useState } from 'react';
import { View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, SecondaryButton, Section } from '@/components/hifdh/Section';
import { TaskRow } from '@/components/hifdh/TaskRow';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { aheadRows, isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

type AheadRow = { plan: { id: string }; day: string; week?: number };

export function AheadCard() {
  const { c } = useTheme();
  useHif(); // redraws this card whenever `rev` changes
  const [open, setOpen] = useState(false);

  const allDone = plan.todayRows().every(isDone);
  const rows: AheadRow[] = allDone ? aheadRows() : [];
  if (!rows.length) return null;

  if (!open && !rows.some(isDone)) {
    return (
      <Section title={HIF.aheadTitle()}>
        <Txt size={15} weight={700} color={c.ink}>
          {HIF.allDone()}
        </Txt>
        <Hint>{HIF.aheadHint()}</Hint>
        <SecondaryButton label={HIF.startTomorrow()} onPress={() => setOpen(true)} />
      </Section>
    );
  }

  return (
    <Section title={HIF.aheadTitle()}>
      <View>
        {rows.map((r, i) => (
          <TaskRow key={`${r.plan.id}|${r.week ?? r.day}`} row={r} ahead first={i === 0} />
        ))}
      </View>
    </Section>
  );
}
