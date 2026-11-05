// «Your week»: how many of the seven days (Monday first) had something done, and a pill for each day:
// kept (check), today, missed since the first plan began (cross), or still to come.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  const { c, isDark } = useTheme();
  const { days, kept, today, started } = weekInfo();
  const n = days.filter((d: string) => kept.has(d)).length;
  const soft = 'rgba(255, 255, 255, 0.14)';
  const muted = 'rgba(255, 255, 255, 0.72)';

  return (
    <LinearGradient colors={isDark ? ['#3a7a60', '#244f3e'] : ['#2b6b53', '#173f32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.top}>
        <Txt serif size={21} weight={700} color={c.onInk}>
          {HIF.yourWeek()}
        </Txt>
        <View style={styles.count}>
          <Txt size={30} weight={800} color={c.onInk} lineHeight={34}>
            {num(n)}
          </Txt>
          <Txt size={12} color={muted}>
            {HIF.ofSevenDays()}
          </Txt>
        </View>
      </View>
      <View style={styles.week}>
        {days.map((d: string) => {
          const state: DayState = kept.has(d) ? 'on' : d === today ? 'now' : started && d >= started && d < today ? 'miss' : 'idle';
          return (
            <View key={d} style={styles.day}>
              <Txt size={11} weight={600} center color={state === 'now' ? c.onInk : muted}>
                {weekdayName(core.weekdayOf(d))}
              </Txt>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: state === 'on' ? c.gold : soft },
                  state === 'now' && { borderWidth: 1.5, borderColor: c.onInk },
                ]}
              >
                {state === 'on' && <CheckIcon color="#173f32" size={16} strokeWidth={2.4} />}
                {state === 'miss' && <CloseMark color={muted} />}
              </View>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 18, gap: 16, boxShadow: '0px 12px 30px rgba(68, 55, 43, 0.16)' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { alignItems: 'flex-end' },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  pill: { width: '100%', maxWidth: 40, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
