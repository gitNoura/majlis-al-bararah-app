// «My plans» (plansHTML of the website): each plan with Modify / Pause (or Resume) / Delete, and «Add plan».
// Flat (redesign v2): a plan is a block of text on the page with a hairline above it, not a card; the actions are quiet
// text buttons in one row, and «Modify» is the one filled button.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { SecondaryButton, useHeading } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { kindOf, paceText, rangeLabel } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

const DANGER = '#b3402f';

export function PlansList({ onEdit, onAdd }: { onEdit: (id: string) => void; onAdd: () => void }) {
  const { c } = useTheme();
  const h = useHome();
  const heading = useHeading();
  const { refresh } = useHif(); // also redraws the list whenever `rev` changes
  const plans = plan.get().plans as { id: string; type: string; range: number[][] | null }[];

  const confirmDelete = (id: string) =>
    Alert.alert(HIF.confirmDelete(), undefined, [
      { text: HIF.close(), style: 'cancel' },
      {
        text: HIF.deletePlan(),
        style: 'destructive',
        onPress: () => {
          plan.deletePlan(id);
          refresh();
        },
      },
    ]);

  return (
    <View style={{ gap: 14 }}>
      {plans.length === 0 && (
        <Txt size={14.5} center color={c.meta} style={{ paddingVertical: 12 }}>
          {HIF.noPlans()}
        </Txt>
      )}

      {plans.map((p) => {
        const paused = core.pausedNow(p);
        return (
          <View key={p.id} style={[styles.plan, { backgroundColor: h.card }, paused && { opacity: 0.75 }]}>
            <View style={styles.kindRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt size={13.5} weight={700} color={heading}>
                  {paused ? `${kindOf(p.type)} · ${HIF.paused()}` : kindOf(p.type)}
                </Txt>
                <Txt size={19} weight={800} color={c.ink}>
                  {rangeLabel(p.range, p.type)}
                </Txt>
              </View>
            </View>
            <Txt size={14} color={c.meta}>
              {paceText(p)}
            </Txt>
            <View style={styles.actions}>
              <Pressable onPress={() => onEdit(p.id)} accessibilityRole="button" style={[styles.modify, { backgroundColor: h.forest }]}>
                <Txt size={15} weight={700} color={h.forestInk}>
                  {HIF.modify()}
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => {
                  plan.setPaused(p.id, !paused);
                  refresh();
                }}
                hitSlop={6}
                accessibilityRole="button"
                style={styles.text}
              >
                <Txt size={15} weight={700} color={c.ink}>
                  {paused ? HIF.resume() : HIF.pause()}
                </Txt>
              </Pressable>
              <Pressable onPress={() => confirmDelete(p.id)} hitSlop={6} accessibilityRole="button" style={styles.text}>
                <Txt size={15} weight={700} color={DANGER}>
                  {HIF.delete()}
                </Txt>
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={{ paddingTop: 6 }}>
        <SecondaryButton square label={`+ ${HIF.addPlan()}`} onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plan: { gap: 16, padding: 18, borderRadius: 14 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  modify: { minHeight: 42, paddingHorizontal: 22, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { minHeight: 42, justifyContent: 'center' },
});
