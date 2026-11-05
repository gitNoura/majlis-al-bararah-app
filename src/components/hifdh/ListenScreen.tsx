// «Listen» (listen.js of the website), on the mushaf: the same page book as the Quran screen (PageCurl) under
// its own top bar (back, the index, the surah and page in the middle) and its own player pill. A tap on an
// ayah chooses it, a second tap takes everything between; the settings sheet (the pill's summary or gear) has
// the other ways: From / To, whole page or surah, how many times each ayah is heard, speed, reciter and the
// way of listening, ending with «Play audio». The ayat chosen are tinted green, the ones of the step heard
// gently, the one heard now gold, and the page turns by itself to follow it. Leaving keeps the reading place:
// nothing here writes 'lastPage'. The engine (steps, two players taking turns, the log) is `Listener` in
// src/lib/hifdh/listen.js.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, GlassBackdrop } from '@/components/Glass';
import { Section } from '@/components/hifdh/Section';
import { BackIcon, CloseIcon, MenuIcon, PauseIcon, PlayIcon, SettingsIcon } from '@/components/icons';
import { PageCurl, type Marked } from '@/components/PageCurl';
import { QuranIndex } from '@/components/QuranIndex';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { ayatOn, pageOf } from '@/lib/boxes';
import { PAGE_SHAPE } from '@/lib/crop';
import { counts, keysFromTo, Listener, MAX_TYPED, METHODS, ordered, parse, pos, QUICK, reciterOf, available, SPEEDS, times } from '@/lib/hifdh/listen';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { readJSON } from '@/lib/storage';
import { ui } from '@/theme/fonts';
import { radius } from '@/theme/tokens';
import { QuranTheme, useTheme } from '@/theme/theme';

type Sel = { from: string; to: string };

const PLAYER_H = 64; // the player pill's height, as on the website
const PAGE_GREEN = 'rgba(27, 107, 83, 0.2)'; // chosen
const STEP_GREEN = 'rgba(27, 107, 83, 0.14)'; // the other ayat of the step being heard
const NOW_GOLD = 'rgba(217, 185, 106, 0.42)'; // the ayah heard now

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
          <Txt size={18} weight={700} color={c.ink} center style={{ paddingVertical: 12 }}>
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

const savedPage = () => {
  const n = Number(readJSON('lastPage', 1));
  return Number.isFinite(n) && n >= 1 && n <= TOTAL_PAGES ? n : 1;
};

// The Listen screen (the Quran's own day / night, as the reading page)
export function ListenScreen({ start, onBack }: { start: string | null; onBack: () => void }) {
  return (
    <QuranTheme>
      <Listen start={start} onBack={onBack} />
    </QuranTheme>
  );
}

function Listen({ start, onBack }: { start: string | null; onBack: () => void }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [, bump] = useState(0);
  const [ls] = useState(() => new Listener());
  const [page, setPage] = useState(() => (start ? (pageOf(...(parse(start) as [number, number])) ?? savedPage()) : savedPage()));
  const [sel, setSel] = useState<Sel | null>(null);
  const [anchor, setAnchor] = useState(false); // exactly one ayah is chosen: a second tap takes everything between
  const [hint, setHint] = useState('');
  const [setOpen, setSetOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [seenNow, setSeenNow] = useState<string | null>(null);

  useEffect(() => {
    ls.start(() => bump((n) => n + 1));
    return () => ls.release();
  }, [ls]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (setOpen ? setSetOpen(false) : onBack(), true));
    return () => sub.remove();
  }, [onBack, setOpen]);
  useEffect(() => {
    const ahead = [page + 1, page + 2, page + 3, page - 1].filter((n) => n >= 1 && n <= TOTAL_PAGES).map(pageUrl);
    Image.prefetch(ahead, 'disk').catch(() => {});
  }, [page]);
  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(''), 2800);
    return () => clearTimeout(timer);
  }, [hint]);

  const prefs = ls.prefs;
  const keys = useMemo(() => (sel ? keysFromTo(sel.from, sel.to) : []), [sel]);
  const selId = sel ? `${sel.from}-${sel.to}|${prefs.method}` : '';
  const s = ls.s && ls.s.selId === selId ? ls.s : null;
  const playing = ls.playing && !!s;
  const step = s ? s.steps[s.si] : null;
  const now = s && !s.finished ? s.steps[s.si][s.ki] : null;

  // the page follows the ayah that is heard
  if (now !== seenNow) {
    setSeenNow(now);
    const p = now ? pageOf(...(parse(now) as [number, number])) : null;
    if (p && p !== page) setPage(p);
  }

  // the page room, as the Quran screen's
  const top = insets.top + 96;
  const bottom = insets.bottom + PLAYER_H + 18;
  const roomH = height - top - bottom;
  const pageW = Math.min(width - 10, (roomH - 12) * PAGE_SHAPE);
  const pageH = pageW / PAGE_SHAPE;
  const nameTop = Math.min(insets.top + 10 + 32, top + (roomH - pageH) / 2 - 44 - 6);

  // the tint of the ayat on this page: chosen, the step heard, the one heard now (drawn last)
  const onPage = ayatOn(page) as { s: number; a: number; boxes: number[][] }[];
  const chosenSet = new Set(keys);
  const stepSet = new Set(step ?? []);
  const marks: Marked[] = [
    ...onPage.filter((e) => chosenSet.has(`${e.s}:${e.a}`)).map((e) => ({ ...e, color: PAGE_GREEN })),
    ...onPage.filter((e) => stepSet.has(`${e.s}:${e.a}`) && `${e.s}:${e.a}` !== now).map((e) => ({ ...e, color: STEP_GREEN })),
    ...onPage.filter((e) => `${e.s}:${e.a}` === now).map((e) => ({ ...e, color: NOW_GOLD })),
  ];
  const first = onPage[0];
  const where = first ? surahName(SURAHS[first.s - 1]) : '';

  const say = (text: string) => setHint(text);
  // A tap on the page chooses an ayah, and a second tap completes the range. Once the range is complete, or
  // something is playing, taps do nothing (a stray touch must not change it).
  const tapAyah = (su: number, a: number) => {
    const key = `${su}:${a}`;
    if (ls.s || (sel && !anchor)) return say(HIF.lsLocked());
    if (!sel || !anchor) {
      setSel({ from: key, to: key });
      setAnchor(true);
    } else {
      const [from, to] = ordered(sel.from, key);
      setSel({ from, to });
      setAnchor(false);
    }
  };
  const setRange = (next: Sel) => {
    setSel(next);
    setAnchor(false);
  };
  const setFrom = (from: string) => setRange({ from, to: sel && pos(sel.to) >= pos(from) ? sel.to : from });
  const setTo = (to: string) => setRange({ from: sel?.from ?? to, to: sel && pos(to) < pos(sel.from) ? sel.from : to }); // an end before the start is taken as the start
  const base = sel?.from ?? (first ? `${first.s}:${first.a}` : '1:1');
  const wholeSurah = () => {
    const su = parse(base)[0];
    setRange({ from: `${su}:1`, to: `${su}:${counts()[su - 1]}` });
  };
  const wholePage = () => {
    if (!onPage.length) return;
    const last = onPage[onPage.length - 1];
    setRange({ from: `${onPage[0].s}:${onPage[0].a}`, to: `${last.s}:${last.a}` });
  };
  const clear = useCallback(() => {
    ls.halt();
    setSel(null);
    setAnchor(false);
  }, [ls]);

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

  const names = (r: { name: string[] }) => r.name[isEnglish ? 1 : 0];
  const methodText: Record<string, [string, string]> = {
    each: [HIF.lsMethodEach(), HIF.lsMethodEachD()],
    prev: [HIF.lsMethodPrev(), HIF.lsMethodPrevD()],
    all: [HIF.lsMethodAll(), HIF.lsMethodAllD()],
  };
  const play = () => ls.togglePlay(keys, selId);
  const startFromSheet = () => {
    const range = sel ?? { from: base, to: base }; // the sheet shows From / To even when nothing was tapped yet
    setSel(range);
    setAnchor(false);
    setSetOpen(false);
    ls.begin(keysFromTo(range.from, range.to), `${range.from}-${range.to}|${prefs.method}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.screen, overflow: 'hidden' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GlassBackdrop
        glass={
          <>
            {/* the top: back and the index at the line's start, the surah and page in the middle */}
            <View style={[styles.top, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
              <Pressable onPress={onBack} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel={HIF.close()}>
                <BackIcon color={c.ink} rtl={!isEnglish} />
              </Pressable>
              <Pressable onPress={() => setIndexOpen(true)} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel={HIF.lsSurah()}>
                <MenuIcon color={c.ink} />
              </Pressable>
            </View>
            <View style={[styles.name, { top: nameTop, height: 44 }]} pointerEvents="box-none">
              <Pressable onPress={() => setIndexOpen(true)} style={styles.where}>
                <Txt size={18} weight={700} center color={c.ink} numberOfLines={1}>
                  {where}
                </Txt>
                <Txt size={13} center color={c.meta}>
                  {HIF.lsPageN(page)}
                </Txt>
              </Pressable>
            </View>

            {/* the bar under the page: what is chosen (and heard), clear, repeat, settings, previous, play, next */}
            <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: insets.bottom + 12 }]}>
              <Glass acrylic style={[styles.player, { width: Math.min(width - 24, 520) }]}>
                <View style={styles.pillRow}>
                <Pressable onPress={() => setSetOpen(true)} accessibilityRole="button" accessibilityLabel={HIF.lsSettings()} style={styles.summary}>
                  <Txt size={16} weight={700} color={c.ink} numberOfLines={1}>
                    {title}
                  </Txt>
                  <Txt size={12.5} color={s?.error ? '#b3402e' : c.meta} numberOfLines={1}>
                    {sub}
                  </Txt>
                </Pressable>
                {sel && (
                  <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel={HIF.lsQuickClear()} style={[styles.ico, { backgroundColor: c.soft }]}>
                    <CloseIcon color={c.ink} size={20} />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => ls.setPref('loop', !prefs.loop)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: prefs.loop }}
                  accessibilityLabel={HIF.lsLoop()}
                  style={[styles.ico, { backgroundColor: prefs.loop ? c.on : c.soft }]}
                >
                  <Txt size={18} weight={700} color={prefs.loop ? c.onInk : c.ink}>
                    ⟲
                  </Txt>
                </Pressable>
                <Pressable onPress={() => setSetOpen(true)} accessibilityRole="button" accessibilityLabel={HIF.lsSettings()} style={[styles.ico, { backgroundColor: c.soft }]}>
                  <SettingsIcon color={c.ink} size={20} />
                </Pressable>
                {s && (
                  <Pressable
                    onPress={() => ls.jump(-1)}
                    disabled={s.si === 0}
                    accessibilityRole="button"
                    accessibilityLabel={HIF.lsPrevStep()}
                    style={[styles.ico, { backgroundColor: c.soft, opacity: s.si === 0 ? 0.35 : 1 }]}
                  >
                    <BackIcon color={c.ink} size={20} rtl={!isEnglish} />
                  </Pressable>
                )}
                <Pressable
                  onPress={play}
                  disabled={!sel}
                  accessibilityRole="button"
                  accessibilityLabel={playing ? HIF.lsPause() : HIF.lsPlay()}
                  style={[styles.play, { backgroundColor: c.on, opacity: sel ? 1 : 0.35 }]}
                >
                  {playing ? <PauseIcon color={c.onInk} size={22} /> : <PlayIcon color={c.onInk} size={22} />}
                </Pressable>
                {s && (
                  <Pressable
                    onPress={() => ls.jump(1)}
                    disabled={s.si >= s.steps.length - 1}
                    accessibilityRole="button"
                    accessibilityLabel={HIF.lsNextStep()}
                    style={[styles.ico, { backgroundColor: c.soft, opacity: s.si >= s.steps.length - 1 ? 0.35 : 1 }]}
                  >
                    <View style={{ transform: [{ scaleX: -1 }] }}>
                      <BackIcon color={c.ink} size={20} rtl={!isEnglish} />
                    </View>
                  </Pressable>
                )}
                </View>
              </Glass>
            </View>
          </>
        }
      >
        <ScreenBackground />
        <View style={{ position: 'absolute', top, left: 0, right: 0, height: roomH }}>
          <PageCurl
            page={page}
            width={width}
            height={roomH}
            pageW={pageW}
            pageH={pageH}
            full={false}
            chosen={[]}
            unzoom={0}
            onTurned={(p) => setPage(Math.min(TOTAL_PAGES, Math.max(1, p)))}
            marks={marks}
            pins={[]}
            onAyah={tapAyah}
            onPin={() => {}}
            onEmptyTap={() => {}}
            onZoomed={() => {}}
          />
        </View>
      </GlassBackdrop>

      <QuranIndex open={indexOpen} page={page} onClose={() => setIndexOpen(false)} onGo={(p) => setPage(Math.min(TOTAL_PAGES, Math.max(1, p)))} />

      {setOpen && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 30, elevation: 30 }]}>{/* above the top bar (zIndex 5), which would show through */}
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} onPress={() => setSetOpen(false)} accessibilityLabel={HIF.lsClose()} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
            <View style={[styles.sheet, { backgroundColor: c.panel, paddingBottom: insets.bottom + 12, maxHeight: height - insets.top - 24 }]}>
              <View style={styles.sheetHead}>
                <Txt size={20} weight={700} color={c.ink} style={{ flex: 1 }}>
                  {HIF.lsSettings()}
                </Txt>
                <Pressable onPress={() => setSetOpen(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel={HIF.lsClose()}>
                  <CloseIcon color={c.ink} size={22} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
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
                  <Txt size={18} weight={700} color={c.ink}>
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
                  <Txt size={18} weight={700} color={c.ink}>
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
              <Pressable
                onPress={startFromSheet}
                accessibilityRole="button"
                style={[styles.go, { backgroundColor: c.on }]}
              >
                <PlayIcon color={c.onInk} size={22} />
                <Txt size={16} weight={700} color={c.onInk}>
                  {HIF.lsGo()}
                </Txt>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4, zIndex: 5 },
  back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  name: { position: 'absolute', left: 100, right: 100, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  where: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10 },
  player: { height: PLAYER_H, borderRadius: PLAYER_H / 2 },
  pillRow: { alignSelf: 'stretch', height: PLAYER_H, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  summary: { flex: 1, minWidth: 0, paddingVertical: 6, paddingHorizontal: 10, gap: 1 },
  ico: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  play: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  go: { minHeight: 52, borderRadius: radius.button, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.chip, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  other: { minWidth: 96, height: 40, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, textAlign: 'center', fontSize: 14, fontFamily: ui(600) },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surahBtn: { flex: 1, minHeight: 44, borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center' },
  ayahBox: { width: 64, height: 44, borderRadius: radius.chip, borderWidth: 1, textAlign: 'center', fontSize: 16, fontFamily: ui(600) },
  modalBack: { flex: 1, justifyContent: 'flex-end' },
  modal: { maxHeight: '80%', borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, paddingHorizontal: 16 },
  surahRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth },
  method: { borderRadius: radius.chip, borderWidth: 1, padding: 12, gap: 2 },
});
