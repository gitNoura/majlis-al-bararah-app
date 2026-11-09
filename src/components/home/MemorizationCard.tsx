// HOME, card 3: two boxes side by side, one for the memorization plan and one for the revision plan. Each shows how far
// the plan is through its WHOLE run (a ring with the percentage, and the days done out of all its days), not today's
// portions; the memorization box also says how many juz are memorized. With no plan of that kind yet it is a short
// invitation to make one. A tap opens the Hifdh tab. Everything is read from the plan's own saved state.
'use no memo'; // reads the plan's own state (a module) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BookIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { L } from '@/i18n/i18n';
import { hifdhOverview, memorizedCells } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

type Part = { has: boolean; progress: number | null; days: { done: number; total: number } | null };

// the revision's mark: a circle of arrows
function RepeatIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
    </Svg>
  );
}

function PlanBox({ title, part, emptyText, memorize, extra }: { title: string; part: Part; emptyText: string; memorize?: boolean; extra?: string }) {
  const h = useHome();
  // the memorization box is green; the revision box takes the gold that breaks the green on the Hifdh page
  const tint = memorize ? { chip: h.tile, ink: h.tileInk, ring: h.leaf } : { chip: h.sand, ink: h.amber, ring: h.amber };
  const pct = part.progress == null ? 0 : Math.round(part.progress * 100);
  const caption = !part.has ? emptyText : part.progress == null ? DASH.planIdle() : part.days ? DASH.planDays(digits(part.days.done), digits(part.days.total)) : DASH.planOverall();
  return (
    <Pressable
      onPress={() => router.navigate('/hifdh')}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 6px 16px ${h.shadow}` }, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.head}>
        <View style={[styles.chip, { backgroundColor: tint.chip }]}>{memorize ? <BookIcon size={16} color={tint.ink} /> : <RepeatIcon size={16} color={tint.ink} />}</View>
        <Txt size={14} weight={700} color={h.ink} numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Txt>
      </View>
      <View style={styles.mid}>
        {part.has ? (
          <Ring value={pct / 100} size={78} color={tint.ring} track={h.well} a11y={`${pct}%`}>
            <Txt size={part.progress == null ? 22 : 18} weight={800} color={part.progress == null ? h.meta : h.ink}>
              {part.progress == null ? '–' : `${digits(pct)}%`}
            </Txt>
          </Ring>
        ) : (
          <View style={[styles.dash, { borderColor: h.cardLine, backgroundColor: h.well }]}>
            <Txt size={26} weight={700} color={h.meta}>
              +
            </Txt>
          </View>
        )}
      </View>
      <Txt size={12.5} weight={part.has && part.progress != null ? 700 : 500} color={part.has && part.progress != null ? h.ink : h.meta} center numberOfLines={2}>
        {caption}
      </Txt>
      {part.has && part.progress != null && !!part.days && (
        <Txt size={12} color={h.meta} center numberOfLines={1} style={{ marginTop: -6 }}>
          {DASH.planOverall()}
        </Txt>
      )}
      {!!extra && (
        <View style={[styles.pill, { backgroundColor: tint.chip }]}>
          <Txt size={12} weight={700} color={tint.ink} center numberOfLines={1}>
            {extra}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

export function MemorizationCard() {
  const o = hifdhOverview();
  const juz = Math.round(memorizedCells().reduce((a, b) => a + b, 0) * 10) / 10;
  return (
    <View style={styles.row}>
      <PlanBox memorize title={DASH.memorizePlan()} part={o.memorize} emptyText={DASH.noMemorizePlan()} extra={juz > 0 ? `${digits(juz)} ${DASH.memorizedOf()}` : undefined} />
      <PlanBox title={DASH.revisionPlan()} part={o.revise} emptyText={DASH.noRevisionPlan()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10, alignItems: 'center', overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' },
  chip: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  mid: { alignItems: 'center', justifyContent: 'center', minHeight: 78, marginTop: 2 },
  dash: { width: 78, height: 78, borderRadius: 39, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'stretch', borderRadius: 12, paddingVertical: 5, paddingHorizontal: 8 },
});
