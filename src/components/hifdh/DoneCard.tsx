// What a card becomes once everything in it is done (the usual way in apps): the same card, tinted gold, its icon a
// check, a congratulation in place of the portions, and a small «Undo». The Complete and Listen buttons are gone.
// Used by the memorization card and the revision card; the confetti is TaskRow's.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Pressable } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, Section } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { findRow, portionName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

export function DoneCard({ rows, revise }: { rows: Row[]; revise?: boolean }) {
  const { c } = useTheme();
  const { refresh } = useHif();
  const names = rows.map((r) => (r.week != null ? HIF.weekComplete() : portionName(r.segs, r.version.unit))).join(' · ');
  const partial = rows.some((r) => r.status === 'partial');
  const canUndo = rows.every((r) => r.week == null); // a weekly plan adds up through the week: nothing to take back at once
  const undo = () => {
    for (const r of rows) plan.mark(findRow(`${r.plan.id}|${r.week ?? r.day}`) ?? r, 'untouched');
    refresh();
  };
  return (
    <Section
      title={revise ? HIF.reviseDoneTitle() : HIF.congratsTitle()}
      subtitle={names}
      tone="done"
      icon={<CheckIcon color="#173f32" size={22} strokeWidth={2.4} />}
    >
      <Hint>{partial ? HIF.partialToast() : revise ? HIF.reviseDoneBody() : HIF.congratsBody()}</Hint>
      {canUndo && (
        <Pressable onPress={undo} hitSlop={10} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
          <Txt size={14} weight={700} color={c.goldStrong}>
            {HIF.undo()}
          </Txt>
        </Pressable>
      )}
    </Section>
  );
}
