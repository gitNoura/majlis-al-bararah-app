// Plan setup and edit (paceHTML / editHTML / savePace of the website's hifz.js). A new plan is a short run of
// questions (what to do, what you know the first time, scope, how much a week, which days - or the finish date
// and then the days), then the summary, which is not a question; editing is one page with every choice, pause
// and delete under Save. Previous / Next at the bottom move between the questions only (the arrow at the top
// leaves the setup); the plan is kept per day: the week's amount is shared over the days chosen.
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
import { CheckIcon } from '@/components/icons';
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
    const weekly = existing.period === 'week';
    const perWeek = weekly ? v.amount : Math.round(v.amount * v.days.length * 100) / 100; // the question is «how much a week»
    return {
      id: existing.id,
      type: existing.type,
      period: 'day', // plans are daily: today's plan follows the days you chose, not the week
      range: existing.range,
      scopeSel: existing.range ? 'part' : 'all',
      bits: Array.from(core.rangesToBits(existing.range || [], plan.units().N)) as number[],
      unit: v.unit,
      amtText: String(perWeek),
      days: weekly ? [...ALL_DAYS] : [...v.days],
      mode: existing.target?.kind === 'date' ? 'date' : 'amount',
      date: existing.target?.kind === 'date' ? existing.target.date : core.addDays(today, 90),
      from: today,
      askMem: false,
      step: 0, // editing is one page, not a questionnaire
      first: 0,
    };
  }
  const t: PlanType = type === 'revise' ? 'revise' : 'memorize';
  return {
    id: null,
    type: t,
    period: 'day',
    range: null,
    scopeSel: null,
    bits: emptyBits(),
    unit: 'thumun',
    amtText: '',
    days: [],
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
    const a = amountOf(p) / Math.max(1, p.days.length); // a week's amount over the days chosen
    const r = (x: number) => Math.round(x * 10000) / 10000;
    return p.unit === 'juz' ? { unit: 'hizb', amount: r(a * 2) } : { unit: p.unit, amount: r(a) };
  }
  const base = { ...p, period: 'day', target: { kind: 'date', date: p.date } };
  const derive = (unit: string): number => core.deriveAmount({ ...base, unit }, plan.ctx(), plan.today());
  for (const unit of ['hizb', 'thumun', 'page']) if (derive(unit) >= 1) return { unit, amount: derive(unit) };
  return { unit: 'ayah', amount: derive('ayah') };
}

// how much a week, then which days; for «finish by a date» the days come first (the date needs them)
const stepKeys = (p: Pace) => ['type', ...(p.askMem && p.type === 'memorize' ? ['memorized'] : []), // revising asks what to revise, not what is memorized
   'scope', ...(p.mode === 'date' ? ['days', 'date'] : ['amount', 'days']), 'summary'];

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

// One weekday (or «every day») as a row with a tick box, the rows sharing one card
function DayRow({ on, text, last, onPress }: { on: boolean; text: string; last?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      style={[styles.dayRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }]}
    >
      <View style={[styles.box, { borderColor: on ? c.on : c.chosenLine, backgroundColor: on ? c.on : 'transparent' }]}>{on && <CheckIcon color={c.onInk} size={16} strokeWidth={2.6} />}</View>
      <Txt size={16} weight={on ? 700 : 500} color={c.ink} style={{ flex: 1 }}>
        {text}
      </Txt>
    </Pressable>
  );
}

// The bottom of every question: Previous and Next side by side
function NavFoot({ onPrev, prevDisabled, onNext, nextLabel, nextDisabled }: { onPrev: () => void; prevDisabled?: boolean; onNext: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <View style={styles.two}>
      <View style={{ flex: 1 }}>
        <SecondaryButton label={HIF.previous()} onPress={onPrev} disabled={prevDisabled} />
      </View>
      <View style={{ flex: 1 }}>
        <PrimaryButton label={nextLabel ?? HIF.next()} onPress={onNext} disabled={nextDisabled} />
      </View>
    </View>
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
      <Txt size={24} weight={700} color={c.ink}>
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

  // the arrow (and the phone's back button) leave the setup; «Previous» only moves between the questions
  const leave = () => onExit();
  const prev = () => patch({ step: Math.max(pace.first, pace.step - 1) });
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (leave(), true));
    return () => sub.remove();
  });

  const goStep = (n: number) => patch({ step: Math.max(pace.first, Math.min(n, keys.length - 1)) });
  const { unit, amount } = calc(pace);
  const days = pace.days;
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
      const changed = cur.unit !== unit || cur.amount !== amount || cur.days.join() !== days.join() || plan.planById(pace.id).period === 'week';
      p.range = pace.range;
      p.period = 'day';
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
      <Opt
        on={pace.scopeSel === 'all'}
        text={rangeLabel(null, revise && known ? 'revise' : 'memorize')}
        onPress={() => patch({ scopeSel: 'all', range: revise && !known ? [[0, plan.units().N]] : null })} // with nothing memorized, «all» is the whole Quran itself
      />
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

  const amountTitle = HIF.amountQuestion(revise, true);
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
          {UNIT_PLURAL[pace.unit as keyof typeof UNIT_PLURAL]()} {perWord('week')}
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
      <View style={[styles.daysCard, { backgroundColor: c.card, borderColor: c.line }]}>
        <DayRow on={pace.days.length === 7} text={HIF.everyDay()} onPress={() => patch({ days: pace.days.length === 7 ? [] : [...ALL_DAYS] })} />
        {WEEK_ORDER.map((d: number, k: number) => (
          <DayRow
            key={d}
            on={pace.days.includes(d)}
            text={weekdayName(d, 'long')}
            last={k === WEEK_ORDER.length - 1}
            onPress={() => patch({ days: pace.days.includes(d) ? pace.days.filter((x) => x !== d) : [...pace.days, d].sort() })}
          />
        ))}
      </View>
      {pace.mode === 'amount' && amount > 0 && days.length > 0 && (
        <Txt size={14.5} color={c.text}>
          {HIF.thatsAbout()}{' '}
          <Txt size={14.5} weight={700} color={c.ink}>
            {unitCount(unit, amount)} {perWord('day')}
          </Txt>
        </Txt>
      )}
    </View>
  );

  const toDate = () => <Link text={HIF.pickDate()} onPress={() => patch({ mode: 'date', period: 'day' })} />;
  const toAmount = () => <Link text={HIF.pickAmount()} onPress={() => patch(editing ? { mode: 'amount', period: 'day' } : { mode: 'amount', period: 'day', step: pace.step - 1 })} />; // from the date question back to the amount question
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
          {sec(HIF.days(), daysBlock())}
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
    const next = (label?: string, disabled = false, onPress: () => void = () => goStep(pace.step + 1)) => <NavFoot onPrev={prev} prevDisabled={pace.step <= pace.first} onNext={onPress} nextLabel={label} nextDisabled={disabled} />;
    if (key === 'type') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question title={HIF.whatToDo()} sub={HIF.whatToDoSub()} />
            <Opt on={!revise} text={HIF.memorizeOpt()} sub={HIF.memorizeOptSub()} onPress={() => patch({ type: 'memorize', range: null, scopeSel: null, bits: emptyBits() })} />
            <Opt
              on={revise}
              text={HIF.reviseOpt()}
              sub={HIF.reviseOptSub()}
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
            <Question title={HIF.daysQuestion(revise)} sub={HIF.daysSub()} />
            {daysBlock()}
          </View>
        ),
        foot: next(undefined, !pace.days.length),
      };
    }
    // summary: «Your plan is ready»
    const everyDay = days.length === 7;
    const weekly = Math.round(amount * days.length * 100) / 100;
    const paceLine = `${unitCount(unit, weekly)} ${perWord('week')} · ${everyDay ? HIF.everyDay() : WEEK_ORDER.filter((d: number) => days.includes(d)).map((d: number) => weekdayName(d)).join(' ')}`;
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
          <Txt size={26} weight={700} center color={c.ink}>
            {HIF.planReady()}
          </Txt>
          {finish ? (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Txt size={14} color={c.meta}>
                {HIF.finishLine(revise)}
              </Txt>
              <Txt size={26} weight={700} color={c.ink}>
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
      foot: next(HIF.startPlan(), !finish, save),
    };
  };

  const { body, foot } = editing ? edit() : question();
  // the questions are counted; the memorized page and the summary are not questions
  const asked = keys.filter((k) => k !== 'memorized' && k !== 'summary').slice(pace.first);
  const n = asked.length;
  const i = asked.indexOf(key);

  return (
    <View style={{ flex: 1 }}>
      <HifHeader title={editing ? HIF.editPlan() : HIF.newPlan()} onBack={leave} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView key={editing ? 'edit' : key} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          {!editing && i >= 0 && (
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
  daysCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, overflow: 'hidden' },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 54, paddingHorizontal: 16 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  danger: { minHeight: 48, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  sumRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12, gap: 2 },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
