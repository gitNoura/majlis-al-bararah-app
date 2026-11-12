// HOME, activity this week: on the page itself, no box. The title with «3 of 7» at the end, two small insights under it (the streak and
// this week's reading against last week's), then seven bars, one per day, Monday first, as tall as the reading of that day (the ayat the
// wird counted; a day the reader only opened the mushaf or Hifdh is a middle height, a day without activity a short stub, a day still to
// come a fainter one). A dashed line across them marks the week's average. The bars are buttons: a tap picks a day (today is picked
// first) and the line under the bars tells that day: its name, its ayat, whether it was the best of the week. Today's letter is bold
// with a dot under it. A day counts when the reader opened the mushaf or Hifdh, or logged the wird (src/lib/activity.js).
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
  const grid = activityGrid();
  const week = grid.slice(21, 28); // the current week, Monday first
  const last = grid.slice(14, 21); // the week before
  const on = week.map((d) => !d.future && d.level > 0);
  const count = on.filter(Boolean).length;
  const todayIndex = week.reduce((a, d, i) => (d.future ? a : i), -1);
  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked ?? todayIndex;

  const most = Math.max(1, ...week.map((d) => d.ayat));
  // how tall a day's bar is: by the reading of the day, from a third to the full height
  const height = (ayat: number) => BAR * (0.34 + 0.66 * (ayat / most));
  const read = week.filter((d) => !d.future && d.ayat > 0);
  const average = read.length ? Math.round(read.reduce((a, d) => a + d.ayat, 0) / read.length) : 0;
  const total = week.reduce((a, d) => a + d.ayat, 0);
  const before = last.reduce((a, d) => a + d.ayat, 0);
  const change = before > 0 ? Math.round(((total - before) / before) * 100) : null;
  const run = streak();
  const letter = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: 'narrow' });
  const name = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(LANG, { weekday: 'long' });
  const chosen = sel >= 0 ? week[sel] : null;
  const best = chosen && chosen.ayat > 0 && chosen.ayat === Math.max(...week.map((d) => d.ayat));

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

      {(run > 0 || (change !== null && change !== 0)) && (
        <View style={styles.chips}>
          {run > 0 && (
            <View style={[styles.chip, { backgroundColor: k.pill }]}>
              <FlameIcon color="#e8903a" size={13} />
              <Txt size={12} weight={700} color={k.ink}>
                {DASH.activityStreak(run)}
              </Txt>
            </View>
          )}
          {change !== null && change !== 0 && (
            <View style={[styles.chip, { backgroundColor: k.pill }]}>
              <Txt size={12} weight={700} color={k.ink}>
                {change > 0 ? '▲' : '▼'} {DASH.activityVsLast(change)}
              </Txt>
            </View>
          )}
        </View>
      )}

      <View style={styles.chart}>
        <View style={styles.bars} accessible accessibilityLabel={`${count}/7`}>
          {week.map((d, i) => {
            const today = i === todayIndex;
            const isSel = i === sel;
            return (
              <Pressable key={d.day} disabled={d.future} onPress={() => pick(i)} hitSlop={4} accessibilityRole="button" accessibilityLabel={`${name(d.day)}: ${d.ayat ? DASH.activityAyat(d.ayat) : DASH.activityNone()}`} style={styles.col}>
                <View style={styles.slot}>
                  {on[i] ? (
                    <Grow
                      axis="y"
                      to={d.ayat > 0 ? height(d.ayat) : BAR * 0.4}
                      delay={200 + i * 60}
                      style={[styles.bar, { backgroundColor: isSel ? k.hue : k.hueSoft }, isSel && { shadowColor: k.glow, shadowOpacity: k.glowOpacity, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }]}
                    />
                  ) : (
                    <View style={[styles.bar, { height: STUB, backgroundColor: k.pillTrack, opacity: d.future ? 0.5 : 1 }, isSel && { backgroundColor: k.hueSoft }]} />
                  )}
                </View>
                <Txt size={12} weight={today || isSel ? 800 : 500} color={today || isSel ? k.ink : k.meta} center>
                  {letter(d.day)}
                </Txt>
                <View style={[styles.dot, { backgroundColor: today ? k.ink : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>
        {average > 0 && <View pointerEvents="none" style={[styles.avg, { top: 4 + BAR - height(average), borderColor: k.meta }]} />}
      </View>

      {chosen && (
        <View style={[styles.detail, { borderTopColor: k.hairline }]}>
          <View style={styles.detailName}>
            <Txt size={14} weight={700} color={k.ink}>
              {name(chosen.day)}
            </Txt>
            {best && (
              <View style={[styles.tag, { backgroundColor: k.pill }]}>
                <Txt size={11} weight={700} color={k.ink}>
                  {DASH.activityBest()}
                </Txt>
              </View>
            )}
          </View>
          <View style={styles.detailName}>
            <Txt size={14} weight={700} color={k.ink}>
              {chosen.ayat > 0 ? DASH.activityAyat(chosen.ayat) : on[sel] ? DASH.activityVisit() : DASH.activityNone()}
            </Txt>
            {average > 0 && (
              <Txt size={12} color={k.meta}>
                · {DASH.activityAvg(average)}
              </Txt>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, paddingHorizontal: space.xs, paddingVertical: space.sm },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderCurve: 'continuous' },
  chart: { paddingTop: 4 },
  bars: { flexDirection: 'row', gap: space.xs },
  col: { flex: 1, alignItems: 'center', gap: space.xs },
  slot: { height: BAR, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 20, borderRadius: 8, borderCurve: 'continuous' },
  dot: { width: 5, height: 5, borderRadius: 3 },
  avg: { position: 'absolute', left: 0, right: 0, height: 0, borderTopWidth: 1, borderStyle: 'dashed', opacity: 0.45 },
  detail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.sm, marginTop: 2 },
  detailName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderCurve: 'continuous' },
});
