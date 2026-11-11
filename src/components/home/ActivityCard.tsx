// HOME, activity this week: a card of the prayer card's family. Its head is the title with «5 of 7» at the end; under it seven
// tinted day pills in a strip, Monday first, as the prayer card has its five times. Each holds a capsule as tall as the reading of
// that day (the ayat the wird counted; a day the reader only opened the mushaf or Hifdh is a middle height), a day without
// activity a short stub. Today is the one dark pill. A day counts when the reader opened the mushaf or Hifdh, or logged the
// wird (src/lib/activity.js). The capsules draw in once with the rest of Home.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { HomeCard, useCardSky } from '@/components/home/HomeCard';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { activityGrid } from '@/lib/dashboard';

const digits = (n: number) => n.toLocaleString('en');
const BAR = 48; // the height of the tallest capsule
const STUB = 6;

export function ActivityCard() {
  const c = useCardSky();
  const week = activityGrid().slice(21, 28); // the current week, Monday first
  const on = week.map((d) => !d.future && d.level > 0);
  const count = on.filter(Boolean).length;
  const todayIndex = week.reduce((a, d, i) => (d.future ? a : i), -1);
  const most = Math.max(1, ...week.map((d) => d.ayat));
  const letter = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: 'narrow' });
  // how tall a day's capsule is: by the reading of the day, from a third to the full height
  const height = (i: number) => (week[i].ayat > 0 ? BAR * (0.34 + 0.66 * (week[i].ayat / most)) : BAR * 0.4);

  return (
    <HomeCard>
      <View style={styles.head}>
        <Txt size={15} weight={700} color={c.ink}>
          {DASH.activity()}
        </Txt>
        <Txt size={14} weight={700} color={c.ink}>
          {DASH.activityOf7(digits(count))}
        </Txt>
      </View>
      <View style={styles.strip} accessible accessibilityLabel={`${count}/7`}>
        {week.map((d, i) => {
          const today = i === todayIndex;
          const ink = today ? c.hiInk : c.ink;
          return (
            <View key={d.day} style={[styles.day, { backgroundColor: today ? c.hi : c.pill }]}>
              <View style={styles.slot}>
                {on[i] ? (
                  <Grow axis="y" to={height(i)} delay={200 + i * 60} style={[styles.bar, { backgroundColor: ink, opacity: today ? 1 : 0.55 }]} />
                ) : (
                  <View style={[styles.bar, { height: STUB, backgroundColor: today ? c.hiInk : c.track, opacity: d.future ? 0.5 : 1 }]} />
                )}
              </View>
              <Txt size={11} weight={today ? 700 : 500} color={today ? c.hiInk : c.soft} center>
                {letter(d.day)}
              </Txt>
            </View>
          );
        })}
      </View>
      <Txt size={12} weight={500} color={c.soft}>
        {DASH.activityCaption()}
      </Txt>
    </HomeCard>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  strip: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, borderRadius: 10, paddingVertical: 6, alignItems: 'center', gap: 4 },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 12, borderRadius: 6 },
});
