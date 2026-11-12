// LISTEN mode of the Quran page: the same mushaf page, with a player bar under it and a settings sheet.
//   tap an ayah   chooses it; a second tap takes everything between (then taps do nothing until the choice is cleared)
//   the bar       what is chosen (or heard now; a tap opens the settings), clear, previous step, play / pause, next step;
//                 («Whole surah» is in the settings; the index's play buttons play a surah at once)
//   the page      the chosen ayat are tinted green, the ones of the step heard lighter, the one heard now gold; the page
//                 turns by itself to follow the ayah heard (a jump: it does not count as reading)
//   the sheet     whole page / whole surah, how many times each ayah and the whole part are heard, speed, reciter, way
//                 of listening, then «Play audio»
// The engine (steps, two players taking turns, the log) is `Listener` in src/lib/hifdh/listen.js and is only alive while
// this mode is on. Nothing here writes 'lastPage' except through the page turn the Quran tab already handles.
'use no memo'; // reads the Listener's own state (a class), which the React Compiler cannot see change: it would keep the first drawing
import { GlassBack } from '@/components/home/Glass';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BackIcon, CloseIcon, PauseIcon, PlayIcon } from '@/components/icons';
import type { Marked } from '@/components/PageCurl';
import { Sheet } from '@/components/ui';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { ayatOn, pageOf } from '@/lib/boxes';
import { available, counts, keysFromTo, Listener, MAX_TYPED, METHODS, ordered, parse, pos, QUICK, reciterOf, SPEEDS, times, together } from '@/lib/hifdh/listen';
import { SURAHS } from '@/lib/quran';
import { ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

type Sel = { from: string; to: string };
type Ayat = { s: number; a: number; boxes: number[][] }[];

export const LISTEN_BAR_H = 64;
const CHOSEN = 'rgba(27, 107, 83, 0.2)';
const STEP = 'rgba(27, 107, 83, 0.14)';
const NOW = 'rgba(217, 185, 106, 0.42)';

// «al-Baqarah 7», «al-Baqarah 7–9», «al-Baqarah 286 ← Āl ʿImrān 3»
function labelOf(from: string, to: string) {
  const [s1, a1] = parse(from);
  const [s2, a2] = parse(to);
  if (from === to) return `${surahName(SURAHS[s1 - 1])} ${a1}`;
  if (s1 === s2) return `${surahName(SURAHS[s1 - 1])} ${a1}–${a2}`;
  return `${surahName(SURAHS[s1 - 1])} ${a1} ${isEnglish ? '→' : '←'} ${surahName(SURAHS[s2 - 1])} ${a2}`;
}

export function useListen(active: boolean, page: number, follow: (page: number) => void) {
  const { c } = useTheme();
  const [, bump] = useState(0);
  const [ls] = useState(() => new Listener());
  const [sel, setSel] = useState<Sel | null>(null);
  const [anchor, setAnchor] = useState(false); // exactly one ayah is chosen: a second tap takes everything between
  const [hint, setHint] = useState('');
  const [open, setOpen] = useState(false); // the settings sheet
  const [picker, setPicker] = useState<'from' | 'to' | null>(null); // the surah list, in the sheet's place

  // the players live only while the mode is on
  useEffect(() => {
    if (!active) return;
    ls.start(() => bump((n) => n + 1));
    return () => {
      ls.release();
      setSel(null);
      setAnchor(false);
      setOpen(false);
      setPicker(null);
    };
  }, [active, ls]);
  useEffect(() => {
    if (!hint) return;
    const id = setTimeout(() => setHint(''), 2800);
    return () => clearTimeout(id);
  }, [hint]);

  const prefs = ls.prefs;
  const keys = useMemo(() => (sel ? keysFromTo(sel.from, sel.to) : []), [sel]);
  const selId = sel ? `${sel.from}-${sel.to}|${prefs.method}` : '';
  const s = ls.s && ls.s.selId === selId ? ls.s : null;
  const playing = ls.playing && !!s;
  const step: string[] | null = s ? s.steps[s.si] : null;
  const now: string | null = s && !s.finished ? s.steps[s.si][s.ki] : null;

  // the page follows the ayah that is heard
  useEffect(() => {
    if (!active || !now) return;
    const p = pageOf(...(parse(now) as [number, number]));
    if (p && p !== page) follow(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const onPage = ayatOn(page) as Ayat;
  const first = onPage[0];
  const base = sel?.from ?? (first ? `${first.s}:${first.a}` : '1:1');

  const chosenSet = new Set(keys);
  // an ayah that is heard together with another one (al-Mulk 9 and 10 in Warsh, one audio file) is lit with it
  const stepSet = new Set((step ?? []).flatMap(together));
  const nowSet = new Set(now ? together(now) : []);
  const marks: Marked[] = active
    ? [
        ...onPage.filter((e) => chosenSet.has(`${e.s}:${e.a}`)).map((e) => ({ ...e, color: CHOSEN })),
        ...onPage.filter((e) => stepSet.has(`${e.s}:${e.a}`) && !nowSet.has(`${e.s}:${e.a}`)).map((e) => ({ ...e, color: STEP })),
        ...onPage.filter((e) => nowSet.has(`${e.s}:${e.a}`)).map((e) => ({ ...e, color: NOW })),
      ]
    : [];

  const setRange = (next: Sel) => {
    setSel(next);
    setAnchor(false);
  };
  // a tap on the page chooses an ayah, a second one completes the range; once it is complete or something plays, taps do nothing
  const tap = (su: number, a: number) => {
    const key = `${su}:${a}`;
    if (ls.s || (sel && !anchor)) return setHint(HIF.lsLocked());
    if (!sel || !anchor) {
      setSel({ from: key, to: key });
      setAnchor(true);
    } else {
      const [from, to] = ordered(sel.from, key);
      setSel({ from, to });
      setAnchor(false);
    }
  };
  const clear = () => {
    ls.halt();
    setSel(null);
    setAnchor(false);
  };
  const begin = (range: Sel) => {
    setRange(range);
    ls.begin(keysFromTo(range.from, range.to), `${range.from}-${range.to}|${prefs.method}`);
  };
  const surahOf = (su: number): Sel => ({ from: `${su}:1`, to: `${su}:${counts()[su - 1]}` });
  const setFrom = (from: string) => setRange({ from, to: sel && pos(sel.to) >= pos(from) ? sel.to : from });
  const setTo = (to: string) => setRange({ from: sel?.from ?? to, to: sel && pos(to) < pos(sel.from) ? sel.from : to }); // an end before the start is taken as the start
  const wholeSurah = () => setRange(surahOf(parse(base)[0]));
  const wholePage = () => {
    if (!onPage.length) return;
    const last = onPage[onPage.length - 1];
    setRange({ from: `${onPage[0].s}:${onPage[0].a}`, to: `${last.s}:${last.a}` });
  };
  // from the index: that whole surah, played at once
  const playSurahNo = (su: number) => begin(surahOf(su));
  // from the sheet: the chosen range, or the ayah at the top of the page when nothing was tapped
  const playFromSheet = () => {
    setOpen(false);
    begin(sel ?? { from: base, to: base });
  };

  let title = sel ? labelOf(sel.from, sel.to) : HIF.lsNothingChosen();
  let sub = sel ? (anchor ? `${HIF.lsAyatCount(keys.length)} · ${HIF.lsPickMore()}` : HIF.lsAyatCount(keys.length)) : HIF.lsPickShort();
  if (s && step) {
    const bits = [HIF.lsStep(s.si + 1, s.steps.length), HIF.lsTime(s.pass + 1, prefs.repeat)];
    if (prefs.loop || prefs.rounds !== 1) bits.push(HIF.lsRound(s.round + 1, prefs.loop ? 0 : prefs.rounds));
    const [x, y] = step.length > 1 ? ordered(step[0], step[step.length - 1]) : [step[0], step[0]];
    title = labelOf(x, y);
    sub = s.error ? HIF.lsError() : s.finished ? HIF.lsDone() : bits.join(' · ');
  }
  if (hint) sub = hint;

  const bar = (
    <View style={styles.barBox}>
      <Pill>
        <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={HIF.lsSettings()} style={styles.summary}>
          <Txt size={16} weight={700} color={c.ink} numberOfLines={1}>
            {title}
          </Txt>
          <Txt size={12.5} color={s?.error ? '#b3402e' : c.meta} numberOfLines={1}>
            {sub}
          </Txt>
        </Pressable>
        {!!sel && (
          <Btn label={HIF.lsQuickClear()} onPress={clear}>
            <CloseIcon color={c.ink} size={20} />
          </Btn>
        )}
        {!!s && (
          <Btn label={HIF.lsPrevStep()} onPress={() => ls.jump(-1)} disabled={s.si === 0}>
            <BackIcon color={c.ink} size={20} rtl={!isEnglish} />
          </Btn>
        )}
        <Btn label={playing ? HIF.lsPause() : HIF.lsPlay()} onPress={() => ls.togglePlay(keys, selId)} disabled={!sel} main>
          {playing ? <PauseIcon color={c.onInk} size={22} /> : <PlayIcon color={c.onInk} size={22} />}
        </Btn>
        {!!s && (
          <Btn label={HIF.lsNextStep()} onPress={() => ls.jump(1)} disabled={s.si >= s.steps.length - 1}>
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <BackIcon color={c.ink} size={20} rtl={!isEnglish} />
            </View>
          </Btn>
        )}
      </Pill>
    </View>
  );

  const names = (r: { name: string[] }) => r.name[isEnglish ? 1 : 0];
  const methodText: Record<string, [string, string]> = {
    each: [HIF.lsMethodEach(), HIF.lsMethodEachD()],
    prev: [HIF.lsMethodPrev(), HIF.lsMethodPrevD()],
    all: [HIF.lsMethodAll(), HIF.lsMethodAllD()],
  };
  const sheet = (
    <Sheet open={active && open} onClose={() => (picker ? setPicker(null) : setOpen(false))} title={picker ? HIF.lsSurah() : HIF.lsSettings()}>
      {picker ? (
        SURAHS.map((su: { number: number }) => (
          <SurahRow
            key={su.number}
            n={su.number}
            name={surahName(su)}
            onPress={() => {
              const [, a] = parse(picker === 'from' ? (sel?.from ?? base) : (sel?.to ?? base));
              const key = `${su.number}:${Math.min(a, counts()[su.number - 1])}`;
              if (picker === 'from') setFrom(key);
              else setTo(key);
              setPicker(null);
            }}
          />
        ))
      ) : (
        <>
      <Label>{HIF.lsRangeH()}</Label>
      <Point label={HIF.lsFrom()} value={sel?.from ?? base} onChange={setFrom} onSurah={() => setPicker('from')} />
      <Point label={HIF.lsTo()} value={sel?.to ?? base} onChange={setTo} onSurah={() => setPicker('to')} />
      <Label>{HIF.lsQuickH()}</Label>
      <View style={styles.wrap}>
        <Chip label={HIF.lsQuickPage()} onPress={wholePage} />
        <Chip label={HIF.lsQuickSurah()} onPress={wholeSurah} />
      </View>
      <Label>{HIF.lsEachH()}</Label>
      <Nums value={prefs.repeat} onChange={(n) => ls.setPref('repeat', n)} />
      <Label>{HIF.lsRoundsH()}</Label>
      <Nums value={prefs.rounds} onChange={(n) => ls.setPref('rounds', n)} />
      <Label>{HIF.lsSpeed()}</Label>
      <View style={styles.wrap}>
        {SPEEDS.map((v: number) => (
          <Chip key={v} label={`${v}×`} on={prefs.speed === v} onPress={() => ls.setPref('speed', v)} />
        ))}
      </View>
      <Label>{HIF.lsReciter()}</Label>
      <Reciters
        current={names(reciterOf(prefs))}
        list={available().map((r: { id: string; name: string[] }) => ({ id: r.id, name: names(r) }))}
        chosen={reciterOf(prefs).id}
        onChoose={(id) => ls.setPref('reciter', id)}
      />
      <Label>{`${HIF.lsMethod()} ${HIF.lsOptional()}`}</Label>
      {METHODS.map((m: string) => (
        <Method key={m} on={prefs.method === m} title={methodText[m][0]} text={methodText[m][1]} onPress={() => ls.setPref('method', m)} />
      ))}
      <GoButton label={HIF.lsGo()} onPress={playFromSheet} />
        </>
      )}
    </Sheet>
  );

  return { bar, sheet, marks, tap, playSurahNo, clear, choose: setRange };
}

// ---------- small parts ----------

function Pill({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={[styles.pill, { borderWidth: 0 }]}>
      <GlassBack strong radius={LISTEN_BAR_H / 2} />
      {children}
    </View>
  );
}

function Btn({ label, onPress, children, disabled, main }: { label: string; onPress: () => void; children: ReactNode; disabled?: boolean; main?: boolean }) {
  const { c } = useTheme();
  const size = main ? 50 : 38;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        styles.btn,
        { backgroundColor: main ? c.on : c.surface2, opacity: disabled ? 0.35 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}

function Label({ children }: { children: string }) {
  const { c } = useTheme();
  return (
    <Txt size={13} weight={700} color={c.meta} style={{ marginTop: space.sm }}>
      {children}
    </Txt>
  );
}

function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={[styles.chip, { backgroundColor: on ? c.on : c.surface2, borderColor: on ? c.on : c.line }]}
    >
      <Txt size={14} weight={700} color={on ? c.onInk : c.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

// 1-5, and one box for any other number
function Nums({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { c } = useTheme();
  const other = value > QUICK[QUICK.length - 1];
  const [typed, setTyped] = useState<string | null>(null);
  return (
    <View style={styles.wrap}>
      {QUICK.map((n: number) => (
        <Chip key={n} label={String(n)} on={value === n} onPress={() => onChange(n)} />
      ))}
      <TextInput
        value={typed ?? (other ? String(value) : '')}
        onChangeText={(v) => {
          const d = v.replace(/\D/g, '').slice(0, 2);
          setTyped(d);
          if (d) onChange(times(d));
        }}
        onBlur={() => setTyped(null)}
        keyboardType="number-pad"
        placeholder={HIF.lsOther()}
        placeholderTextColor={c.meta}
        maxLength={String(MAX_TYPED).length}
        accessibilityLabel={HIF.lsOther()}
        style={[styles.other, { color: c.ink, borderColor: other ? c.on : c.line, backgroundColor: c.card }]}
      />
    </View>
  );
}

// «surah [..] ayah [− n +]»
function Point({ label, value, onChange, onSurah }: { label: string; value: string; onChange: (key: string) => void; onSurah: () => void }) {
  const { c } = useTheme();
  const [su, a] = parse(value);
  const [typed, setTyped] = useState<string | null>(null);
  const max = counts()[su - 1];
  const setAyah = (n: number) => onChange(`${su}:${Math.min(max, Math.max(1, n))}`);
  return (
    <View style={{ gap: 6 }}>
      <Txt size={13} weight={700} color={c.meta}>
        {label}
      </Txt>
      <View style={styles.pointRow}>
        <Pressable onPress={onSurah} accessibilityRole="button" style={[styles.surahBtn, { borderColor: c.line, backgroundColor: c.card }]}>
          <Txt size={15} weight={600} color={c.ink} numberOfLines={1}>
            {surahName(SURAHS[su - 1])}
          </Txt>
        </Pressable>
        <Chip label="−" onPress={() => setAyah(a - 1)} />
        <TextInput
          value={typed ?? String(a)}
          onChangeText={(v) => {
            const d = v.replace(/\D/g, '').slice(0, 3);
            setTyped(d);
            if (d) setAyah(Number(d));
          }}
          onBlur={() => setTyped(null)}
          keyboardType="number-pad"
          accessibilityLabel={HIF.lsAyah()}
          style={[styles.ayahBox, { color: c.ink, borderColor: c.line, backgroundColor: c.card }]}
        />
        <Chip label="+" onPress={() => setAyah(a + 1)} />
      </View>
    </View>
  );
}

// the reciter: one field showing the name; a press opens the list under it, and choosing a name closes it
function Reciters({ current, list, chosen, onChoose }: { current: string; list: { id: string; name: string }[]; chosen: string; onChoose: (id: string) => void }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[styles.field, { borderColor: open ? c.on : c.line, backgroundColor: c.card }]}
      >
        <Txt size={15} weight={600} color={c.ink} numberOfLines={1} style={{ flex: 1 }}>
          {current}
        </Txt>
        <View style={{ transform: [{ rotate: open ? '90deg' : '-90deg' }] }}>
          <BackIcon color={c.ink} size={18} rtl={false} />
        </View>
      </Pressable>
      {open && (
        <View style={[styles.menu, { borderColor: c.line, backgroundColor: c.card }]}>
          {list.map((r, i) => (
            <Pressable
              key={r.id}
              onPress={() => {
                onChoose(r.id);
                setOpen(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: r.id === chosen }}
              style={[styles.option, i > 0 && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth }, r.id === chosen && { backgroundColor: c.surface2 }]}
            >
              <Txt size={15} weight={r.id === chosen ? 700 : 500} color={c.ink} numberOfLines={1} style={{ flex: 1 }}>
                {r.name}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function SurahRow({ n, name, onPress }: { n: number; name: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.surahRow, { borderColor: c.line }]}>
      <Txt size={13} color={c.meta} style={{ width: 34 }}>
        {n}
      </Txt>
      <Txt size={16} weight={600} color={c.ink}>
        {name}
      </Txt>
    </Pressable>
  );
}

function Method({ on, title, text, onPress }: { on: boolean; title: string; text: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.method, { backgroundColor: on ? c.surface2 : c.card, borderColor: on ? c.on : c.line }]}>
      <Txt size={15} weight={700} color={c.ink}>
        {title}
      </Txt>
      <Txt size={13} color={c.meta}>
        {text}
      </Txt>
    </Pressable>
  );
}

function GoButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.go, { backgroundColor: c.on }]}>
      <PlayIcon color={c.onInk} size={22} />
      <Txt size={16} weight={700} color={c.onInk}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barBox: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  pill: { alignSelf: 'stretch', maxWidth: 520, height: LISTEN_BAR_H, borderRadius: LISTEN_BAR_H / 2, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm, boxShadow: '0px 8px 22px rgba(20, 50, 38, 0.14)' },
  summary: { flex: 1, minWidth: 0, paddingVertical: 6, paddingHorizontal: 10, gap: 1 },
  btn: { alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  chip: { minHeight: 40, minWidth: 44, paddingHorizontal: 14, borderRadius: radius.chip, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  other: { minWidth: 96, height: 40, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, textAlign: 'center', fontSize: 14, fontFamily: ui(600) },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  surahBtn: { flex: 1, minHeight: 44, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center' },
  ayahBox: { width: 64, height: 44, borderRadius: radius.chip, borderWidth: 1, textAlign: 'center', fontSize: 16, fontFamily: ui(600) },
  field: { minHeight: 48, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  menu: { borderRadius: radius.chip, borderWidth: 1, overflow: 'hidden' },
  option: { minHeight: 46, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  surahRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth },
  method: { borderRadius: radius.chip, borderWidth: 1, padding: 12, gap: 2 },
  go: { minHeight: 52, borderRadius: radius.button, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
});
