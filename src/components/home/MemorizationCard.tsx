// HOME, card 3: memorization, as numbers (the tasks themselves are in the Hifdh tab, which this card opens). The juz
// memorized, the 30 juz as 30 upright capsules filled from the bottom by how much of each is memorized, and today's
// portions as two small pills (new, revision) that turn soft green with a tick once they are done.
'use no memo'; // reads the plan's own state (a module) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Chevron } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { L } from '@/i18n/i18n';
import { hifdhToday, memorizedCells } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));
const BAR_H = 34;

export function MemorizationCard() {
  const h = useHome();
  const cells = memorizedCells();
  const juz = Math.round(cells.reduce((a, b) => a + b, 0) * 10) / 10;
  const today = hifdhToday();
  const pills = [
    { label: DASH.newLabel(), ...today.memorize },
    { label: DASH.revisionLabel(), ...today.revise },
  ].filter((p) => p.total > 0);
  return (
    <Pressable
      onPress={() => router.navigate('/hifdh')}
      accessibilityRole="button"
      accessibilityLabel={HOME.memorize()}
      style={({ pressed }) => [styles.card, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 8px 20px ${h.shadow}` }, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.head}>
        <Txt size={15} weight={700} color={h.ink}>
          {HOME.memorize()}
        </Txt>
        <View style={[styles.go, { backgroundColor: h.well }]}>
          <Chevron color={h.ink} size={16} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <Txt size={28} weight={800} lineHeight={34} color={h.ink}>
          {digits(juz)}
        </Txt>
        <Txt size={14} color={h.meta}>
          {DASH.memorizedOf()}
        </Txt>
      </View>
      <View style={styles.bars} accessible accessibilityRole="progressbar" accessibilityLabel={DASH.memorizedOf()} accessibilityValue={{ min: 0, max: 30, now: Math.round(juz) }}>
        {cells.map((n, i) => (
          <View key={i} style={[styles.bar, { backgroundColor: h.well }]}>
            <View style={{ height: Math.max(0, Math.min(1, n)) * BAR_H, backgroundColor: h.leaf }} />
          </View>
        ))}
      </View>
      {today.hasPlan ? (
        pills.length ? (
          <View style={styles.pills}>
            {pills.map((p) => {
              const done = p.done >= p.total;
              return (
                <View key={p.label} style={[styles.pill, done ? { backgroundColor: h.tile } : { borderColor: h.cardLine, borderWidth: 1, backgroundColor: h.well }]}>
                  {done && <CheckIcon size={14} color={h.tileInk} />}
                  <Txt size={13} weight={700} color={done ? h.tileInk : h.ink}>
                    {`${p.label} ${digits(p.done)}/${digits(p.total)}`}
                  </Txt>
                </View>
              );
            })}
          </View>
        ) : (
          <Txt size={14} weight={600} color={h.meta}>
            {DASH.nothingToday()}
          </Txt>
        )
      ) : (
        <View style={[styles.empty, { backgroundColor: h.well }]}>
          <Txt size={14} weight={700} color={h.ink}>
            {DASH.noPlan()}
          </Txt>
          <Txt size={13} color={h.meta}>
            {DASH.noPlanSub()}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 8, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  go: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: BAR_H, marginTop: 0 },
  bar: { flex: 1, height: BAR_H, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 30, borderRadius: 15 },
  empty: { borderRadius: 14, padding: 10, gap: 2, marginTop: 2 },
});
