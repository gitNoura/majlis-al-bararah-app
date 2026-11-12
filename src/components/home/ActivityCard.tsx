// HOME, activity this week: on the page itself, no box. The title and «3 of 7» at the end, then seven bars, one per day,
// Monday first, as tall as the reading of that day (the ayat the
// wird counted; a day the reader only opened the mushaf or Hifdh is a middle height, a day without activity a short stub, a day still to
// come a fainter one). The bars are buttons: a tap picks a day (today is picked
// first) and the line under the bars tells that day: its name and its ayat. The picked day's name is bold. A day counts when the reader opened the mushaf or Hifdh, or logged the wird (src/lib/activity.js).
// Under that line, when the streak is two days or more, one quiet line says it: the flame and «5-day streak».
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FlameIcon } from '@/components/icons';
import { Grow } from '@/components/home/Grow';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { streak } from '@/lib/activity';
import { activityGrid } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');
const BAR = 64; // the height of the tallest bar
const STUB = 8;

export function ActivityCard() {
  const k = useSkin();
  const week = activityGrid().slice(21, 28); // the current week, Monday first
  const on = week.map((d) => !d.future && d.level > 0);
  const count = on.filter(Boolean).length;
  const todayIndex = week.reduce((a, d, i) => (d.future ? a : i), -1);
  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked ?? todayIndex;
  const run = streak();

  const most = Math.max(1, ...week.map((d) => d.ayat));
  // how tall a day's bar is: by the reading of the day, from a third to the full height
  const height = (ayat: number) => BAR * (0.34 + 0.66 * (ayat / most));
  const dayName = (day: string, style: 'short' | 'long') => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: style });
  const chosen = sel >= 0 ? week[sel] : null;

  const pick = (i: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked(i);
  };

  return (
    <View style={styles.wrap}>
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
          const isSel = i === sel;
          return (
            <Pressable key={d.day} disabled={d.future} onPress={() => pick(i)} hitSlop={4} accessibilityRole="button" accessibilityLabel={`${dayName(d.day, 'long')}: ${d.ayat ? DASH.activityAyat(d.ayat) : DASH.activityNone()}`} style={styles.col}>
              <View style={styles.slot}>
                {on[i] ? (
                  <Grow axis="y" to={d.ayat > 0 ? height(d.ayat) : BAR * 0.4} delay={200 + i * 60} style={[styles.bar, { backgroundColor: isSel ? k.hue : k.hueSoft }]} />
                ) : (
                  <View style={[styles.bar, { height: STUB, backgroundColor: isSel ? k.hueSoft : k.pillTrack, opacity: d.future ? 0.5 : 1 }]} />
                )}
              </View>
              <Txt size={11.5} weight={isSel ? 800 : 500} color={isSel ? k.ink : k.meta} center numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {dayName(d.day, 'short')}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {chosen && (
        <Txt size={13.5} weight={600} color={k.meta} center>
          {dayName(chosen.day, 'long')} · {chosen.ayat > 0 ? DASH.activityAyat(chosen.ayat) : on[sel] ? DASH.activityVisit() : DASH.activityNone()}
        </Txt>
      )}

      {run > 1 && (
        <View style={styles.streak}>
          <FlameIcon color="#e8903a" size={14} />
          <Txt size={13} weight={700} color={k.ink}>
            {DASH.activityStreak(run)}
          </Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md, paddingHorizontal: space.xs, paddingVertical: space.sm },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  streak: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  bars: { flexDirection: 'row', gap: space.xs },
  col: { flex: 1, alignItems: 'center', gap: 8 },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 30, borderRadius: 11, borderCurve: 'continuous' },
});
