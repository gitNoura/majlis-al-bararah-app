// HOME, card 3: two cards side by side, one for the memorization plan and one for the revision plan, on the neutral surface of the
// Home cards (Surface). Each shows how far its plan is through its WHOLE run (not today's portions): a large percentage, a slim
// green bar, and the days done out of all its days; the memorization card also says how many juz are memorized. With no plan of
// that kind yet it is a composed invitation (the words and a green «Create a plan»), never a blank box; a plan not begun says
// «Start today». The bar grows in once. A tap opens the Hifdh tab. Everything is read from the plan's saved state.
'use no memo'; // reads saved state (the plans) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Grow } from '@/components/home/motion';
import { Surface } from '@/components/home/Surface';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { hifdhOverview, memorizedCells } from '@/lib/dashboard';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';
import { type } from '@/theme/type';

const digits = (n: number) => n.toLocaleString('en');

type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

function PlanBox({ title, part, emptyText, extra }: { title: string; part: Part; emptyText: string; extra?: string }) {
  const h = useHome();
  const pct = part.progress == null ? 0 : Math.round(part.progress * 100);
  const running = part.has && part.progress != null;
  const notBegun = running && part.days?.done === 0;
  const caption = part.progress == null ? DASH.planIdle() : part.days ? DASH.planDays(digits(part.days.done), digits(part.days.total)) : DASH.planOverall();
  return (
    <Pressable onPress={() => router.navigate('/hifdh')} accessibilityRole="button" accessibilityLabel={`${title} ${running ? `${pct}%` : emptyText}`} style={({ pressed }) => [{ flex: 1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Surface style={{ flex: 1 }}>
        <Txt {...type.title4} color={h.deepTop} numberOfLines={1}>
          {title}
        </Txt>
        {part.has ? (
          <>
            <Txt {...type.heading3} color={running ? h.ink : h.meta}>
              {running ? `${digits(pct)}%` : '–'}
            </Txt>
            <View style={[styles.track, { backgroundColor: h.trackSoft }]}>
              {running && pct > 0 && (
                <Grow axis="x" delay={240} style={{ width: `${Math.max(pct, 4)}%`, height: '100%', borderRadius: 3, overflow: 'hidden' }}>
                  <LinearGradient colors={[h.deepTop, h.deepBottom]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                </Grow>
              )}
            </View>
            <Txt {...type.caption4} color={h.meta} numberOfLines={2}>
              {caption}
            </Txt>
            {notBegun && (
              <Txt {...type.caption3} color={h.deepTop} numberOfLines={1}>
                {DASH.planBegin()}
              </Txt>
            )}
          </>
        ) : (
          <>
            <Txt {...type.title2} color={h.ink} numberOfLines={3}>
              {emptyText}
            </Txt>
            <Txt {...type.caption3} color={h.deepTop} numberOfLines={1}>
              {DASH.createPlan()}
            </Txt>
          </>
        )}
        {!!extra && (
          <View style={[styles.panel, { backgroundColor: h.greenSoft }]}>
            <Txt {...type.caption3} color={h.deepTop} numberOfLines={1}>
              {extra}
            </Txt>
          </View>
        )}
      </Surface>
    </Pressable>
  );
}

export function MemorizationCard() {
  const o = hifdhOverview();
  const juz = Math.round(memorizedCells().reduce((a, b) => a + b, 0) * 10) / 10;
  return (
    <View style={styles.row}>
      <PlanBox title={DASH.memorizePlan()} part={o.memorize} emptyText={DASH.noMemorizePlan()} extra={juz > 0 ? `${digits(juz)} ${DASH.memorizedOf()}` : undefined} />
      <PlanBox title={DASH.revisionPlan()} part={o.revise} emptyText={DASH.noRevisionPlan()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  // a label inside the card (22) with 16 of padding: 22 - 16 = 6
  panel: { borderRadius: 6, paddingHorizontal: space.cozy, paddingVertical: space.sm },
});
