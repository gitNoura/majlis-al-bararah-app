// «My plans» (plansHTML of the website): each plan with Modify / Pause (or Resume) / Delete, and «Add plan».
// Flat (redesign v2): a plan is a block of text on the page with a hairline above it, not a card; the actions are quiet
// text buttons in one row, and «Modify» is the one filled button.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { AccentPill, SecondaryButton } from '@/components/hifdh/Section';
import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { kindOf, paceText, rangeLabel } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

const DANGER = '#b3402f';

export function PlansList({ onEdit, onAdd }: { onEdit: (id: string) => void; onAdd: () => void }) {
  const { c } = useTheme();
  const h = useHome();
  const { refresh, openMemorized } = useHif(); // also redraws the list whenever `rev` changes
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
    <View>
      <Pressable onPress={openMemorized} accessibilityRole="button" style={[styles.link, { borderBottomColor: c.divider }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={17} weight={700} color={c.ink}>
            {HIF.memorizedTitle()}
          </Txt>
          <Txt size={13} color={c.meta}>
            {HIF.editMemorized()}
          </Txt>
        </View>
        <BackIcon color={c.meta} size={20} rtl={isEnglish} />
      </Pressable>

      {plans.length === 0 && (
        <Txt size={14.5} center color={c.meta} style={{ paddingVertical: 24 }}>
          {HIF.noPlans()}
        </Txt>
      )}

      {plans.map((p) => {
        const paused = core.pausedNow(p);
        return (
          <View key={p.id} style={[styles.plan, { borderBottomColor: c.divider }, paused && { opacity: 0.75 }]}>
            <View style={{ gap: 3 }}>
              <AccentPill text={paused ? `${kindOf(p.type)} · ${HIF.paused()}` : kindOf(p.type)} />
              <Txt size={18} weight={700} color={c.ink}>
                {rangeLabel(p.range, p.type)}
              </Txt>
              <Txt size={13.5} color={c.meta}>
                {paceText(p)}
              </Txt>
            </View>
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

      <View style={{ paddingTop: 20 }}>
        <SecondaryButton label={`+ ${HIF.addPlan()}`} onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  plan: { gap: 14, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  modify: { minHeight: 42, paddingHorizontal: 22, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  text: { minHeight: 42, justifyContent: 'center' },
});
