// «History» (historyHTML, openStatus and the «History» tile of the website): the past days, newest first, with
// each planned portion and how it went; a tap opens the status sheet (done / stopped at an ayah / not done /
// clear the mark); an extra-revision session is removed with a tap. 40 days at a time, then «Older».
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, Section } from '@/components/hifdh/Section';
import { CalendarIcon, CloseIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { dayText, kindOf, portionName, rangeLabel, STATUS } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';
import type { Row } from '@/components/hifdh/StopSheet';

const PAGE = 40; // days shown at a time

export function HistoryTile({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.tile, { backgroundColor: c.card, borderColor: c.line }]}>
      <View style={[styles.tileIcon, { backgroundColor: c.soft }]}>
        <CalendarIcon color={c.ink} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt serif size={18} weight={700} color={c.ink}>
          {HIF.history()}
        </Txt>
        <Txt size={13} color={c.meta}>
          {HIF.pastDays()}
        </Txt>
      </View>
      <Txt size={22} color={c.meta} style={isEnglish ? undefined : { transform: [{ scaleX: -1 }] }}>
        ›
      </Txt>
    </Pressable>
  );
}

// The sheet of one past portion: how did it go?
function StatusSheet({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { refresh, openStop } = useHif();
  if (!row) return null;
  const weekly = row.week != null || row.weekly;
  const unit = row.version?.unit ?? core.versionAt(row.plan, row.day).unit;

  const set = (v: 'done' | 'notdone' | 'untouched') => {
    plan.mark(row, v);
    onClose();
    refresh();
  };
  const stop = () => {
    onClose();
    openStop(row); // «where did you stop?» (HifProvider marks it)
  };
  const options: { v: string; label: string; hint?: string; onPress: () => void }[] = [
    { v: 'done', label: STATUS.done(), onPress: () => set('done') },
    ...(weekly
      ? []
      : [
          { v: 'partial', label: HIF.stoppedAt(), onPress: stop },
          { v: 'notdone', label: HIF.markNotDone(), hint: HIF.markNotDoneHint(), onPress: () => set('notdone') },
        ]),
    { v: 'untouched', label: HIF.clearMark(), onPress: () => set('untouched') },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]} onPress={onClose} accessibilityLabel={HIF.close()} />
        <View style={[styles.panel, { backgroundColor: c.panel, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.head}>
            <Txt serif size={20} weight={700} color={c.ink} style={{ flex: 1 }}>
              {dayText(row.day)}
            </Txt>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={HIF.close()}>
              <CloseIcon color={c.ink} size={22} />
            </Pressable>
          </View>
          <Hint>{portionName(row.segs, unit)}</Hint>
          <View style={{ gap: 8, marginTop: 10 }}>
            {options.map((o) => {
              const on = row.status === o.v;
              return (
                <View key={o.v} style={{ gap: 4 }}>
                  <Pressable
                    onPress={o.onPress}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.option, { borderColor: on ? c.chosenLine : c.line, backgroundColor: on ? c.soft : c.card }]}
                  >
                    <Txt size={15.5} weight={700} color={c.ink}>
                      {o.label}
                    </Txt>
                  </Pressable>
                  {o.hint ? <Hint>{o.hint}</Hint> : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function HistoryScreen() {
  const { c } = useTheme();
  const { refresh, toast } = useHif(); // also redraws the list whenever `rev` changes
  const [shownDays, setShownDays] = useState(PAGE);
  const [statusRow, setStatusRow] = useState<Row | null>(null);
  const days = plan.history() as { day: string; rows: Row[]; extras: { id: string; seg: number[][] }[] }[];

  if (!days.length) return <Hint>{HIF.noHistory()}</Hint>;
  const shown = days.slice(0, shownDays);

  return (
    <View style={{ gap: 14 }}>
      {shown.map((d) => (
        <Section key={d.day} title={dayText(d.day)}>
          {d.rows.map((r) => {
            const name = r.weekly ? portionName(r.segs, core.versionAt(r.plan, r.day).unit) : portionName(r.segs, r.version.unit);
            return (
              <Pressable
                key={`${r.plan.id}|${r.day}|${r.entry?.id ?? ''}`}
                onPress={() => setStatusRow(r)}
                accessibilityRole="button"
                style={[styles.item, { borderColor: c.line, backgroundColor: r.status === 'done' ? c.soft : 'transparent' }]}
              >
                <View style={{ flex: 1 }}>
                  <Txt size={12.5} color={c.meta}>
                    {kindOf(r.plan.type)}
                  </Txt>
                  <Txt size={15.5} weight={700} color={c.ink}>
                    {name}
                  </Txt>
                </View>
                <Txt size={13} weight={600} color={r.status === 'done' || r.status === 'partial' ? c.ink : c.meta}>
                  {STATUS[r.status as keyof typeof STATUS]()}
                </Txt>
              </Pressable>
            );
          })}
          {d.extras.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => {
                plan.removeEntry(e.id);
                toast(HIF.sessionRemoved());
                refresh();
              }}
              accessibilityRole="button"
              style={[styles.item, { borderColor: c.line, backgroundColor: c.soft }]}
            >
              <View style={{ flex: 1 }}>
                <Txt size={12.5} color={c.meta}>
                  {HIF.extraRevision()}
                </Txt>
                <Txt size={15.5} weight={700} color={c.ink}>
                  {rangeLabel(e.seg, 'revise')}
                </Txt>
              </View>
              <Txt size={13} weight={600} color={c.ink}>
                {STATUS.done()}
              </Txt>
            </Pressable>
          ))}
        </Section>
      ))}
      {days.length > shown.length && (
        <Pressable onPress={() => setShownDays((n) => n + PAGE)} accessibilityRole="button" style={{ alignItems: 'center', paddingVertical: 10 }}>
          <Txt size={15} weight={700} color={c.ink}>
            {HIF.older()}
          </Txt>
        </Pressable>
      )}
      <StatusSheet row={statusRow} onClose={() => setStatusRow(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, boxShadow: '0px 10px 26px rgba(68, 55, 43, 0.10)' },
  tileIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  root: { flex: 1, justifyContent: 'flex-end' },
  panel: { maxHeight: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  option: { minHeight: 48, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.chip, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});
