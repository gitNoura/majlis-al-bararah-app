// «Your week»: how many of the seven days (Monday first) had something done, and a pill for each day:
// kept (check), today, missed since the first plan began (cross), or still to come.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { alpha, useAccent } from '@/components/hifdh/Section';
import { num, weekdayName, weekInfo } from '@/lib/hifdh/labels';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

type DayState = 'on' | 'now' | 'miss' | 'idle';

function CloseMark({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <Path d="M7 7l10 10M17 7L7 17" />
    </Svg>
  );
}

export function WeekCard() {
  const { c, isDark } = useTheme();
  const h = useHome();
  const a = useAccent();
  const { days, kept, today, started } = weekInfo();
  const n = days.filter((d: string) => kept.has(d)).length;

  return (
    <View style={[styles.card, { backgroundColor: h.tile, borderColor: h.cardLine }]}>
      <View style={styles.top}>
        <Txt size={18} weight={700} color={h.tileInk}>
          {HIF.yourWeek()}
        </Txt>
        <View style={styles.count}>
          <Txt size={26} weight={800} color={h.tileInk} lineHeight={30}>
            {num(n)}
          </Txt>
          <Txt size={12} color={h.tileInk} style={{ opacity: 0.7 }}>
            {HIF.ofSevenDays()}
          </Txt>
        </View>
      </View>
      <View style={styles.week}>
        {days.map((d: string) => {
          const state: DayState = kept.has(d) ? 'on' : d === today ? 'now' : started && d >= started && d < today ? 'miss' : 'idle';
          return (
            <View key={d} style={styles.day}>
              <Txt size={11} weight={state === 'now' ? 700 : 600} center color={h.tileInk}>
                {weekdayName(core.weekdayOf(d))}
              </Txt>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: state === 'on' ? h.forest : state === 'now' ? a.fill : alpha(h.leaf, isDark ? 0.22 : 0.18) },
                  state === 'now' && { borderWidth: 2, borderColor: a.mark },
                ]}
              >
                {state === 'on' && <CheckIcon color={h.forestInk} size={16} strokeWidth={2.4} />}
                {state === 'miss' && <CloseMark color={c.meta} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { alignItems: 'flex-end' },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  pill: { width: '100%', maxWidth: 38, height: 44, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
