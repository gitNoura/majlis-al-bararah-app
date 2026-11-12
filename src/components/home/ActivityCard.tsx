// HOME, activity this week: a glass card like the others. Top: the title and «3 of 7». Middle: seven bars, one per day,
// Monday first, as tall as the reading of that day (a day the reader only opened the mushaf or Hifdh is a middle height, a day without
// activity a short stub, a day still to come a fainter one). The bars are buttons: a tap picks a day (today first). Bottom: one row,
// the picked day and its ayat on one side, the streak (two days or more) on the other.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FlameIcon } from '@/components/icons';
import { Glass } from '@/components/home/Glass';
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
    <Glass gradient style={styles.card}>
      <View style={styles.head}>
        <Txt size={16} weight={800} color={k.ink}>
          {DASH.activity()}
        </Txt>
        <Txt size={14} weight={700} color={k.meta}>
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

      {(chosen || run > 1) && (
        <View style={styles.foot}>
          {chosen ? (
            <Txt size={13.5} weight={600} color={k.meta} style={{ flex: 1 }}>
              {dayName(chosen.day, 'long')} · {chosen.ayat > 0 ? DASH.activityAyat(chosen.ayat) : on[sel] ? DASH.activityVisit() : DASH.activityNone()}
            </Txt>
          ) : (
            <View style={{ flex: 1 }} />
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
      )}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bars: { flexDirection: 'row', gap: space.xs },
  col: { flex: 1, alignItems: 'center', gap: 8 },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 30, borderRadius: 11, borderCurve: 'continuous' },
});
