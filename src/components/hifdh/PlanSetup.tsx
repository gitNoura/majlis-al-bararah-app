// Plan setup and edit (paceHTML / editHTML / savePace of the website's hifz.js). A new plan is a short run of
// questions (what to do, what you know the first time, scope, amount or finish date, days, summary); editing
// is one page with every choice, pause and delete under Save. It draws its own head and bottom button, so the
// phone's back button and the head's back step through the questions before leaving.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateStepper } from '@/components/hifdh/DateStepper';
import { HifHeader } from '@/components/hifdh/HifHeader';
import { useHif, type PlanType } from '@/components/hifdh/HifProvider';
import { MemorizedPicker } from '@/components/hifdh/MemorizedPicker';
import { MemorizedScreen } from '@/components/hifdh/MemorizedScreen';
import { Hint, PrimaryButton, SecondaryButton } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { ALL_DAYS, PLAN_UNITS, UNIT_NAME, UNIT_PLURAL, WEEK_ORDER, fmtDate, kindOf, perWord, rangeLabel, unitCount, weekdayName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

type Pace = {
  id: string | null;
  type: PlanType;
  period: 'week' | 'day';
  range: number[][] | null;
  scopeSel: 'all' | 'part' | null;
  bits: number[];
  unit: string;
  amtText: string;
  days: number[];
  mode: 'amount' | 'date';
  date: string;
  from: string;
  askMem: boolean;
  step: number;
  first: number;
};

const emptyBits = () => new Array<number>(plan.units().N).fill(0);

function initPace(type: PlanType | null, id: string | null): Pace {
  const known = plan.memorizedCount() > 0;
  const today: string = plan.today();
  const existing = id ? plan.planById(id) : null;
  if (existing) {
    const v = core.versionAt(existing, today);
    return {
      id: existing.id,
      type: existing.type,
      period: existing.period,
      range: existing.range,
      scopeSel: existing.range ? 'part' : 'all',
      bits: Array.from(core.rangesToBits(existing.range || [], plan.units().N)) as number[],
      unit: v.unit,
      amtText: String(v.amount),
      days: [...v.days],
      mode: existing.target?.kind === 'date' ? 'date' : 'amount',
      date: existing.target?.kind === 'date' ? existing.target.date : core.addDays(today, 90),
      from: today,
      askMem: false,
      step: 0, // editing is one page, not a questionnaire
      first: 0,
    };
  }
  const t: PlanType = type === 'revise' && known ? 'revise' : 'memorize';
  return {
    id: null,
    type: t,
    period: 'week',
    range: null,
    scopeSel: null,
    bits: emptyBits(),
    unit: 'thumun',
    amtText: '',
    days: [...ALL_DAYS],
    mode: 'amount',
    date: core.addDays(today, 90),
    from: today,
    askMem: !plan.memorizedAsked() && !known,
    step: type ? 1 : 0,
    first: type ? 1 : 0,
  };
}

const amountOf = (p: Pace) => {
  const n = Number(p.amtText.replace(',', '.'));
  return n > 0 ? n : 0;
};

// «Juz» is only a way of asking: the plan keeps hizb (a juz is two). For «finish by a date» the unit is chosen
// for the reader: the biggest one that gives at least 1 per day.
function calc(p: Pace): { unit: string; amount: number } {
  if (p.mode !== 'date') {
    const a = amountOf(p);
    return p.unit === 'juz' ? { unit: 'hizb', amount: a * 2 } : { unit: p.unit, amount: a };
  }
  const base = { ...p, period: 'day', target: { kind: 'date', date: p.date } };
  const derive = (unit: string): number => core.deriveAmount({ ...base, unit }, plan.ctx(), plan.today());
  for (const unit of ['hizb', 'thumun', 'page']) if (derive(unit) >= 1) return { unit, amount: derive(unit) };
  return { unit: 'ayah', amount: derive('ayah') };
}

const stepKeys = (p: Pace) => ['type', ...(p.askMem ? ['memorized'] : []), 'scope', p.mode === 'date' ? 'date' : 'amount', ...(p.period === 'week' ? [] : ['days']), 'summary'];

function Opt({ on, text, sub, disabled, onPress }: { on: boolean; text: string; sub?: string; disabled?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: on, disabled }}
      style={[styles.opt, { backgroundColor: c.card, borderColor: on ? c.goldStrong : c.line, opacity: disabled ? 0.55 : 1 }]}
    >
      <View style={[styles.radio, { borderColor: on ? c.on : c.chosenLine }]}>{on && <View style={[styles.dot, { backgroundColor: c.on }]} />}</View>
      <View style={{ flex: 1 }}>
        <Txt size={16} weight={700} color={c.ink}>
          {text}
        </Txt>
        {!!sub && (
          <Txt size={13} color={c.meta}>
            {sub}
          </Txt>
        )}
      </View>
    </Pressable>
  );
}

function Chip({ on, text, onPress }: { on: boolean; text: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={[styles.chip, { borderColor: on ? 'transparent' : c.chosenLine, backgroundColor: on ? c.on : c.soft }]}
    >
      <Txt size={14.5} weight={on ? 700 : 600} color={on ? c.onInk : c.ink}>
        {text}
      </Txt>
    </Pressable>
  );
}

function Link({ text, onPress }: { text: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
      <Txt size={14.5} weight={700} color={c.goldStrong}>
        {text}
      </Txt>
    </Pressable>
  );
}

function Question({ title, sub }: { title: string; sub?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Txt serif size={24} weight={700} color={c.ink}>
        {title}
      </Txt>
      {!!sub && (
        <Txt size={14} color={c.meta}>
          {sub}
        </Txt>
      )}
    </View>
  );
}

export function PlanSetup({ type, id, onExit }: { type: PlanType | null; id: string | null; onExit: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { refresh, toast } = useHif();
  const [pace, setPace] = useState<Pace>(() => initPace(type, id));
  const patch = (next: Partial<Pace>) => setPace((p) => ({ ...p, ...next }));

  const known = plan.memorizedCount() > 0;
  const revise = pace.type === 'revise';
  const editing = pace.id != null;
  const keys = stepKeys(pace);
  const key = keys[pace.step];

  const back = () => (!editing && pace.step > pace.first ? patch({ step: pace.step - 1 }) : onExit());
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (back(), true));
    return () => sub.remove();
  });

  const goStep = (n: number) => patch({ step: Math.max(pace.first, Math.min(n, keys.length - 1)) });
  const { unit, amount } = calc(pace);
  const days = pace.period === 'week' ? ALL_DAYS : pace.days;
  const draft = () => core.draftPlan({ ...pace, unit, amount, days }, plan.today());
  const finish: string | null = (key === 'summary' || editing) && amount > 0 ? plan.forecast(draft()) : null;
  const scopeReady = pace.scopeSel === 'all' || (pace.scopeSel === 'part' && pace.bits.some((b) => b === 1));

  const save = () => {
    if (!days.length) return toast(HIF.pickADay());
    const target = pace.mode === 'date' ? { kind: 'date', date: pace.date } : null;
    const today: string = plan.today();
    if (!pace.id) {
      plan.savePlan({ id: plan.newPlanId(), type: pace.type, period: pace.period, range: pace.range, start: today, target, pauses: [], versions: [{ from: today, unit, amount, days }] });
    } else {
      const p = JSON.parse(JSON.stringify(plan.planById(pace.id)));
      const cur = core.versionAt(p, pace.from);
      const changed = cur.unit !== unit || cur.amount !== amount || cur.days.join() !== days.join();
      p.range = pace.range;
      p.target = target;
      if (changed) {
        const from = pace.from < p.start ? p.start : pace.from;
        p.versions = p.versions
          .filter((v: { from: string }) => v.from !== from)
          .concat({ from, unit, amount, days })
          .sort((a: { from: string }, b: { from: string }) => (a.from < b.from ? -1 : 1));
      }
      plan.savePlan(p);
    }
    refresh();
    toast(HIF.planSaved());
    onExit();
  };

  // ----- the pieces, shared by the questions and the edit page -----

  const scopeBlock = () => (
    <View style={{ gap: 10 }}>
      <Opt on={pace.scopeSel === 'all'} text={rangeLabel(null, pace.type)} onPress={() => patch({ scopeSel: 'all', range: null })} />
      <Opt
        on={pace.scopeSel === 'part'}
        text={HIF.scopeSpecific()}
        sub={HIF.scopeSpecificSub()}
        onPress={() => patch({ scopeSel: 'part', range: core.bitsToRanges(pace.bits).length ? core.bitsToRanges(pace.bits) : null })}
      />
      {pace.scopeSel === 'part' && (
        <MemorizedPicker
          bits={pace.bits}
          onSet={(from, to, on) => {
            const bits = pace.bits.slice();
            bits.fill(on ? 1 : 0, from, to);
            const ranges = core.bitsToRanges(bits);
            patch({ bits, range: ranges.length ? ranges : null });
          }}
        />
      )}
    </View>
  );

  const amountTitle = HIF.amountQuestion(revise, pace.period === 'week');
  const amountBlock = () => (
    <View style={{ gap: 12 }}>
      <View style={styles.chips}>
        {PLAN_UNITS.map((u: string) => (
          <Chip
            key={u}
            on={pace.unit === u}
            text={UNIT_NAME[u as keyof typeof UNIT_NAME]()}
            onPress={() => patch({ unit: u, amtText: u === 'ayah' && amountOf(pace) ? String(Math.round(amountOf(pace))) : pace.amtText })}
          />
        ))}
      </View>
      <View style={styles.amtRow}>
        <TextInput
          value={pace.amtText}
          onChangeText={(v) => patch({ amtText: v.replace(/[^0-9.,]/g, '') })}
          keyboardType={pace.unit === 'ayah' ? 'number-pad' : 'decimal-pad'}
          placeholder="0"
          placeholderTextColor={c.meta}
          accessibilityLabel={amountTitle}
          style={[styles.amt, { borderColor: c.chosenLine, backgroundColor: c.surface, color: c.ink }]}
        />
        <Txt size={15} color={c.meta} style={{ flex: 1 }}>
          {UNIT_PLURAL[pace.unit as keyof typeof UNIT_PLURAL]()} {perWord(pace.period)}
        </Txt>
      </View>
    </View>
  );

  const dateBlock = () => (
    <View style={{ gap: 12 }}>
      <DateStepper value={pace.date} min={core.addDays(plan.today(), 1)} onChange={(date) => patch({ date })} label={HIF.finishDate()} />
      <Txt size={15} center color={c.text}>
        {HIF.thatsAbout()}{' '}
        <Txt size={15} weight={700} color={c.ink}>
          {unitCount(unit, amount)} {perWord('day')}
        </Txt>
      </Txt>
    </View>
  );

  const daysBlock = () => (
    <View style={{ gap: 10 }}>
      <View style={styles.chips}>
        {WEEK_ORDER.map((d: number) => (
          <Chip
            key={d}
            on={pace.days.includes(d)}
            text={weekdayName(d)}
            onPress={() => patch({ days: pace.days.includes(d) ? pace.days.filter((x) => x !== d) : [...pace.days, d].sort() })}
          />
        ))}
      </View>
      <View style={styles.chips}>
        <Chip on={pace.days.length === 7} text={HIF.everyDay()} onPress={() => patch({ days: [...ALL_DAYS] })} />
      </View>
    </View>
  );

  const toDate = () => <Link text={HIF.pickDate()} onPress={() => patch({ mode: 'date', period: 'day' })} />;
  const toAmount = () => <Link text={HIF.pickAmount()} onPress={() => patch({ mode: 'amount', period: pace.id ? pace.period : 'week' })} />;
  const finishLine = () =>
    finish ? (
      <Txt size={15} color={c.text}>
        {HIF.finishLine(revise)}{' '}
        <Txt size={15} weight={800} color={c.ink}>
          {fmtDate(finish)}
        </Txt>
      </Txt>
    ) : null;

  // ----- the edit page: every choice on one page, pause and delete under Save -----

  const edit = () => {
    const p = plan.planById(pace.id);
    const ready = scopeReady && amount > 0 && days.length > 0 && Boolean(finish);
    const sec = (title: string, inner: ReactNode) => (
      <View style={{ gap: 10 }}>
        <Txt size={15} weight={700} color={c.meta}>
          {title}
        </Txt>
        {inner}
      </View>
    );
    const paused = core.pausedNow(p);
    return {
      body: (
        <View style={{ gap: 20 }}>
          <Question title={HIF.editPlan()} sub={kindOf(pace.type)} />
          {sec(HIF.covers(), scopeBlock())}
          {sec(
            HIF.pace(),
            pace.mode === 'date' ? (
              <>
                {dateBlock()}
                {toAmount()}
              </>
            ) : (
              <>
                {amountBlock()}
                <Hint>{HIF.encouragement()}</Hint>
                {toDate()}
              </>
            ),
          )}
          {pace.period === 'day' && sec(HIF.days(), daysBlock())}
          {sec(
            HIF.newPaceFrom(),
            <>
              <DateStepper value={pace.from} min={p?.start ?? plan.today()} onChange={(from) => patch({ from })} label={HIF.newPaceFrom()} />
              <Hint>{HIF.pastDaysKept()}</Hint>
            </>,
          )}
          {finishLine()}
          <View style={styles.two}>
            <View style={{ flex: 1 }}>
              <SecondaryButton
                label={paused ? HIF.resumePlan() : HIF.pausePlan()}
                onPress={() => {
                  plan.setPaused(pace.id, !paused);
                  refresh();
                  onExit();
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() =>
                  Alert.alert(HIF.confirmDelete(), undefined, [
                    { text: HIF.close(), style: 'cancel' },
                    {
                      text: HIF.deletePlan(),
                      style: 'destructive',
                      onPress: () => {
                        plan.deletePlan(pace.id);
                        refresh();
                        onExit();
                      },
                    },
                  ])
                }
                accessibilityRole="button"
                style={[styles.danger, { borderColor: '#b3402f' }]}
              >
                <Txt size={16} weight={700} color="#b3402f">
                  {HIF.deletePlan()}
                </Txt>
              </Pressable>
            </View>
          </View>
        </View>
      ),
      foot: <PrimaryButton label={HIF.saveChanges()} onPress={save} disabled={!ready} />,
    };
  };

  // ----- the questions -----

  const question = () => {
    const next = (label = HIF.continue(), disabled = false, onPress: () => void = () => goStep(pace.step + 1)) => <PrimaryButton label={label} onPress={onPress} disabled={disabled} />;
    if (key === 'type') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={HIF.whatToDo()} sub={HIF.whatToDoSub()} />
            <Opt on={!revise} text={HIF.memorizeOpt()} sub={HIF.memorizeOptSub()} onPress={() => patch({ type: 'memorize', range: null, scopeSel: null, bits: emptyBits() })} />
            <Opt
              on={revise}
              disabled={!known}
              text={HIF.reviseOpt()}
              sub={known ? HIF.reviseOptSub() : HIF.reviseOptLocked()}
              onPress={() => patch({ type: 'revise', range: null, scopeSel: null, bits: emptyBits() })}
            />
          </View>
        ),
        foot: next(),
      };
    }
    if (key === 'memorized') {
      return {
        body: <MemorizedScreen />,
        foot: next(undefined, false, () => (plan.markMemorizedAsked(), goStep(pace.step + 1))),
      };
    }
    if (key === 'scope') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={HIF.scopeQuestion(revise)} sub={HIF.scopeSub()} />
            {scopeBlock()}
          </View>
        ),
        foot: next(undefined, !scopeReady),
      };
    }
    if (key === 'amount') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={amountTitle} sub={HIF.amountSub()} />
            {amountBlock()}
            <Hint>{HIF.encouragement()}</Hint>
            {toDate()}
          </View>
        ),
        foot: next(undefined, !(amountOf(pace) > 0)),
      };
    }
    if (key === 'date') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={HIF.whenQuestion()} />
            {dateBlock()}
            {toAmount()}
          </View>
        ),
        foot: next(),
      };
    }
    if (key === 'days') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={HIF.daysQuestion()} sub={HIF.daysSub()} />
            {daysBlock()}
          </View>
        ),
        foot: next(undefined, !pace.days.length),
      };
    }
    // summary: «Your plan is ready»
    const everyDay = days.length === 7;
    const paceLine = `${unitCount(unit, amount)} ${perWord(pace.period)}${
      pace.period === 'week' ? '' : ` · ${everyDay ? HIF.everyDay() : WEEK_ORDER.filter((d: number) => days.includes(d)).map((d: number) => weekdayName(d)).join(' ')}`
    }`;
    const row = (k: string, v: string) => (
      <View key={k} style={[styles.sumRow, { borderTopColor: c.divider }]}>
        <Txt size={13} color={c.meta}>
          {k}
        </Txt>
        <Txt size={16} weight={700} color={c.ink}>
          {v}
        </Txt>
      </View>
    );
    return {
      body: (
        <View style={{ gap: 14 }}>
          <Txt serif size={26} weight={700} center color={c.ink}>
            {HIF.planReady()}
          </Txt>
          {finish ? (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Txt size={14} color={c.meta}>
                {HIF.finishLine(revise)}
              </Txt>
              <Txt serif size={26} weight={700} color={c.ink}>
                {fmtDate(finish)}
              </Txt>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Txt size={15} weight={700} center color={c.ink}>
                {revise ? HIF.nothingToRevise() : HIF.nothingToReviseSub()}
              </Txt>
            </View>
          )}
          <View>
            {row(kindOf(pace.type), rangeLabel(pace.range, pace.type))}
            {row(HIF.pace(), paceLine)}
          </View>
        </View>
      ),
      foot: <PrimaryButton label={HIF.startPlan()} onPress={save} disabled={!finish} />,
    };
  };

  const { body, foot } = editing ? edit() : question();
  const n = keys.length - pace.first;
  const i = pace.step - pace.first;

  return (
    <View style={{ flex: 1 }}>
      <HifHeader title={editing ? HIF.editPlan() : HIF.newPlan()} onBack={back} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView key={editing ? 'edit' : key} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          {!editing && key !== 'memorized' && (
            <View style={{ gap: 8 }}>
              <Txt size={13} weight={600} color={c.meta}>
                {HIF.stepOf(i + 1, n)}
              </Txt>
              <View style={[styles.track, { backgroundColor: c.soft }]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: n, now: i + 1 }}>
                <View style={[styles.fill, { backgroundColor: c.on, width: `${((i + 1) / n) * 100}%` }]} />
              </View>
            </View>
          )}
          {body}
        </ScrollView>
        <View style={[styles.foot, { paddingBottom: insets.bottom + 12, borderTopColor: c.divider }]}>{foot}</View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 18, padding: 14, minHeight: 60 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, minWidth: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  amtRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amt: { width: 110, minHeight: 56, borderWidth: 1.5, borderRadius: 16, textAlign: 'center', fontSize: 24, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  two: { flexDirection: 'row', gap: 10 },
  danger: { minHeight: 48, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  sumRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12, gap: 2 },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
