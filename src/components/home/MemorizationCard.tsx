// HOME, memorization and revision: the two plans side by side, open on the page (no panel, no line between them). Each shows how far its plan is through its WHOLE run (not today's portions): a large
// percentage, a thin bar that draws in once, and the days done out of all its days; the memorization side also says how
// many juz are memorized. With no plan of that kind yet it is a plain invitation to create one; a plan not begun says
// «Start today». A tap opens the Hifdh tab. Everything is read from the plan's saved state.
'use no memo'; // reads saved state (the plans) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { hifdhOverview, memorizedCells } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');

type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

function Plan({ title, part, emptyText, extra }: { title: string; part: Part; emptyText: string; extra?: string }) {
  const k = useSkin();
  const pct = part.progress == null ? 0 : Math.round(part.progress * 100);
  const running = part.has && part.progress != null;
  const notBegun = running && part.days?.done === 0;
  const caption = part.progress == null ? DASH.planIdle() : part.days ? DASH.planDays(digits(part.days.done), digits(part.days.total)) : DASH.planOverall();
  return (
    <Pressable
      onPress={() => router.navigate('/hifdh')}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${running ? `${pct}%` : emptyText}`}
      style={({ pressed }) => [styles.plan, pressed && { opacity: 0.7 }]}
    >
      <Txt {...T.smallBold} color={k.meta} numberOfLines={1}>
        {title}
      </Txt>
      {part.has ? (
        <>
          <Txt {...T.big} size={34} lineHeight={42} color={running ? k.ink : k.meta}>
            {running ? `${digits(pct)}%` : '–'}
          </Txt>
          <View style={[styles.track, { backgroundColor: k.track }]}>
            {running && pct > 0 && (
              <Grow axis="x" to={Math.max(pct, 6) / 100} delay={300} style={{ height: '100%', borderRadius: 5, boxShadow: `0px 3px 8px ${k.lift}` }}>
                <LinearGradient colors={[k.spark, k.fill]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 5 }} />
              </Grow>
            )}
          </View>
          <Txt {...T.small} color={k.meta} numberOfLines={2}>
            {caption}
          </Txt>
          {notBegun && (
            <Txt {...T.smallBold} color={k.ink} numberOfLines={1}>
              {DASH.planBegin()}
            </Txt>
          )}
          {!!extra && (
            <Txt {...T.smallBold} color={k.ink} numberOfLines={2}>
              {extra}
            </Txt>
          )}
        </>
      ) : (
        <>
          <Txt {...T.title} color={k.ink} numberOfLines={3}>
            {emptyText}
          </Txt>
          <Txt {...T.smallBold} color={k.ink} numberOfLines={1}>
            {DASH.createPlan()}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

export function MemorizationCard() {
  const o = hifdhOverview();
  const juz = Math.round(memorizedCells().reduce((a, b) => a + b, 0) * 10) / 10;
  return (
    <View style={styles.row}>
      <Plan title={DASH.memorizePlan()} part={o.memorize} emptyText={DASH.noMemorizePlan()} extra={juz > 0 ? `${digits(juz)} ${DASH.memorizedOf()}` : undefined} />
      <View style={styles.gap} />
      <Plan title={DASH.revisionPlan()} part={o.revise} emptyText={DASH.noRevisionPlan()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: space.xs },
  plan: { flex: 1, gap: space.xs },
  gap: { width: space.xl },
  track: { height: 10, borderRadius: 5, flexDirection: 'row', marginVertical: space.sm },
});
