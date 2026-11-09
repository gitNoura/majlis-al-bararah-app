// HOME, card 4: activity. Three plain numbers instead of a chart: the days this week the reader was active (out of 7, with
// seven slim segments under it, Monday first, today's the last one lit so far), the same count for last week, and for the
// last four weeks (out of 28). A day counts when the reader opened the mushaf or Hifdh, or logged the wird (src/lib/activity.js).
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { L } from '@/i18n/i18n';
import { activityGrid } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));
const active = (cells: { level: number; future: boolean }[]) => cells.filter((d) => !d.future && d.level > 0).length;

export function ActivityCard() {
  const h = useHome();
  const grid = activityGrid();
  const thisWeek = grid.slice(21, 28);
  const lastWeek = grid.slice(14, 21);
  const now = active(thisWeek);
  const stat = (value: string, label: string) => (
    <View style={{ flex: 1, gap: 2 }}>
      <Txt size={17} weight={800} color={h.ink}>
        {value}
      </Txt>
      <Txt size={12} color={h.meta} numberOfLines={2}>
        {label}
      </Txt>
    </View>
  );
  return (
    <View style={[styles.card, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 8px 20px ${h.shadow}` }]}>
      <Txt size={15} weight={700} color={h.ink}>
        {DASH.activity()}
      </Txt>
      <View style={styles.big}>
        <Txt size={38} weight={800} lineHeight={44} color={h.ink}>
          {digits(now)}
        </Txt>
        <Txt size={15} weight={500} color={h.meta}>
          {`/ ${digits(7)}  ${DASH.activeDaysWeek()}`}
        </Txt>
      </View>
      <View style={styles.segments} accessible accessibilityLabel={`${now}/7`}>
        {thisWeek.map((d) => (
          <View key={d.day} style={[styles.segment, { backgroundColor: !d.future && d.level > 0 ? h.leaf : h.well }]} />
        ))}
      </View>
      <View style={[styles.foot, { borderTopColor: h.cardLine }]}>
        {stat(`${digits(active(lastWeek))} / ${digits(7)}`, DASH.lastWeek())}
        {stat(`${digits(active(grid))} / ${digits(28)}`, DASH.last4())}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10, overflow: 'hidden' },
  big: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  segments: { flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  foot: { flexDirection: 'row', gap: 12, paddingTop: 12, marginTop: 2, borderTopWidth: StyleSheet.hairlineWidth },
});
