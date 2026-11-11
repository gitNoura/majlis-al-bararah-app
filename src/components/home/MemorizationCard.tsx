// HOME, memorization and revision: one card of the prayer card's family with the two plans as two tinted pills side by side
// (as the prayer card has its five times). Each shows how far its plan is through its WHOLE run (not today's portions): a large
// percentage, a thin bar that draws in once, and the days done out of all its days; the memorization pill also says how many
// juz are memorized. With no plan of that kind yet it is a plain invitation to create one; a plan not begun says «Start
// today». A tap on a pill opens the Hifdh tab. Everything is read from the plan's saved state.
'use no memo'; // reads saved state (the plans) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { HomeCard, useCardSky } from '@/components/home/HomeCard';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { hifdhOverview, memorizedCells } from '@/lib/dashboard';

const digits = (n: number) => n.toLocaleString('en');

type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

function Plan({ title, part, emptyText, extra }: { title: string; part: Part; emptyText: string; extra?: string }) {
  const c = useCardSky();
  const pct = part.progress == null ? 0 : Math.round(part.progress * 100);
  const running = part.has && part.progress != null;
  const notBegun = running && part.days?.done === 0;
  const caption = part.progress == null ? DASH.planIdle() : part.days ? DASH.planDays(digits(part.days.done), digits(part.days.total)) : DASH.planOverall();
  return (
    <Pressable
      onPress={() => router.navigate('/hifdh')}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${running ? `${pct}%` : emptyText}`}
      style={({ pressed }) => [styles.plan, { backgroundColor: c.pill }, pressed && { opacity: 0.7 }]}
    >
      <Txt size={12} weight={700} color={c.soft} numberOfLines={1}>
        {title}
      </Txt>
      {part.has ? (
        <>
          <Txt size={26} weight={800} lineHeight={32} color={running ? c.ink : c.soft}>
            {running ? `${digits(pct)}%` : '–'}
          </Txt>
          <View style={[styles.track, { backgroundColor: c.track }]}>
            {running && pct > 0 && <Grow axis="x" to={Math.max(pct, 4) / 100} delay={300} style={{ height: '100%', borderRadius: 2, backgroundColor: c.hi }} />}
          </View>
          <Txt size={12} weight={500} color={c.soft} numberOfLines={2}>
            {caption}
          </Txt>
          {notBegun && (
            <Txt size={12} weight={700} color={c.ink} numberOfLines={1}>
              {DASH.planBegin()}
            </Txt>
          )}
          {!!extra && (
            <Txt size={12} weight={700} color={c.ink} numberOfLines={2}>
              {extra}
            </Txt>
          )}
        </>
      ) : (
        <>
          <Txt size={14} weight={700} lineHeight={20} color={c.ink} numberOfLines={3}>
            {emptyText}
          </Txt>
          <Txt size={12} weight={700} color={c.ink} numberOfLines={1}>
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
    <HomeCard style={styles.row}>
      <Plan title={DASH.memorizePlan()} part={o.memorize} emptyText={DASH.noMemorizePlan()} extra={juz > 0 ? `${digits(juz)} ${DASH.memorizedOf()}` : undefined} />
      <Plan title={DASH.revisionPlan()} part={o.revise} emptyText={DASH.noRevisionPlan()} />
    </HomeCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  plan: { flex: 1, gap: 4, borderRadius: 14, padding: 12 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', flexDirection: 'row', marginVertical: 4 },
});
