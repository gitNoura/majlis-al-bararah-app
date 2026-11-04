// «Listen» (listen.js of the website): choose the ayat (from / to, the whole page or surah), how many times
// each is heard, the speed, the reciter and the way of listening, then play. The player bar at the bottom shows
// what is heard now and has previous / play / next, repeat-all and ✕. Unlike the website there is no mushaf
// behind it: the ayat are picked with the two «surah + ayah» boxes (the website's settings sheet).
// The engine (steps, two players taking turns, the log) is `Listener` in src/lib/hifdh/listen.js.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HifHeader } from '@/components/hifdh/HifHeader';
import { Section } from '@/components/hifdh/Section';
import { BackIcon, CloseIcon, PauseIcon, PlayIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { ayatOn, pageOf } from '@/lib/boxes';
import { counts, keysFromTo, Listener, MAX_TYPED, METHODS, ordered, parse, pos, QUICK, reciterOf, available, SPEEDS, times } from '@/lib/hifdh/listen';
import { SURAHS } from '@/lib/quran';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Sel = { from: string; to: string };

const PLAYER_H = 150; // the player bar's height (the scroll leaves room for it)

// «al-Baqarah 7», «al-Baqarah 7–9», «al-Baqarah 286 ← Āl ʿImrān 3»
function labelOf(from: string, to: string) {
  const [s1, a1] = parse(from);
  const [s2, a2] = parse(to);
  if (from === to) return `${surahName(SURAHS[s1 - 1])} ${a1}`;
  if (s1 === s2) return `${surahName(SURAHS[s1 - 1])} ${a1}–${a2}`;
  return `${surahName(SURAHS[s1 - 1])} ${a1} ${isEnglish ? '→' : '←'} ${surahName(SURAHS[s2 - 1])} ${a2}`;
}

function Chip({ label, on, onPress, small }: { label: string; on?: boolean; onPress: () => void; small?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      style={[styles.chip, { backgroundColor: on ? c.on : c.soft, borderColor: on ? c.on : c.line, minWidth: small ? 44 : undefined }]}
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
  const [typed, setTyped] = useState<string | null>(null); // what is being typed (null: show the chosen number)
  const text = typed ?? (other ? String(value) : '');
  return (
    <View style={styles.wrapRow}>
      {QUICK.map((n) => (
        <Chip key={n} label={String(n)} small on={value === n} onPress={() => onChange(n)} />
      ))}
      <TextInput
        value={text}
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

function SurahPicker({ open, onPick, onClose }: { open: boolean; onPick: (n: number) => void; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} transparent>
      <View style={[styles.modalBack, { backgroundColor: c.dim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={HIF.close()} />
        <View style={[styles.modal, { backgroundColor: c.screen, paddingBottom: insets.bottom + 8 }]}>
          <Txt serif size={18} weight={700} color={c.ink} center style={{ paddingVertical: 12 }}>
            {HIF.lsSurah()}
          </Txt>
          <FlatList
            data={SURAHS}
            keyExtractor={(s) => String(s.number)}
            renderItem={({ item }) => (
              <Pressable onPress={() => onPick(item.number)} style={[styles.surahRow, { borderColor: c.line }]}>
                <Txt size={13} color={c.meta} style={{ width: 34 }}>
                  {item.number}
                </Txt>
                <Txt size={16} weight={600} color={c.ink}>
                  {surahName(item)}
                </Txt>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// «surah [..] ayah [− n +]»
function Point({ label, value, onChange }: { label: string; value: string; onChange: (key: string) => void }) {
  const { c } = useTheme();
  const [su, a] = parse(value);
  const [pick, setPick] = useState(false);
  const [typed, setTyped] = useState<string | null>(null); // what is being typed (null: show the chosen ayah)
  const text = typed ?? String(a);
  const max = counts()[su - 1];
  const setAyah = (n: number) => onChange(`${su}:${Math.min(max, Math.max(1, n))}`);
  return (
    <View style={{ gap: 6 }}>
      <Txt size={13} weight={700} color={c.meta}>
        {label}
      </Txt>
      <View style={styles.pointRow}>
        <Pressable onPress={() => setPick(true)} accessibilityRole="button" style={[styles.surahBtn, { borderColor: c.line, backgroundColor: c.card }]}>
          <Txt size={15} weight={600} color={c.ink} numberOfLines={1}>
            {surahName(SURAHS[su - 1])}
          </Txt>
        </Pressable>
        <Chip label="−" small onPress={() => setAyah(a - 1)} />
        <TextInput
          value={text}
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
        <Chip label="+" small onPress={() => setAyah(a + 1)} />
      </View>
      <SurahPicker
        open={pick}
        onClose={() => setPick(false)}
        onPick={(n) => {
          setPick(false);
          onChange(`${n}:${Math.min(a, counts()[n - 1])}`);
        }}
      />
    </View>
  );
}

export function ListenScreen({ start, onBack }: { start: string | null; onBack: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [, bump] = useState(0);
  const [ls] = useState(() => new Listener());
  const [sel, setSel] = useState<Sel | null>(start ? { from: start, to: start } : null);

  useEffect(() => {
    ls.start(() => bump((n) => n + 1));
    return () => ls.release();
  }, [ls]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (onBack(), true));
    return () => sub.remove();
  }, [onBack]);

  const keys = useMemo(() => (sel ? keysFromTo(sel.from, sel.to) : []), [sel]);
  const prefs = ls.prefs;
  const selId = sel ? `${sel.from}-${sel.to}|${prefs.method}` : '';
  const s = ls.s && ls.s.selId === selId ? ls.s : null;
  const playing = ls.playing && !!s;

  const setFrom = (from: string) => setSel((p) => ({ from, to: p && pos(p.to) >= pos(from) ? p.to : from }));
  const setTo = (to: string) => setSel((p) => ({ from: p?.from ?? to, to: p && pos(to) < pos(p.from) ? p.from : to })); // an end before the start is taken as the start
  const base = sel?.from ?? '1:1';
  const wholeSurah = () => {
    const su = parse(base)[0];
    setSel({ from: `${su}:1`, to: `${su}:${counts()[su - 1]}` });
  };
  const wholePage = () => {
    const [su, a] = parse(base);
    const page = pageOf(su, a);
    const list = page ? (ayatOn(page) as { s: number; a: number }[]) : [];
    if (!list.length) return;
    const [from, to] = ordered(`${list[0].s}:${list[0].a}`, `${list[list.length - 1].s}:${list[list.length - 1].a}`);
    setSel({ from, to });
  };
  const clear = useCallback(() => {
    ls.halt();
    setSel(null);
  }, [ls]);


  let title = sel ? labelOf(sel.from, sel.to) : HIF.lsNothingChosen();
  let sub = sel ? HIF.lsAyatCount(keys.length) : '';
  if (s) {
    const step = s.steps[s.si];
    const bits = [HIF.lsStep(s.si + 1, s.steps.length), HIF.lsTime(s.pass + 1, prefs.repeat)];
    if (prefs.loop || prefs.rounds !== 1) bits.push(HIF.lsRound(s.round + 1, prefs.loop ? 0 : prefs.rounds));
    const [x, y] = step.length > 1 ? ordered(step[0], step[step.length - 1]) : [step[0], step[0]];
    title = labelOf(x, y);
    sub = s.error ? HIF.lsError() : s.finished ? HIF.lsDone() : bits.join(' · ');
  }
  const names = (r: { name: string[] }) => r.name[isEnglish ? 1 : 0];
  const methodText: Record<string, [string, string]> = {
    each: [HIF.lsMethodEach(), HIF.lsMethodEachD()],
    prev: [HIF.lsMethodPrev(), HIF.lsMethodPrevD()],
    all: [HIF.lsMethodAll(), HIF.lsMethodAllD()],
  };

  return (
    <View style={{ flex: 1 }}>
      <HifHeader title={HIF.tabListen()} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + PLAYER_H + 24 }} keyboardShouldPersistTaps="handled">
        <Section title={HIF.lsRangeH()}>
          <Point label={HIF.lsFrom()} value={sel?.from ?? base} onChange={setFrom} />
          <Point label={HIF.lsTo()} value={sel?.to ?? base} onChange={setTo} />
          <Txt size={13} weight={700} color={c.meta}>
            {HIF.lsQuickH()}
          </Txt>
          <View style={styles.wrapRow}>
            <Chip label={HIF.lsQuickPage()} onPress={wholePage} />
            <Chip label={HIF.lsQuickSurah()} onPress={wholeSurah} />
          </View>
        </Section>

        <Section title={HIF.lsEachH()}>
          <Nums value={prefs.repeat} onChange={(n) => ls.setPref('repeat', n)} />
          <Txt serif size={18} weight={700} color={c.ink}>
            {HIF.lsRoundsH()}
          </Txt>
          <Nums value={prefs.rounds} onChange={(n) => ls.setPref('rounds', n)} />
        </Section>

        <Section title={HIF.lsSpeed()}>
          <View style={styles.wrapRow}>
            {SPEEDS.map((v) => (
              <Chip key={v} label={`${v}×`} on={prefs.speed === v} onPress={() => ls.setPref('speed', v)} />
            ))}
          </View>
          <Txt serif size={18} weight={700} color={c.ink}>
            {HIF.lsReciter()}
          </Txt>
          <View style={styles.wrapRow}>
            {available().map((r) => (
              <Chip key={r.id} label={names(r)} on={reciterOf(prefs).id === r.id} onPress={() => ls.setPref('reciter', r.id)} />
            ))}
          </View>
        </Section>

        <Section title={`${HIF.lsMethod()} ${HIF.lsOptional()}`}>
          {METHODS.map((m) => {
            const on = prefs.method === m;
            return (
              <Pressable
                key={m}
                onPress={() => ls.setPref('method', m)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.method, { backgroundColor: on ? c.soft : c.card, borderColor: on ? c.chosenLine : c.line }]}
              >
                <Txt size={15} weight={700} color={c.ink}>
                  {methodText[m][0]}
                </Txt>
                <Txt size={13} color={c.meta}>
                  {methodText[m][1]}
                </Txt>
              </Pressable>
            );
          })}
        </Section>
      </ScrollView>

      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', paddingBottom: insets.bottom + 12, paddingHorizontal: 12 }]}>
        <View style={[styles.player, { backgroundColor: c.card, borderColor: c.line }]}>
          <View style={styles.playerTop}>
            <View style={{ flex: 1 }}>
              <Txt serif size={17} weight={700} color={c.ink} numberOfLines={1}>
                {title}
              </Txt>
              <Txt size={13} color={s?.error ? '#b3261e' : c.meta} numberOfLines={1}>
                {sub}
              </Txt>
            </View>
            {sel && (
              <Pressable onPress={clear} hitSlop={10} accessibilityRole="button" accessibilityLabel={HIF.lsQuickClear()}>
                <CloseIcon color={c.ink} size={22} />
              </Pressable>
            )}
          </View>
          <View style={styles.controls}>
            <Pressable
              onPress={() => ls.setPref('loop', !prefs.loop)}
              accessibilityRole="button"
              accessibilityState={{ selected: prefs.loop }}
              accessibilityLabel={HIF.lsLoop()}
              style={[styles.round, { backgroundColor: prefs.loop ? c.on : c.soft }]}
            >
              <Txt size={18} weight={700} color={prefs.loop ? c.onInk : c.ink}>
                ⟲
              </Txt>
            </Pressable>
            <Pressable
              onPress={() => ls.jump(-1)}
              disabled={!s || s.si === 0}
              accessibilityRole="button"
              accessibilityLabel={HIF.lsPrevStep()}
              style={[styles.round, { opacity: !s || s.si === 0 ? 0.35 : 1 }]}
            >
              <BackIcon color={c.ink} rtl={!isEnglish} />
            </Pressable>
            <Pressable
              onPress={() => ls.togglePlay(keys, selId)}
              disabled={!sel}
              accessibilityRole="button"
              accessibilityLabel={playing ? HIF.lsPause() : HIF.lsPlay()}
              style={[styles.play, { backgroundColor: c.on, opacity: sel ? 1 : 0.45 }]}
            >
              {playing ? <PauseIcon color={c.onInk} size={26} /> : <PlayIcon color={c.onInk} size={26} />}
            </Pressable>
            <Pressable
              onPress={() => ls.jump(1)}
              disabled={!s || s.si >= s.steps.length - 1}
              accessibilityRole="button"
              accessibilityLabel={HIF.lsNextStep()}
              style={[styles.round, { opacity: !s || s.si >= s.steps.length - 1 ? 0.35 : 1 }]}
            >
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <BackIcon color={c.ink} rtl={!isEnglish} />
              </View>
            </Pressable>
            <View style={styles.round} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.chip, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  other: { minWidth: 96, height: 40, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, textAlign: 'center', fontSize: 14 },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surahBtn: { flex: 1, minHeight: 44, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center' },
  ayahBox: { width: 64, height: 44, borderRadius: radius.chip, borderWidth: 1, textAlign: 'center', fontSize: 16 },
  modalBack: { flex: 1, justifyContent: 'flex-end' },
  modal: { maxHeight: '80%', borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, paddingHorizontal: 16 },
  surahRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth },
  method: { borderRadius: radius.chip, borderWidth: 1, padding: 12, gap: 2 },
  player: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.14)' },
  playerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  controls: { flexDirection: 'row', direction: 'ltr', alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  play: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
