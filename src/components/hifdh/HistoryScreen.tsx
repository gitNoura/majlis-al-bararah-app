// «History» (historyHTML, openStatus and the «History» tile of the website): the past days, newest first, with
// each planned portion and how it went; a tap opens the status sheet (done / stopped at an ayah / not done /
// clear the mark); an extra-revision session is removed with a tap. 40 days at a time, then «Older».
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHif } from '@/components/hifdh/HifProvider';
import { Heading, Hint, Section, useGreen } from '@/components/hifdh/Section';
import { ProgressRing } from '@/components/hifdh/ProgressRing';
import { CloseIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { dayText, kindOf, num, portionName, rangeLabel, STATUS } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';
import type { Row } from '@/components/hifdh/StopSheet';

const PAGE = 40; // days shown at a time

// «Progress» (the home of the history): a heading with a link to the history, then two cards side by side, as in the
// reference: how far the plans are (a ring and the big value beside it) and the way into the past days.
export function ProgressSection({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  const g = useGreen();
  const p = plan.planProgress();
  const pct = p == null ? null : Math.round(p * 100);
  const arrow = <Txt size={20} color={c.meta} style={isEnglish ? undefined : { transform: [{ scaleX: -1 }] }}>›</Txt>;
  return (
    <View style={{ gap: 12 }}>
      <Heading title={HIF.progress()} link={HIF.history()} onLink={onPress} />
      <View style={styles.pair}>
        <Pressable onPress={onPress} accessibilityRole="button" style={[styles.mini, { backgroundColor: c.card, borderColor: c.line }]}>
          <Txt size={13.5} color={c.meta}>
            {HIF.progressLabel()}
          </Txt>
          <View style={styles.miniRow}>
            <ProgressRing size={60} inside={false} color={g.base} track={g.chip} />
            <View style={{ flex: 1 }}>
              <Txt size={pct == null ? 20 : 26} weight={800} color={c.ink} lineHeight={pct == null ? 28 : 32}>
                {pct == null ? HIF.progressNone() : `${num(pct)}%`}
              </Txt>
              <Txt size={12.5} color={c.meta} lineHeight={18}>
                {pct == null ? HIF.progressNoneSub() : HIF.progressOfPlans()}
              </Txt>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={onPress} accessibilityRole="button" style={[styles.mini, { backgroundColor: c.card, borderColor: c.line }]}>
          <Txt size={13.5} color={c.meta}>
            {HIF.history()}
          </Txt>
          <View style={{ flex: 1, justifyContent: 'space-between', gap: 6 }}>
            <Txt size={15} weight={600} color={c.ink} lineHeight={22}>
              {HIF.historySub()}
            </Txt>
            <View style={{ alignSelf: 'flex-end' }}>{arrow}</View>
          </View>
        </Pressable>
      </View>
    </View>
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
            <Txt size={20} weight={700} color={c.ink} style={{ flex: 1 }}>
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
  pair: { flexDirection: 'row', gap: 12 },
  mini: { flex: 1, minHeight: 128, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10, overflow: 'hidden' },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  root: { flex: 1, justifyContent: 'flex-end' },
  panel: { maxHeight: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  option: { minHeight: 48, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.chip, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});
