// «My plans» (plansHTML of the website): a card per plan with Modify / Pause (or Resume) / Delete, and «Add plan».
// `PlansTile` is the door to it from the plan screen.
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { PrimaryButton, SecondaryButton } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { kindOf, paceText, rangeLabel } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export function PlansTile({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.tile, { backgroundColor: c.card, borderColor: c.line }]}
    >
      <Txt serif size={18} weight={700} color={c.ink} style={{ flex: 1 }}>
        {HIF.myPlans()}
      </Txt>
      <Txt size={22} color={c.meta} style={isEnglish ? undefined : { transform: [{ scaleX: -1 }] }}>
        ›
      </Txt>
    </Pressable>
  );
}

export function PlansList({ onEdit, onAdd }: { onEdit: (id: string) => void; onAdd: () => void }) {
  const { c } = useTheme();
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
    <View style={{ gap: 12 }}>
      {plans.length === 0 && (
        <Txt size={14.5} center color={c.meta} style={{ paddingVertical: 12 }}>
          {HIF.noPlans()}
        </Txt>
      )}
      {plans.map((p) => {
        const paused = core.pausedNow(p);
        return (
          <View key={p.id} style={[styles.card, { backgroundColor: c.card, borderColor: c.line }, paused && { opacity: 0.8 }]}>
            <View style={{ gap: 2 }}>
              <Txt size={13} color={c.meta}>
                {kindOf(p.type)}
              </Txt>
              <Txt size={17} weight={700} color={c.ink}>
                {rangeLabel(p.range, p.type)}
              </Txt>
              <Txt size={13} color={c.meta}>
                {paceText(p)}
              </Txt>
              {paused && (
                <Txt size={13} weight={700} color={c.goldStrong}>
                  {HIF.paused()}
                </Txt>
              )}
            </View>
            <View style={styles.actions}>
              <View style={styles.btn}>
                <PrimaryButton label={HIF.modify()} onPress={() => onEdit(p.id)} />
              </View>
              <View style={styles.btn}>
                <SecondaryButton
                  label={paused ? HIF.resume() : HIF.pause()}
                  onPress={() => {
                    plan.setPaused(p.id, !paused);
                    refresh();
                  }}
                />
              </View>
              <Pressable onPress={() => confirmDelete(p.id)} accessibilityRole="button" style={[styles.danger, { borderColor: DANGER }]}>
                <Txt size={15} weight={700} color={DANGER}>
                  {HIF.delete()}
                </Txt>
              </Pressable>
            </View>
          </View>
        );
      })}
      <SecondaryButton label={`+ ${HIF.addPlan()}`} onPress={onAdd} />
    </View>
  );
}

const DANGER = '#b3402f';

const styles = StyleSheet.create({
  tile: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, minHeight: 60 },
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  btn: { flexGrow: 1, flexBasis: 100 },
  danger: { minHeight: 48, borderRadius: radius.button, borderWidth: 1.5, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});
