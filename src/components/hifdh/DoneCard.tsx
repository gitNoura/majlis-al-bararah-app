// What a card becomes once everything in it is done: the same card with its own icon and title, tinted soft green. Below
// the head: the congratulation, then a row with a «Memorized» / «Revised» check pill (with the portions) and «Undo» at the
// other end. The Complete and Listen buttons are gone. Used by the memorization and revision cards; the confetti is TaskRow's.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Pressable, StyleSheet, View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, Section, useGreen } from '@/components/hifdh/Section';
import type { Row } from '@/components/hifdh/StopSheet';
import { BookOpenIcon, CheckIcon, RepeatIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { findRow, portionName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

export function DoneCard({ rows, revise, first }: { rows: Row[]; revise?: boolean; first?: boolean }) {
  const { c } = useTheme();
  const g = useGreen();
  const { refresh } = useHif();
  const names = rows.map((r) => (r.week != null ? HIF.weekComplete() : portionName(r.segs, core.shownUnit(r.version)))).join(' · ');
  const partial = rows.some((r) => r.status === 'partial');
  const canUndo = rows.every((r) => r.week == null); // a weekly plan adds up through the week: nothing to take back at once
  const undo = () => {
    for (const r of rows) plan.mark(findRow(`${r.plan.id}|${r.week ?? r.day}`) ?? r, 'untouched');
    refresh();
  };
  const Icon = revise ? RepeatIcon : BookOpenIcon;
  return (
    <Section first={first} title={revise ? HIF.cardMurajaa() : HIF.cardHifdh()} tone="done" icon={(color) => <Icon color={color} size={22} />}>
      <View style={{ gap: 2 }}>
        <Txt size={16} weight={700} color={c.ink}>
          {revise ? HIF.reviseDoneTitle() : HIF.congratsTitle()}
        </Txt>
        <Hint>{partial ? HIF.partialToast() : revise ? HIF.reviseDoneBody() : HIF.congratsBody()}</Hint>
      </View>
      <View style={styles.foot}>
        <View style={styles.pill}>
          <CheckIcon color={g.base} size={16} strokeWidth={2.4} />
          <Txt size={13.5} weight={700} color={g.base} numberOfLines={1} style={{ flexShrink: 1 }}>
            {revise ? HIF.doneRevised() : HIF.doneMemorized()} · {names}
          </Txt>
        </View>
        {canUndo && (
          <Pressable onPress={undo} hitSlop={10} accessibilityRole="button">
            <Txt size={14} weight={700} color={c.meta}>
              {HIF.undo()}
            </Txt>
          </Pressable>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pill: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
