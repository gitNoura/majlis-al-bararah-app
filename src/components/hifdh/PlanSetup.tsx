// Plan setup and edit (paceHTML / editHTML / savePace of the website's hifz.js). A new plan is a short run of
// questions (what to do, scope, how much a week, which days - or the finish date first, then the days), then the
// summary, which is not a question; editing is one page of titled boxes (what it covers, the pace, the days, when the
// new pace starts) with pause and delete under them and Save at the bottom. Previous / Next at the bottom move between
// the questions only (the arrow at the top leaves the setup); the plan is kept per day: the week's amount is shared
// over the days chosen.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateCalendar } from '@/components/hifdh/DateCalendar';
import { HifHeader } from '@/components/hifdh/HifHeader';
import { useHif, type PlanType } from '@/components/hifdh/HifProvider';
import { MemorizedPicker } from '@/components/hifdh/MemorizedPicker';
import { Hint, PrimaryButton, SecondaryButton, Section } from '@/components/hifdh/Section';
import { Sheet } from '@/components/ui/Sheet';
import { BackIcon, CheckIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { ALL_DAYS, PLAN_UNITS, UNIT_NAME, UNIT_ONE, UNIT_PLURAL, WEEK_ORDER, fmtDate, kindOf, num, perWord, rangeLabel, unitCount, weekdayName } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

type Pace = {
  id: string | null;
  type: PlanType;
  period: 'week' | 'day';
  range: number[][] | null;
  scopeSel: 'all' | 'part' | null;
  bits: number[];
  unit: string;
  divide: string | null; // a smaller unit each week's portion is cut into (the pages of a juz); null keeps the unit whole
  amtText: string;
  days: number[];
  perDay: Record<number, number> | null; // this week's amount per weekday when the reader changed the even split (in the divide-by unit when the plan is cut, else the unit asked)
  mode: 'amount' | 'date';
  date: string;
  from: string;
  step: number;
  first: number;
};

const emptyBits = () => new Array<number>(plan.units().N).fill(0);

function initPace(type: PlanType | null, id: string | null): Pace {
  const today: string = plan.today();
  const existing = id ? plan.planById(id) : null;
  if (existing) {
    const v = core.versionAt(existing, today);
    const weekly = existing.period === 'week';
    const perWeek = weekly ? v.amount : Math.round(core.weeklyTotal(v) * 100) / 100; // the question is «how much a week»
    return {
      id: existing.id,
      type: existing.type,
      period: 'day', // plans are daily: today's plan follows the days you chose, not the week
      range: existing.range,
      scopeSel: existing.range ? 'part' : 'all',
      bits: Array.from(core.rangesToBits(existing.range || [], plan.units().N)) as number[],
      unit: v.unit,
      divide: core.isBlock(v) ? v.divide : null,
      amtText: String(perWeek),
      days: weekly ? [...ALL_DAYS] : [...v.days],
      perDay: !weekly && v.perDay ? { ...v.perDay } : null,
      mode: existing.target?.kind === 'date' ? 'date' : 'amount',
      date: existing.target?.kind === 'date' ? existing.target.date : core.addDays(today, 90),
      from: today,
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
    unit: 'ayah',
    divide: null,
    amtText: '',
    days: [],
    perDay: null,
    mode: 'amount',
    date: core.addDays(today, 90),
    from: today,
    step: type ? 1 : 0,
    first: type ? 1 : 0,
  };
}

const amountOf = (p: Pace) => {
  const n = Number(p.amtText.replace(',', '.'));
  return n > 0 ? n : 0;
};

// Units run from small to big (ayah, page, thumun, hizb, juz). Amounts can be halves (0.5 hizb, 2.5 pages); an ayah is
// always whole. Hizb and juz are always divided: «1 hizb a week» is cut into days by a smaller unit (pages by
// default), each week exactly; ayah and page are counted in their own unit. That is the `divide` choice.
const BIG = ['hizb', 'juz']; // a thumun is never divided: it is counted in thumun, like ayah and page
const canDivide = (u: string) => BIG.includes(u);
const smallerThan = (u: string): string[] => PLAN_UNITS.slice(0, Math.max(0, PLAN_UNITS.indexOf(u)));
const defaultDivide = (u: string) => (canDivide(u) ? 'page' : null);
const stepFor = (u: string) => (u === 'ayah' ? 1 : 0.5);
const weekTotal = (p: Pace) => (p.unit === 'ayah' ? Math.round(amountOf(p)) : Math.round(amountOf(p) * 100) / 100); // an ayah is whole
const cutOk = (p: Pace) => p.mode === 'amount' && canDivide(p.unit) && !!p.divide && smallerThan(p.unit).includes(p.divide);

// About how many `divide` units a day holds: juz and pages differ a little in length, so it is an average («about»);
// the plan itself cuts each real week exactly.
function approxPerDay(p: Pace): number {
  const U = plan.units();
  if (!p.divide || !p.days.length) return 0;
  return (weekTotal(p) * U.unit[p.divide].count) / U.unit[p.unit].count / p.days.length;
}
const approxText = (x: number) => (x >= 3 ? Math.round(x) : Math.round(x * 10) / 10);

// the unit the days are counted in: the divide-by unit when the plan is cut, else the unit itself
const countUnit = (p: Pace) => (cutOk(p) ? (p.divide as string) : p.unit);
const goalOf = (p: Pace) => {
  if (!cutOk(p)) return weekTotal(p);
  const st = stepFor(p.divide as string);
  return Math.max(st, Math.round((approxPerDay(p) * p.days.length) / st) * st);
};

// What each chosen day gives: the reader's own figure, else the even share of the week in half steps (the first days
// take the extra when it does not divide). A day at 0 is a day off.
function splitOf(p: Pace): Record<number, number> {
  const ordered = WEEK_ORDER.filter((d: number) => p.days.includes(d));
  const even = core.evenSplit(goalOf(p), ordered, stepFor(countUnit(p))) as Record<number, number>;
  const out: Record<number, number> = {};
  for (const d of ordered) out[d] = p.perDay?.[d] ?? even[d] ?? 0;
  return out;
}

type Calc = { unit: string; amount: number; days: number[]; perDay?: Record<number, number>; divide?: string; tooBig?: boolean };

function calc(p: Pace): Calc {
  if (p.mode !== 'date') {
    const unit = p.unit;
    if (cutOk(p) && !p.perDay) return { unit, amount: weekTotal(p), days: p.days, divide: p.divide as string }; // a week's amount, cut into the days when the plan is walked
    const shown = splitOf(p);
    const on = p.days.filter((d) => shown[d] > 0);
    if (!on.length) return { unit, amount: 0, days: [] };
    if (cutOk(p)) return { unit, amount: weekTotal(p), days: on, divide: p.divide as string, perDay: Object.fromEntries(on.map((d) => [d, shown[d]])) as Record<number, number> }; // the reader set the pages of each day
    const vals = on.map((d) => shown[d]);
    const even = vals.every((x) => x === vals[0]);
    return {
      unit,
      amount: even ? vals[0] : Math.round((vals.reduce((n, x) => n + x, 0) / vals.length) * 100) / 100,
      days: on,
      ...(even ? {} : { perDay: Object.fromEntries(on.map((d) => [d, shown[d]])) as Record<number, number> }),
    };
  }
  // finish by a date, in the unit the reader chose: never switched silently. When a whole unit a day is more than the
  // date needs (a hizb a day for 90 days) it says so and offers the next smaller unit (tooBig)
  const base = { ...p, period: 'day', target: { kind: 'date', date: p.date } };
  const raw = core.deriveAmount({ ...base, unit: p.unit }, plan.ctx(), plan.today(), true) as number;
  return { unit: p.unit, amount: core.roundUp(raw), days: p.days, tooBig: raw < 1 - 1e-9 && p.unit !== 'ayah' };
}

// one step (half a unit, or a whole ayah); a day can go down to 0 (a day off). Off-grid values snap to the grid.
const nudge = (v: number, up: boolean, step: number) => (up ? (Math.floor(v / step + 1e-9) + 1) * step : Math.max(0, (Math.ceil(v / step - 1e-9) - 1) * step));
const clean = (x: number) => Math.round(x * 100) / 100;

// how much a week, then which days; for «finish by a date» the date comes first, then the days
const stepKeys = (p: Pace) => ['type', 'scope', ...(p.mode === 'date' ? ['date', 'days'] : ['amount', 'days', 'split']), 'summary'];

// A plain block: its content sits on the page (no paper, border or shadow). `flush` is a list whose rows carry their own
// hairlines.
function Card({ children }: { children: ReactNode; flush?: boolean }) {
  return <View style={styles.card}>{children}</View>;
}

// A row of the edit page: the setting's value (a long one wraps), the setting's name small above it when the box's own
// title does not already say it, and an arrow; a tap opens a sheet for it
function EditRow({ label, value, onPress }: { label?: string; value: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.editRow}>
      <View style={{ flex: 1, gap: 2 }}>
        {!!label && (
          <Txt size={13} color={c.meta}>
            {label}
          </Txt>
        )}
        <Txt size={16.5} weight={700} color={c.ink}>
          {value}
        </Txt>
      </View>
      <BackIcon color={c.meta} size={18} rtl={isEnglish} />
    </Pressable>
  );
}

function Opt({ on, text, sub, disabled, onPress }: { on: boolean; text: string; sub?: string; disabled?: boolean; onPress: () => void }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: on, disabled }}
      style={[styles.opt, { borderBottomColor: c.divider, opacity: disabled ? 0.55 : 1 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={16.5} weight={on ? 800 : 600} color={c.ink}>
          {text}
        </Txt>
        {!!sub && (
          <Txt size={13.5} color={c.meta}>
            {sub}
          </Txt>
        )}
      </View>
      <View style={[styles.radio, { borderColor: on ? h.forest : c.chosenLine, backgroundColor: on ? h.forest : 'transparent' }]}>{on && <CheckIcon color={h.forestInk} size={14} strokeWidth={3} />}</View>
    </Pressable>
  );
}

function Chip({ on, text, onPress }: { on: boolean; text: string; onPress: () => void }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on ? { backgroundColor: h.forest, borderColor: h.forest } : { borderColor: c.chosenLine }]}>
      <Txt size={14.5} weight={on ? 700 : 600} color={on ? h.forestInk : c.ink}>
        {text}
      </Txt>
    </Pressable>
  );
}

// The weekdays as a list, Monday first, one row each with a tick box; a tap turns a day on or off
function DayList({ days, onToggle }: { days: number[]; onToggle: (d: number) => void }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <View>
      {WEEK_ORDER.map((d: number, k: number) => {
        const on = days.includes(d);
        return (
          <Pressable
            key={d}
            onPress={() => onToggle(d)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            style={[styles.dayRow, k < WEEK_ORDER.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }]}
          >
            <Txt size={16.5} weight={on ? 700 : 500} color={c.ink} style={{ flex: 1 }}>
              {weekdayName(d, 'long')}
            </Txt>
            <View style={[styles.box, { borderColor: on ? h.forest : c.chosenLine, backgroundColor: on ? h.forest : 'transparent' }]}>{on && <CheckIcon color={h.forestInk} size={15} strokeWidth={3} />}</View>
          </Pressable>
        );
      })}
    </View>
  );
}

// The seven days as a grid of toggles, four to a row (Monday first): the edit page shows every day at a glance, and a long
// day name (Arabic short names are as long as the full ones) still fits
function DayChips({ days, onToggle }: { days: number[]; onToggle: (d: number) => void }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <View style={styles.dayChips}>
      {WEEK_ORDER.map((d: number) => {
        const on = days.includes(d);
        return (
          <Pressable
            key={d}
            onPress={() => onToggle(d)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={weekdayName(d, 'long')}
            style={[styles.dayChip, on ? { backgroundColor: h.forest, borderColor: h.forest } : { borderColor: c.chosenLine }]}
          >
            <Txt size={13} weight={on ? 700 : 500} center color={on ? h.forestInk : c.text} numberOfLines={1}>
              {weekdayName(d)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// A round − / + button
function Stepper({ sign, label, onPress, disabled, size = 40 }: { sign: string; label: string; onPress: () => void; disabled?: boolean; size?: number }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.stepper, { width: size, height: size, borderRadius: size / 2, borderColor: c.chosenLine, opacity: disabled ? 0.4 : 1 }]}
    >
      <Txt size={22} weight={600} color={h.ink} style={{ marginTop: -1 }}>
        {sign}
      </Txt>
    </Pressable>
  );
}

// The amount: − and + around the number (which can also be typed), the unit under it
function AmountField({ value, onChange, onStep, caption, label }: { value: string; onChange: (v: string) => void; onStep: (up: boolean) => void; caption: string; label: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.amtRow}>
      <Stepper sign="−" label="−" size={44} onPress={() => onStep(false)} disabled={!(Number(value.replace(',', '.')) > 0)} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <TextInput
          value={value}
          onChangeText={(v) => onChange(v.replace(/[^0-9.,]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={c.meta}
          accessibilityLabel={label}
          selectTextOnFocus
          style={[styles.amt, { color: c.ink }]}
        />
        <Txt size={14} color={c.meta} center>
          {caption}
        </Txt>
      </View>
      <Stepper sign="+" label="+" size={44} onPress={() => onStep(true)} />
    </View>
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
    <Pressable onPress={onPress} accessibilityRole="button" style={{ minHeight: 40, justifyContent: 'center' }}>
      <Txt size={14.5} weight={700} color={c.goldStrong}>
        {text}
      </Txt>
    </Pressable>
  );
}

function Question({ title, sub }: { title: string; sub?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6, paddingTop: 4 }}>
      <Txt size={26} weight={800} color={c.ink} lineHeight={34}>
        {title}
      </Txt>
      {!!sub && (
        <Txt size={14.5} color={c.meta} lineHeight={21}>
          {sub}
        </Txt>
      )}
    </View>
  );
}

export function PlanSetup({ type, id, onExit }: { type: PlanType | null; id: string | null; onExit: () => void }) {
  const { c } = useTheme();
  const hm = useHome();
  const insets = useSafeAreaInsets();
  const { refresh, toast } = useHif();
  const [pace, setPace] = useState<Pace>(() => initPace(type, id));
  const [sheet, setSheet] = useState<'scope' | 'split' | 'from' | null>(null); // the edit page's open sheet
  // a new amount, unit or set of days starts the split over: the even share is the default
  const patch = (next: Partial<Pace>) => setPace((p) => ({ ...p, ...(('amtText' in next || 'unit' in next || 'divide' in next || 'days' in next || 'mode' in next) && !('perDay' in next) ? { perDay: null } : {}), ...next }));

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
  const { unit, amount, perDay, days, divide, tooBig } = calc(pace);
  const draft = () => core.draftPlan({ ...pace, unit, amount, days, perDay, divide }, plan.today());
  const finish: string | null = (key === 'summary' || editing) && amount > 0 ? plan.forecast(draft()) : null;
  const scopeReady = pace.scopeSel === 'all' || (pace.scopeSel === 'part' && pace.bits.some((b) => b === 1));

  const save = () => {
    if (!days.length) return toast(HIF.pickADay());
    if (tooBig) return;
    const target = pace.mode === 'date' ? { kind: 'date', date: pace.date } : null;
    const today: string = plan.today();
    if (!pace.id) {
      plan.savePlan({ id: plan.newPlanId(), type: pace.type, period: pace.period, range: pace.range, start: today, target, pauses: [], versions: [{ from: today, unit, amount, days, ...(divide ? { divide } : {}), ...(perDay ? { perDay } : {}) }] });
    } else {
      const p = JSON.parse(JSON.stringify(plan.planById(pace.id)));
      const cur = core.versionAt(p, pace.from);
      const changed = cur.unit !== unit || cur.amount !== amount || (cur.divide ?? null) !== (divide ?? null) || cur.days.join() !== days.join() || JSON.stringify(cur.perDay ?? null) !== JSON.stringify(perDay ?? null) || plan.planById(pace.id).period === 'week';
      p.range = pace.range;
      p.period = 'day';
      p.target = target;
      if (changed) {
        const from = pace.from < p.start ? p.start : pace.from;
        p.versions = p.versions
          .filter((v: { from: string }) => v.from !== from)
          .concat({ from, unit, amount, days, ...(divide ? { divide } : {}), ...(perDay ? { perDay } : {}) })
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
    <View>
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
        <View style={{ gap: 10, paddingTop: 6 }}>
          <Txt size={14} color={c.meta}>
            {pace.range ? `${HIF.covers()}: ` : ''}
            <Txt size={14} weight={700} color={c.ink}>
              {pace.range ? rangeLabel(pace.range, pace.type) : HIF.scopeSpecificSub()}
            </Txt>
          </Txt>
        <MemorizedPicker
          bits={pace.bits}
          onSet={(from, to, on) => {
            const bits = pace.bits.slice();
            bits.fill(on ? 1 : 0, from, to);
            const ranges = core.bitsToRanges(bits);
            patch({ bits, range: ranges.length ? ranges : null });
          }}
        />
        </View>
      )}
    </View>
  );

  const amountTitle = HIF.amountQuestion(revise, true);
  const amountBlock = () => (
    <Card>
      <View style={styles.chips}>
        {PLAN_UNITS.map((u: string) => (
          <Chip
            key={u}
            on={pace.unit === u}
            text={UNIT_NAME[u as keyof typeof UNIT_NAME]()}
            onPress={() => patch({ unit: u, divide: defaultDivide(u), amtText: u === 'ayah' && amountOf(pace) ? String(Math.max(1, Math.round(amountOf(pace)))) : pace.amtText })}
          />
        ))}
      </View>
      <AmountField
        value={pace.amtText}
        onChange={(v) => patch({ amtText: v })}
        onStep={(up) => patch({ amtText: String(clean(nudge(amountOf(pace), up, stepFor(pace.unit)))) })}
        caption={`${UNIT_PLURAL[pace.unit as keyof typeof UNIT_PLURAL]()} ${perWord('week')}`}
        label={amountTitle}
      />
    </Card>
  );

  // the unit and the calendar; the «about N a day» line needs the days, so the questions show it under the days
  const dateBlock = () => (
    <Card>
      <View style={{ gap: 10 }}>
        <Txt size={14} weight={700} color={c.meta}>
          {HIF.unitLabel()}
        </Txt>
        <View style={styles.chips}>
          {PLAN_UNITS.map((u: string) => (
            <Chip key={u} on={pace.unit === u} text={UNIT_NAME[u as keyof typeof UNIT_NAME]()} onPress={() => patch({ unit: u })} />
          ))}
        </View>
      </View>
      <DateCalendar value={pace.date} min={core.addDays(plan.today(), 1)} onChange={(date) => patch({ date })} label={HIF.finishDate()} />
    </Card>
  );

  const aboutLine = () => {
    if (pace.mode !== 'date' || !days.length) return null;
    const smaller = smallerThan(pace.unit).slice(-1)[0];
    return tooBig && smaller ? (
      <View style={{ gap: 2 }}>
        <Txt size={15} center color={c.ink}>
          {HIF.dateTooBig(UNIT_ONE[pace.unit as keyof typeof UNIT_ONE]())}
        </Txt>
        <View style={{ alignItems: 'center' }}>
          <Link text={HIF.dateUseSmaller(UNIT_ONE[smaller as keyof typeof UNIT_ONE]())} onPress={() => patch({ unit: smaller })} />
        </View>
      </View>
    ) : (
      <Txt size={15} center color={c.text}>
        {HIF.thatsAbout()}{' '}
        <Txt size={15} weight={700} color={c.ink}>
          {unitCount(unit, amount)} {perWord('day')}
        </Txt>
      </Txt>
    );
  };

  const daysBlock = () => (
    <View style={{ gap: 12 }}>
      <View style={styles.daysHead}>
        <Txt size={14} color={c.meta}>
          {HIF.selectedDays(pace.days.length)}
        </Txt>
        <Chip on={pace.days.length === 7} text={pace.days.length === 7 ? HIF.clearAll() : HIF.selectAll()} onPress={() => patch({ days: pace.days.length === 7 ? [] : [...ALL_DAYS] })} />
      </View>
      <Card flush>
        <DayList days={pace.days} onToggle={(d) => patch({ days: pace.days.includes(d) ? pace.days.filter((x) => x !== d) : [...pace.days, d].sort() })} />
      </Card>
    </View>
  );

  // how much on each day. A divided plan (hizb, juz) counts the days in the divide-by unit. Until the reader
  // sets a day, the even share comes from an average length (so every value is «about»); once they have, the days they
  // set are exact, and only the week's last day is «about»: it takes what is left, so the week ends with the unit.
  const splitBlock = () => {
    const shown = splitOf(pace);
    const pu = countUnit(pace);
    const cut = cutOk(pace);
    const total = clean(pace.days.reduce((n, d) => n + shown[d], 0));
    const goal = goalOf(pace);
    const same = Math.abs(total - goal) < 1e-9;
    const st = stepFor(pu);
    const set = (d: number, v: number) => patch({ perDay: { ...shown, [d]: clean(v) } });
    const unitWord = (v: number) => (v === 1 ? UNIT_ONE[pu as keyof typeof UNIT_ONE]() : UNIT_PLURAL[pu as keyof typeof UNIT_PLURAL]());
    const ordered = WEEK_ORDER.filter((d: number) => pace.days.includes(d));
    const approx = (d: number) => cut && (!pace.perDay || d === ordered[ordered.length - 1]);
    return (
      <View style={{ gap: 16 }}>
        {canDivide(pace.unit) && (
          <Card>
            <Txt size={14} weight={700} color={c.meta}>
              {HIF.divideTitle(UNIT_ONE[pace.unit as keyof typeof UNIT_ONE]())}
            </Txt>
            <View style={styles.chips}>
              {smallerThan(pace.unit).map((u: string) => (
                <Chip key={u} on={pace.divide === u} text={UNIT_NAME[u as keyof typeof UNIT_NAME]()} onPress={() => patch({ divide: u })} />
              ))}
            </View>
          </Card>
        )}
        <Card flush>
          {ordered.map((d: number, k: number) => (
            <View key={d} style={[styles.splitRow, k < ordered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }]}>
              <Txt size={16} weight={600} color={c.ink} style={{ flex: 1 }}>
                {weekdayName(d, 'long')}
              </Txt>
              <Stepper label={HIF.splitLess()} sign="−" size={36} onPress={() => set(d, nudge(shown[d], false, st))} disabled={shown[d] <= 0} />
              <View style={styles.splitVal}>
                <Txt size={18} weight={700} center color={c.ink}>
                  {shown[d] > 0 ? `${approx(d) ? '≈ ' : ''}${num(shown[d])}` : '0'}
                </Txt>
                <Txt size={12} center color={c.meta} numberOfLines={1}>
                  {shown[d] > 0 ? unitWord(shown[d]) : HIF.splitRest()}
                </Txt>
              </View>
              <Stepper label={HIF.splitMore()} sign="+" size={36} onPress={() => set(d, nudge(shown[d], true, st))} />
            </View>
          ))}
        </Card>
        <View style={styles.totalRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size={15} weight={700} color={c.ink}>
              {HIF.splitTotal()}: {cut && !pace.perDay ? '≈ ' : ''}
              {unitCount(pu, total)} {perWord('week')}
            </Txt>
            <Txt size={13} color={c.meta}>
              {cut ? (pace.perDay ? HIF.splitLastDay(UNIT_ONE[pace.unit as keyof typeof UNIT_ONE]()) : HIF.splitGoalAbout(unitCount(pu, goal), unitCount(pace.unit, weekTotal(pace)))) : same ? HIF.splitMatches() : HIF.splitGoal(unitCount(pu, goal))}
            </Txt>
          </View>
          {!!pace.perDay && <Link text={HIF.splitEven()} onPress={() => patch({ perDay: null })} />}
        </View>
      </View>
    );
  };

  const toDate = () => <Link text={HIF.pickDate()} onPress={() => patch({ mode: 'date', period: 'day' })} />;
  const toAmount = () => <Link text={HIF.pickAmount()} onPress={() => patch({ mode: 'amount', period: 'day', step: pace.step - 1 })} />; // from the date question back to the amount question

  // ----- the edit page: titled boxes (covers, pace, days, finish, start); a row shows its value and opens a small sheet; pause and delete under them -----

  const edit = () => {
    const p = plan.planById(pace.id);
    const ready = scopeReady && amount > 0 && days.length > 0 && Boolean(finish) && !tooBig;
    const paused = core.pausedNow(p);
    const showSplit = pace.mode === 'amount' && pace.days.length > 0 && amountOf(pace) > 0;
    const close = () => setSheet(null);
    const sheetOf = (k: NonNullable<typeof sheet>, title: string, inner: ReactNode) => (
      <Sheet open={sheet === k} onClose={close} title={title}>
        {inner}
        <PrimaryButton label={HIF.done()} onPress={close} />
      </Sheet>
    );
    return {
      body: (
        <View style={{ gap: 22 }}>
          <Section title={HIF.covers()}>
            <EditRow label={kindOf(pace.type)} value={rangeLabel(pace.range, pace.type)} onPress={() => setSheet('scope')} />
          </Section>

          <Section title={HIF.pace()}>
            <View style={styles.modeRow}>
              <View style={{ flex: 1 }}>
                <Chip on={pace.mode === 'amount'} text={HIF.paceByAmount()} onPress={() => pace.mode !== 'amount' && patch({ mode: 'amount', period: 'day' })} />
              </View>
              <View style={{ flex: 1 }}>
                <Chip on={pace.mode === 'date'} text={HIF.paceByDate()} onPress={() => pace.mode !== 'date' && patch({ mode: 'date', period: 'day' })} />
              </View>
            </View>
            {pace.mode === 'date' ? dateBlock() : amountBlock()}
          </Section>

          <Section title={HIF.days()}>
            <View style={styles.daysHead}>
              <Txt size={14} color={c.meta}>
                {HIF.selectedDays(pace.days.length)}
              </Txt>
              <Chip on={pace.days.length === 7} text={pace.days.length === 7 ? HIF.clearAll() : HIF.selectAll()} onPress={() => patch({ days: pace.days.length === 7 ? [] : [...ALL_DAYS] })} />
            </View>
            <DayChips days={pace.days} onToggle={(d) => patch({ days: pace.days.includes(d) ? pace.days.filter((x) => x !== d) : [...pace.days, d].sort() })} />
            {aboutLine()}
            {showSplit && (
              <>
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.divider }} />
                <EditRow label={HIF.perDay()} value={pace.perDay ? HIF.splitCustom() : HIF.splitEven()} onPress={() => setSheet('split')} />
              </>
            )}
          </Section>

          {finish && (
            <Section title={HIF.finishLine(revise)}>
              <Txt size={24} weight={700} color={c.ink}>
                {fmtDate(finish)}
              </Txt>
            </Section>
          )}

          <Section title={HIF.newPaceFrom()}>
            <EditRow value={fmtDate(pace.from)} onPress={() => setSheet('from')} />
          </Section>

          <View style={{ gap: 4 }}>
            <SecondaryButton
              square
              label={paused ? HIF.resumePlan() : HIF.pausePlan()}
              onPress={() => {
                plan.setPaused(pace.id, !paused);
                refresh();
                onExit();
              }}
            />
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
              hitSlop={8}
              accessibilityRole="button"
              style={styles.deleteBtn}
            >
              <Txt size={16} weight={700} center color="#b3402f">
                {HIF.deletePlan()}
              </Txt>
            </Pressable>
          </View>

          {sheetOf('scope', HIF.covers(), scopeBlock())}
          {sheetOf('split', HIF.perDay(), showSplit ? splitBlock() : null)}
          {sheetOf(
            'from',
            HIF.newPaceFrom(),
            <>
              <DateCalendar value={pace.from} min={p?.start ?? plan.today()} onChange={(from: string) => patch({ from })} label={HIF.newPaceFrom()} />
              <Hint>{HIF.pastDaysKept()}</Hint>
            </>,
          )}
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
            <Question title={HIF.daysQuestion(revise)} />
            {daysBlock()}
            {aboutLine()}
          </View>
        ),
        foot: next(undefined, !pace.days.length || Boolean(tooBig)),
      };
    }
    if (key === 'split') {
      return {
        body: (
          <View style={{ gap: 14 }}>
            <Question
              title={cutOk(pace) ? (pace.perDay ? HIF.splitQuestionExact : HIF.splitQuestionAbout)(UNIT_PLURAL[pace.divide as keyof typeof UNIT_PLURAL](), UNIT_ONE[pace.divide as keyof typeof UNIT_ONE]()) : HIF.splitQuestion()}
            />
            {splitBlock()}
          </View>
        ),
        foot: next(),
      };
    }
    // summary: «Your plan is ready»
    const everyDay = days.length === 7;
    const weekly = Math.round((divide ? amount : perDay ? Object.values(perDay).reduce((n, x) => n + x, 0) : amount * days.length) * 100) / 100;
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
          <Txt size={26} weight={800} center color={c.ink}>
            {HIF.planReady()}
          </Txt>
          {finish ? (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Txt size={14} color={c.meta}>
                {HIF.finishLine(revise)}
              </Txt>
              <Txt size={26} weight={800} color={c.ink}>
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
            {divide && row(HIF.divideSplitBy(), UNIT_NAME[divide as keyof typeof UNIT_NAME]())}
            {divide && !perDay && row(HIF.thatsAbout(), `${unitCount(divide, approxText(approxPerDay(pace)))} ${perWord('day')}`)}
            {perDay && row(divide ? `${HIF.perDay()} (${UNIT_PLURAL[divide as keyof typeof UNIT_PLURAL]()})` : HIF.perDay(), WEEK_ORDER.filter((d: number) => days.includes(d)).map((d: number) => `${weekdayName(d)} ${num(perDay[d])}`).join(' · '))}
          </View>
        </View>
      ),
      foot: next(HIF.startPlan(), !finish, save),
    };
  };

  const { body, foot } = editing ? edit() : question();
  // the questions are counted; the summary is not a question
  const asked = keys.filter((k) => k !== 'summary').slice(pace.first);
  const n = asked.length;
  const i = asked.indexOf(key);

  return (
    <View style={{ flex: 1 }}>
      <HifHeader title={editing ? HIF.editPlan() : HIF.newPlan()} onBack={leave} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView key={editing ? 'edit' : key} contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 18 }} keyboardShouldPersistTaps="handled">
          {!editing && i >= 0 && (
            <View style={{ gap: 8 }}>
              <Txt size={13} weight={600} color={c.meta}>
                {HIF.stepOf(i + 1, n)}
              </Txt>
              <View style={[styles.track, { backgroundColor: hm.tile }]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: n, now: i + 1 }}>
                <View style={[styles.fill, { backgroundColor: hm.forest, width: `${((i + 1) / n) * 100}%` }]} />
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
  card: { gap: 16 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, minHeight: 68, borderBottomWidth: StyleSheet.hairlineWidth },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  amtRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amt: { width: '100%', padding: 0, textAlign: 'center', fontSize: 30, fontWeight: '800', minHeight: 44 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  two: { flexDirection: 'row', gap: 10 },
  daysHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56 },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 68 },
  splitVal: { width: 78, alignItems: 'center' },
  stepper: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth * 2 },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  dayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: { flexGrow: 1, flexBasis: '22%', minHeight: 44, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  modeRow: { flexDirection: 'row', gap: 8 },
  deleteBtn: { minHeight: 48, justifyContent: 'center' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  sumRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12, gap: 2 },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
