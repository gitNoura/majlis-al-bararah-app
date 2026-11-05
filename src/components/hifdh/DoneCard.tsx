// What a card becomes once everything in it is done (the usual way in apps): the same card, tinted soft green, its icon a
// check, the card's own title alone in the head, then below it the portions done, a rule, the congratulation, and a small «Undo». The Complete and Listen buttons are gone.
// Used by the memorization card and the revision card; the confetti is TaskRow's.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Pressable, StyleSheet, View } from 'react-native';

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
      title={revise ? HIF.cardMurajaa() : HIF.cardHifdh()}
      tone="done"
      icon={(color) => <CheckIcon color={color} size={22} strokeWidth={2.4} />}
    >
      <Txt size={17} weight={700} color={c.ink}>
        {names}
      </Txt>
      <View style={[styles.rule, { backgroundColor: c.divider }]} />
      <View style={{ gap: 2 }}>
        <Txt size={15} weight={700} color={c.ink}>
          {revise ? HIF.reviseDoneTitle() : HIF.congratsTitle()}
        </Txt>
        <Hint>{partial ? HIF.partialToast() : revise ? HIF.reviseDoneBody() : HIF.congratsBody()}</Hint>
      </View>
      {canUndo && (
        <Pressable onPress={undo} hitSlop={10} accessibilityRole="button" style={{ alignSelf: 'flex-end' }}>
          <Txt size={14} weight={700} color={c.goldStrong}>
            {HIF.undo()}
          </Txt>
        </Pressable>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({ rule: { height: StyleSheet.hairlineWidth } });
