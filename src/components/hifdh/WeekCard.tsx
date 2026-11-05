// «Your week»: how many of the seven days (Monday first) had something done, and a pill for each day:
// kept (check), today, missed since the first plan began (cross), or still to come.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTints } from '@/components/hifdh/Section';
import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { num, weekdayName, weekInfo } from '@/lib/hifdh/labels';
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
  const { c } = useTheme();
  const t = useTints('violet');
  const { days, kept, today, started } = weekInfo();
  const n = days.filter((d: string) => kept.has(d)).length;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: t.line }]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.wash }]} />
      <View style={styles.top}>
        <Txt serif size={18} weight={700} color={t.ink} lineHeight={30}>
          {HIF.yourWeek()}
        </Txt>
        <View style={styles.count}>
          <Txt size={26} weight={800} color={t.ink} lineHeight={30}>
            {num(n)}
          </Txt>
          <Txt size={12} color={c.meta}>
            {HIF.ofSevenDays()}
          </Txt>
        </View>
      </View>
      <View style={styles.week}>
        {days.map((d: string) => {
          const state: DayState = kept.has(d) ? 'on' : d === today ? 'now' : started && d >= started && d < today ? 'miss' : 'idle';
          return (
            <View key={d} style={styles.day}>
              <Txt size={11} weight={state === 'now' ? 700 : 600} center color={state === 'now' ? t.ink : c.text}>
                {weekdayName(core.weekdayOf(d))}
              </Txt>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: state === 'on' ? t.base : t.chip },
                  state === 'now' && { borderWidth: 1.5, borderColor: t.ink },
                ]}
              >
                {state === 'on' && <CheckIcon color="#ffffff" size={16} strokeWidth={2.4} />}
                {state === 'miss' && <CloseMark color={t.ink} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { alignItems: 'flex-end' },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  pill: { width: '100%', maxWidth: 40, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
