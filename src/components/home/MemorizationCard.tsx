// HOME, card 3: two boxes side by side, one for the memorization plan and one for the revision plan. Each shows how many
// of today's portions are done (a ring with done/total in it), or, when there is no plan of that kind yet, a short
// invitation to make one. A tap opens the Hifdh tab. Everything is read from the plan's own saved state.
'use no memo'; // reads the plan's own state (a module) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { L } from '@/i18n/i18n';
import { hifdhToday, memorizedCells } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

type Part = { total: number; done: number };

function PlanBox({ title, has, part, emptyText, extra }: { title: string; has: boolean; part: Part; emptyText: string; extra?: string }) {
  const h = useHome();
  const finished = has && part.total > 0 && part.done >= part.total;
  const caption = !has ? emptyText : part.total === 0 ? DASH.nothingToday() : finished ? DASH.allDone() : DASH.portionsDone();
  return (
    <Pressable
      onPress={() => router.navigate('/hifdh')}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 6px 16px ${h.shadow}` }, pressed && { opacity: 0.9 }]}
    >
      <Txt size={14} weight={700} color={h.ink} numberOfLines={1}>
        {title}
      </Txt>
      <View style={styles.mid}>
        {has && part.total > 0 ? (
          <Ring value={part.done / part.total} size={60} color={h.leaf} track={h.well} a11y={`${part.done}/${part.total}`}>
            {finished ? (
              <CheckIcon size={22} color={h.leaf} />
            ) : (
              <Txt size={15} weight={800} color={h.ink}>
                {`${digits(part.done)}/${digits(part.total)}`}
              </Txt>
            )}
          </Ring>
        ) : (
          <View style={[styles.dash, { backgroundColor: h.well }]}>
            <Txt size={22} weight={700} color={h.meta}>
              {has ? '–' : '+'}
            </Txt>
          </View>
        )}
      </View>
      <Txt size={12.5} color={h.meta} center numberOfLines={2}>
        {caption}
      </Txt>
      {!!extra && (
        <Txt size={12.5} weight={700} color={h.ink} center numberOfLines={1}>
          {extra}
        </Txt>
      )}
    </Pressable>
  );
}

export function MemorizationCard() {
  const today = hifdhToday();
  const juz = Math.round(memorizedCells().reduce((a, b) => a + b, 0) * 10) / 10;
  return (
    <View style={styles.row}>
      <PlanBox title={DASH.memorizePlan()} has={today.hasMemorize} part={today.memorize} emptyText={DASH.noMemorizePlan()} extra={juz > 0 ? `${digits(juz)} ${DASH.memorizedOf()}` : undefined} />
      <PlanBox title={DASH.revisionPlan()} has={today.hasRevise} part={today.revise} emptyText={DASH.noRevisionPlan()} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10, alignItems: 'center', overflow: 'hidden' },
  mid: { alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  dash: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
