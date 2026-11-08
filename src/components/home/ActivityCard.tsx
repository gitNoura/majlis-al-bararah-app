// HOME, card 4: activity. This week as seven pairs of capsules, Monday first: the left one (hatched-pale) is the same
// weekday last week, the right one is this week, each filled by how many kinds of activity the day had (the mushaf,
// adhkar, ahadith). Today's letter sits on a dark pill; days still to come stay empty. The streak is the soft-green tile above.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG, LOCALE } from '@/i18n/i18n';
import { activityGrid } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const BAR_H = 48;
const FILL = [0, 0.34, 0.67, 1]; // level 0 to 3 as a share of the capsule

// Monday to Sunday, written by the phone in the language of the moment (2024-01-01 was a Monday)
const weekdays = () =>
  Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(LANG === 'ar' ? LOCALE : LANG, { weekday: LANG === 'ar' ? 'short' : 'narrow' }));

function Capsule({ share, color, track }: { share: number; color: string; track: string }) {
  return (
    <View style={[styles.cap, { backgroundColor: track }]}>
      <View style={{ height: share * BAR_H, backgroundColor: color, borderRadius: 6 }} />
    </View>
  );
}

export function ActivityCard() {
  const h = useHome();
  const grid = activityGrid();
  const thisWeek = grid.slice(21, 28);
  const lastWeek = grid.slice(14, 21);
  const todayIndex = thisWeek.reduce((at, d, i) => (d.future ? at : i), 0);
  const names = weekdays();
  return (
    <View style={[styles.card, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 8px 20px ${h.shadow}` }]}>
      <View style={styles.head}>
        <Txt size={15} weight={700} color={h.ink}>
          {DASH.activity()}
        </Txt>
        <View style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: h.ghost }]} />
          <Txt size={12} color={h.meta}>
            {DASH.lastWeek()}
          </Txt>
          <View style={[styles.swatch, { backgroundColor: h.leaf, marginStart: 8 }]} />
          <Txt size={12} color={h.meta}>
            {DASH.thisWeek()}
          </Txt>
        </View>
      </View>
      <View style={styles.week} accessible accessibilityLabel={DASH.thisWeek()}>
        {thisWeek.map((d, i) => (
          <View key={d.day} style={styles.day}>
            <View style={styles.pair}>
              <Capsule share={FILL[lastWeek[i].level]} color={h.ghost} track={h.well} />
              <Capsule share={d.future ? 0 : FILL[d.level]} color={h.leaf} track={h.well} />
            </View>
            <View style={[styles.name, i === todayIndex && { backgroundColor: h.forest }]}>
              <Txt size={12} weight={i === todayIndex ? 800 : 500} color={i === todayIndex ? h.forestInk : h.meta} center numberOfLines={1}>
                {names[i]}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  pair: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  cap: { width: 10, height: BAR_H, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  name: { minWidth: 30, height: 22, paddingHorizontal: 6, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
