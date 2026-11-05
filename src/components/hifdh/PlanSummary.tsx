// The top of the Plan screen: the week, the memorized ring, and the heading of today's plan with the
// day's date. The daily cards (3b) go right under it. Once every portion of today is done, this heading itself turns
// into the congratulation (no other box appears, and nothing pops up).

'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { StyleSheet, View } from 'react-native';

import { MemorizedRing } from '@/components/hifdh/MemorizedRing';
import { WeekCard } from '@/components/hifdh/WeekCard';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { dayText, isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

export function PlanSummary({ onOpenMemorized }: { onOpenMemorized?: () => void }) {
  const { c } = useTheme();
  const rows = plan.todayRows();
  const done = rows.length > 0 && rows.every(isDone);
  return (
    <View style={styles.wrap}>
      {(plan.get().plans as unknown[]).length === 0 && (
        <Txt size={14.5} color={c.meta}>
          {HIF.planIntro()}
        </Txt>
      )}
      <WeekCard />
      <MemorizedRing onPress={onOpenMemorized} />
      <View style={styles.todayHead}>
        <Txt serif size={24} weight={700} color={c.ink} style={{ flexShrink: 1 }}>
          {done ? HIF.congratsTitle() : HIF.todayPlan()}
        </Txt>
        <Txt size={13} color={c.meta}>
          {dayText(plan.today())}
        </Txt>
      </View>
      {done && (
        <Txt size={14.5} color={c.meta} style={{ marginTop: -8 }}>
          {HIF.congratsBody()}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  todayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 },
});
