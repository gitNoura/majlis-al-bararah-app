// HOME, card 4: activity, this week. On the same neutral surface as the other Home cards (Surface), under a small green title: on one side the number of days the reader was with the Quran, out of seven, in words; on the other seven green
// capsules, one per day, Monday first, each as tall as the reading of that day (the ayat the wird counted; a day the reader only
// opened the mushaf or Hifdh is a middle height), a day without activity a short pale stub, a day still to come a fainter one,
// and today's letter in bold. A day counts when the reader opened the mushaf or Hifdh, or logged the wird (src/lib/activity.js).
// The capsules grow in once, one after another.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/motion';
import { Surface } from '@/components/home/Surface';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { activityGrid } from '@/lib/dashboard';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';
import { type } from '@/theme/type';

const digits = (n: number) => n.toLocaleString('en');
const BAR = 76; // the height of the tallest capsule

export function ActivityCard() {
  const h = useHome();
  const week = activityGrid().slice(21, 28); // the current week, Monday first
  const on = week.map((d) => !d.future && d.level > 0);
  const count = on.filter(Boolean).length;
  const todayIndex = week.reduce((a, d, i) => (d.future ? a : i), -1);
  const most = Math.max(1, ...week.map((d) => d.ayat));
  const letter = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: 'narrow' });
  // how tall a day's capsule is: by the reading of the day, from a third to the full height; a stub when there is none
  const height = (i: number) => (!on[i] ? 12 : week[i].ayat > 0 ? BAR * (0.34 + 0.66 * (week[i].ayat / most)) : BAR * 0.4);

  const bars = (
    <View key="bars" style={styles.bars} accessible accessibilityLabel={`${count}/7`}>
      {week.map((d, i) => (
        <View key={d.day} style={styles.col}>
          <View style={styles.slot}>
            {on[i] ? (
              <Grow axis="y" delay={i * 60} style={[styles.bar, { height: height(i), overflow: 'hidden' }]}>
                <LinearGradient colors={[h.deepTop, h.deepBottom]} style={StyleSheet.absoluteFill} />
              </Grow>
            ) : (
              <View style={[styles.bar, { height: height(i), backgroundColor: h.trackSoft, opacity: d.future ? 0.5 : 1 }, i === todayIndex && { borderWidth: 1.5, borderColor: h.deepTop, backgroundColor: 'transparent' }]} />
            )}
          </View>
          <Txt {...(i === todayIndex ? type.caption3 : type.caption4)} color={i === todayIndex ? h.ink : h.meta} center>
            {letter(d.day)}
          </Txt>
        </View>
      ))}
    </View>
  );
  const words = (
    <View key="words" style={styles.words}>
      <Txt {...type.heading4} color={h.ink} center>
        {DASH.activityOf7(digits(count))}
      </Txt>
      <Txt {...type.caption4} color={h.meta} center>
        {DASH.activityCaption()}
      </Txt>
    </View>
  );
  const divider = <View key="divider" style={[styles.divider, { backgroundColor: h.trackSoft }]} />;
  return (
    <Surface>
      <Txt {...type.title4} color={h.deepTop}>
        {DASH.activity()}
      </Txt>
      {/* the capsules are always at the right edge of the screen: first in Arabic (the line begins at the right), last otherwise */}
      <View style={styles.row}>{LANG === 'ar' ? [bars, divider, words] : [words, divider, bars]}</View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bars: { flex: 1.5, flexDirection: 'row', gap: 4 },
  col: { flex: 1, alignItems: 'center', gap: space.sm },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 16, borderRadius: 8 },
  divider: { width: StyleSheet.hairlineWidth * 2, alignSelf: 'stretch' },
  words: { flex: 1, gap: space.xs, alignItems: 'center' },
});
