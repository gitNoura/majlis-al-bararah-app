// HOME, card 4: activity. The streak, and the last four weeks as a grid (a week to a row): the more kinds of activity
// a day had (the mushaf, adhkar, ahadith), the darker its cell. It replaces the calendar screen, which never opened anything.
'use no memo'; // reads saved state (the days) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { FlameIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { L } from '@/i18n/i18n';
import { streak } from '@/lib/activity';
import { activityGrid } from '@/lib/dashboard';
import { useTheme } from '@/theme/theme';

const CELL = 14;
const GAP = 3;

export function ActivityCard() {
  const { c } = useTheme();
  const grid = activityGrid();
  const days = streak() as number;
  // one colour (the accent) at three strengths; a day still to come is only an outline of the track
  const fill = [c.surface3, `${c.accent}59`, `${c.accent}99`, c.accent];
  return (
    <Card elevated style={{ padding: 14, gap: 8 }}>
      <Txt size={13} weight={700} color={c.meta}>
        {DASH.activity()}
      </Txt>
      <View style={styles.row}>
        <View style={{ gap: GAP }} accessible accessibilityLabel={DASH.last4()}>
          {[0, 1, 2, 3].map((w) => (
            <View key={w} style={{ flexDirection: 'row', gap: GAP }}>
              {grid.slice(w * 7, w * 7 + 7).map((d) => (
                <View key={d.day} style={[styles.cell, d.future ? { backgroundColor: c.surface2 } : { backgroundColor: fill[d.level] }]} />
              ))}
            </View>
          ))}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FlameIcon size={20} color={c.accent} />
            <Txt size={28} weight={800} lineHeight={34} color={c.ink}>
              {days.toLocaleString(L('ar', 'en', 'fr'))}
            </Txt>
          </View>
          <Txt size={13} color={c.meta}>
            {DASH.streakLabel()}
          </Txt>
          <Txt size={12} color={c.meta}>
            {DASH.last4()}
          </Txt>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  cell: { width: CELL, height: CELL, borderRadius: 4 },
});
