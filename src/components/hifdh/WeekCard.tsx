// «Your week»: how many of the seven days (Monday first) had something done. Drawn (the title with «3 of 7»
// at its end), straight on the page with no card behind it: the day's name over a curved square for each day, a neutral grey when empty: kept (the page's own forest green by day, parchment by night, with a check), today (a ring), missed since the first plan began
// (a grey square with a cross), or still to come (a fainter one). No green anywhere. Depth comes from light, not from a box: a kept day is raised (a light edge, a soft shadow), an empty one is pressed in, today is a ring that sits a little above the page.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

// how a day's tile looks: kept = raised (light edge on top, soft shadow under), empty = pressed in (shadow inside along the top),
// today = a ring that lifts a little off the page
function tileLook(state: DayState, k: ReturnType<typeof useSkin>, isDark: boolean) {
  if (state === 'on') {
    return {
      backgroundColor: k.fill,
      boxShadow: isDark
        ? 'inset 0px 1px 0px rgba(255,255,255,0.45), 0px 1px 2px rgba(0,0,0,0.5), 0px 5px 10px rgba(0,0,0,0.4)'
        : 'inset 0px 1px 0px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.28), 0px 5px 10px rgba(9,74,61,0.3)',
    } as const;
  }
  if (state === 'now') {
    return {
      borderWidth: 2,
      borderColor: k.ink,
      backgroundColor: 'transparent',
      boxShadow: isDark ? '0px 3px 8px rgba(0,0,0,0.5)' : '0px 3px 8px rgba(0,0,0,0.16)',
    } as const;
  }
  return {
    backgroundColor: k.well,
    boxShadow: isDark
      ? 'inset 0px 2px 3px rgba(0,0,0,0.45), inset 0px -1px 0px rgba(255,255,255,0.06)'
      : 'inset 0px 2px 3px rgba(0,0,0,0.16), inset 0px -1px 0px rgba(255,255,255,0.7)',
  } as const;
}

export function WeekCard() {
  const { isDark } = useTheme();
  const k = useSkin();
  const { days, kept, today, started } = weekInfo();
  const n = days.filter((d: string) => kept.has(d)).length;
  const checkInk = isDark ? '#1d1d1d' : '#ffffff'; // a kept day: the forest green by day (k.fill), parchment by night

  return (
    <View style={styles.card}>
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
              <Txt size={12} weight={d === today ? 800 : 500} center color={d === today ? k.ink : k.meta} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {weekdayName(core.weekdayOf(d))}
              </Txt>
              <View style={[styles.capsule, tileLook(state, k, isDark), state === 'idle' && { opacity: 0.5 }]}>
                {state === 'on' && (
                  <LinearGradient
                    pointerEvents="none"
                    colors={isDark ? ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.12)'] : ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.22)']}
                    locations={[0, 0.5, 1]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 12, borderCurve: 'continuous' }]}
                  />
                )}
                {state === 'on' && <CheckIcon color={checkInk} size={16} strokeWidth={2.6} />}
                {state === 'miss' && <CloseMark color={k.meta} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  day: { flex: 1, alignItems: 'center', gap: 8 },
  capsule: { width: 38, height: 38, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
