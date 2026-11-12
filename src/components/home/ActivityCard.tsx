// HOME, activity this week: a glass card. The title with «3 of 7» at the end, then seven capsules, one per day, Monday
// first, as tall as the reading of that day (the ayat the wird counted; a day the reader only opened the mushaf or Hifdh is a middle
// height), a day without activity a short stub, a day still to come a fainter one. A day with activity is a pale green (today's the full green).
// Today's letter is bold with a dot under it. A day counts when the reader opened the mushaf or Hifdh, or logged the wird
// (src/lib/activity.js). The capsules draw in once with the rest of Home.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { Glass } from '@/components/home/Glass';
import { Grow } from '@/components/home/Grow';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { activityGrid } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');
const BAR = 56; // the height of the tallest capsule
const STUB = 8;

export function ActivityCard() {
  const k = useSkin();
  const week = activityGrid().slice(21, 28); // the current week, Monday first
  const on = week.map((d) => !d.future && d.level > 0);
  const count = on.filter(Boolean).length;
  const todayIndex = week.reduce((a, d, i) => (d.future ? a : i), -1);
  const most = Math.max(1, ...week.map((d) => d.ayat));
  const letter = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: 'narrow' });
  // how tall a day's capsule is: by the reading of the day, from a third to the full height
  const height = (i: number) => (week[i].ayat > 0 ? BAR * (0.34 + 0.66 * (week[i].ayat / most)) : BAR * 0.4);

  return (
    <Glass style={styles.wrap}>
      <View style={styles.head}>
        <Txt size={15} weight={700} color={k.ink}>
          {DASH.activity()}
        </Txt>
        <Txt size={14} weight={700} color={k.ink}>
          {DASH.activityOf7(digits(count))}
        </Txt>
      </View>
      <View style={styles.bars} accessible accessibilityLabel={`${count}/7`}>
        {week.map((d, i) => {
          const today = i === todayIndex;
          return (
            <View key={d.day} style={styles.col}>
              <View style={styles.slot}>
                {on[i] ? (
                  <Grow axis="y" to={height(i)} delay={200 + i * 60} style={[styles.bar, { backgroundColor: today ? k.hue : k.hueSoft }, today && { shadowColor: k.glow, shadowOpacity: k.glowOpacity, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }]} />
                ) : (
                  <View style={[styles.bar, { height: STUB, backgroundColor: k.pillTrack, opacity: d.future ? 0.5 : 1 }]} />
                )}
              </View>
              <Txt size={12} weight={today ? 800 : 500} color={today ? k.ink : k.meta} center>
                {letter(d.day)}
              </Txt>
              <View style={[styles.dot, { backgroundColor: today ? k.ink : 'transparent' }]} />
            </View>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, padding: space.md },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bars: { flexDirection: 'row', gap: space.xs },
  col: { flex: 1, alignItems: 'center', gap: space.xs },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 18, borderRadius: 9 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
