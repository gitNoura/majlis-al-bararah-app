// «Your week»: how many of the seven days (Monday first) had something done. Drawn like Home's activity week (the title with «3 of 7»
// at its end, a letter for each day, today in bold with a dot under it) on one of the page's lit glass cards, with a round mark for
// each day: kept (the page's own charcoal by day, parchment by night, with a check), today (a ring), missed since the first plan began
// (a faint disc with a cross), or still to come (a fainter one). No green anywhere.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Glass } from '@/components/home/Glass';
import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { num, weekdayName, weekInfo } from '@/lib/hifdh/labels';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

type DayState = 'on' | 'now' | 'miss' | 'idle';

function CloseMark({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <Path d="M7 7l10 10M17 7L7 17" />
    </Svg>
  );
}

export function WeekCard() {
  const { isDark } = useTheme();
  const k = useSkin();
  const { days, kept, today, started } = weekInfo();
  const n = days.filter((d: string) => kept.has(d)).length;
  const checkInk = isDark ? '#1d1d1d' : '#ffffff';

  return (
    <Glass radius={24} style={styles.card}>
      <View style={styles.top}>
        <Txt size={17} weight={700} color={k.ink}>
          {HIF.yourWeek()}
        </Txt>
        <View style={styles.count}>
          <Txt size={22} weight={700} color={k.ink} lineHeight={28}>
            {num(n)}
          </Txt>
          <Txt size={12} color={k.meta}>
            {HIF.ofSevenDays()}
          </Txt>
        </View>
      </View>
      <View style={styles.week}>
        {days.map((d: string) => {
          const state: DayState = kept.has(d) ? 'on' : d === today ? 'now' : started && d >= started && d < today ? 'miss' : 'idle';
          return (
            <View key={d} style={styles.day}>
              <Txt size={12} weight={d === today ? 800 : 500} center color={d === today ? k.ink : k.meta}>
                {weekdayName(core.weekdayOf(d), 'narrow')}
              </Txt>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: state === 'on' ? k.hue : k.pillTrack },
                  state === 'now' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: k.ink },
                  state === 'idle' && { opacity: 0.55 },
                ]}
              >
                {state === 'on' && <CheckIcon color={checkInk} size={17} strokeWidth={2.4} />}
                {state === 'miss' && <CloseMark color={k.meta} />}
              </View>
              <View style={[styles.mark, { backgroundColor: d === today ? k.ink : 'transparent' }]} />
            </View>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  day: { flex: 1, alignItems: 'center', gap: 7 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 5, height: 5, borderRadius: 3 },
});
