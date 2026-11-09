// The picker of what you know, or what to work on (pk* of the website's hifz.js): two tabs, «Surahs» (a
// searchable list, each surah can be marked whole or by ayah range) and «Juz» (30 rows, each opening into
// its 16 thumun, grouped in two hizb). It does not own the data: `bits` is one 0/1 per ayah and `onSet`
// is called to put a span [from, to) in or out. The memorized page feeds it the ledger; the plan setup
// (3c-2) feeds it the plan's range. `quick` adds the summary and the two shortcuts of the memorized page.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { PrimaryButton, SecondaryButton } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { UNIT_PLURAL, num } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';

type Bits = ArrayLike<number>;
type Props = { bits: Bits; onSet: (from: number, to: number, on: boolean) => void; quick?: boolean };
type St = 0 | 1 | 2; // none, some, all

const count = (bits: Bits, a: number, b: number) => {
  let n = 0;
  for (let g = a; g < b; g++) n += bits[g];
  return n;
};
const stateOf = (have: number, size: number): St => (have === size ? 2 : have ? 1 : 0);
// Progress is told in ahzab (a hizb is 8 thumun, 60 in the Quran), not ayat: a part-known hizb counts by its share.
const hizbShare = (bits: Bits): number => {
  const hz = plan.units().unit.hizb;
  let sum = 0;
  for (let u = 0; u < hz.count; u++) sum += count(bits, hz.start[u], hz.start[u] + hz.size[u]) / hz.size[u];
  return Math.round(sum * 10) / 10;
};
const ARABIC = /[\u0600-\u06FF]/;

function Check({ st, label, onPress }: { st: St; label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ checked: st === 2 }}
      style={[
        styles.check,
        { borderColor: st ? c.goldStrong : c.chosenLine, backgroundColor: st === 2 ? c.on : st === 1 ? c.chosenLine : 'transparent' },
      ]}
    >
      {st === 2 && <CheckIcon color={c.onInk} size={16} strokeWidth={2.4} />}
      {st === 1 && <View style={[styles.some, { backgroundColor: c.goldStrong }]} />}
    </Pressable>
  );
}

function Tabs({ tab, onTab }: { tab: 'surah' | 'juz'; onTab: (t: 'surah' | 'juz') => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.tabs, { backgroundColor: c.soft }]}>
      {(['surah', 'juz'] as const).map((t) => (
        <Pressable
          key={t}
          onPress={() => onTab(t)}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === t }}
          style={[styles.tab, tab === t && { backgroundColor: c.on }]}
        >
          <Txt size={14.5} weight={700} color={tab === t ? c.onInk : c.ink}>
            {t === 'surah' ? HIF.surahs() : HIF.juzPlural()}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

function SurahList({ bits, onSet }: Omit<Props, 'quick'>) {
  const { c } = useTheme();
  const U = plan.units();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(-1);
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('');
  const query = q.trim().toLowerCase();
  // Arabic runs right to left: typed Arabic (or an empty field in the Arabic interface) sits on the right
  const rtl = ARABIC.test(q) || (!q && !isEnglish);

  const toggle = (i: number, n: number) => {
    setOpen(open === i ? -1 : i);
    setFrom('1');
    setTo(String(n));
  };

  return (
    <View style={{ gap: 8 }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={HIF.searchSurah()}
        placeholderTextColor={c.meta}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={[styles.search, { borderColor: c.chosenLine, backgroundColor: c.surface, color: c.ink }, rtl && styles.searchRtl]}
      />
      {SURAHS.map((sr, i) => {
        if (query && !(String(i + 1) === query || String(sr.name).includes(query) || (sr.latin || '').toLowerCase().includes(query))) return null;
        const a: number = U.surahStart[i];
        const n: number = U.surahStart[i + 1] - a;
        const have = count(bits, a, a + n);
        const isOpen = open === i;
        const clamp = (v: string, lo: number, hi: number, dflt: number) => Math.min(Math.max(Math.round(Number(v)) || dflt, lo), hi);
        const apply = (on: boolean) => {
          const f = clamp(from, 1, n, 1);
          const t = clamp(to, f, n, n);
          onSet(a + f - 1, a + t, on);
        };
        return (
          <View key={i} style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}>
            <View style={styles.rowHead}>
              <Check st={stateOf(have, n)} label={surahName(sr)} onPress={() => onSet(a, a + n, have !== n)} />
              <Pressable onPress={() => toggle(i, n)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={styles.rowMain}>
                <Txt size={16} weight={700} color={c.ink}>
                  {i + 1}. {surahName(sr)}
                </Txt>
                <Txt size={13} color={c.meta}>
                  {num(have)}/{num(n)}
                </Txt>
              </Pressable>
            </View>
            {isOpen && (
              <View style={styles.range}>
                <Txt size={13.5} color={c.meta}>
                  {HIF.fromAyah()}
                </Txt>
                <TextInput value={from} onChangeText={setFrom} keyboardType="number-pad" style={[styles.num, { borderColor: c.chosenLine, color: c.ink }]} />
                <Txt size={13.5} color={c.meta}>
                  {HIF.toAyah()}
                </Txt>
                <TextInput value={to} onChangeText={setTo} keyboardType="number-pad" style={[styles.num, { borderColor: c.chosenLine, color: c.ink }]} />
                <Pressable onPress={() => apply(true)} accessibilityRole="button" style={[styles.act, { backgroundColor: c.on }]}>
                  <Txt size={14} weight={700} color={c.onInk}>
                    {HIF.add()}
                  </Txt>
                </Pressable>
                <Pressable onPress={() => apply(false)} accessibilityRole="button" style={[styles.act, { borderWidth: 1, borderColor: c.chosenLine }]}>
                  <Txt size={14} weight={700} color={c.ink}>
                    {HIF.remove()}
                  </Txt>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function JuzList({ bits, onSet }: Omit<Props, 'quick'>) {
  const { c } = useTheme();
  const U = plan.units();
  const th = U.unit.thumun;
  const [open, setOpen] = useState(-1);

  const st = useMemo(() => {
    const out: St[] = [];
    for (let u = 0; u < th.count; u++) out.push(stateOf(count(bits, th.start[u], th.start[u] + th.size[u]), th.size[u]));
    return out;
  }, [bits, th]);
  const end = (u: number): number => th.start[u] + th.size[u];
  // all in: tapping takes it out; otherwise it is put in
  const span = (from: number, to: number) => onSet(from, to, count(bits, from, to) !== to - from);
  const cellColor = (s: St) => (s === 2 ? c.on : s === 1 ? c.chosenLine : c.soft);

  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: 30 }, (_, j) => {
        const cells = Array.from({ length: 16 }, (_, k) => 16 * j + k);
        const n = cells.filter((u) => st[u] === 2).length;
        const isOpen = open === j;
        return (
          <View key={j} style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}>
            <View style={styles.rowHead}>
              <Check
                st={n === 16 ? 2 : cells.some((u) => st[u]) ? 1 : 0}
                label={`${HIF.juzWord()} ${j + 1}`}
                onPress={() => span(th.start[16 * j], end(16 * j + 15))}
              />
              <Pressable onPress={() => setOpen(isOpen ? -1 : j)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={[styles.rowMain, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                <Txt size={16} weight={700} color={c.ink}>
                  {HIF.juzWord()} {num(j + 1)}
                </Txt>
                <View style={styles.strip}>
                  {cells.map((u) => (
                    <View key={u} style={[styles.stripCell, { backgroundColor: cellColor(st[u]) }]} />
                  ))}
                </View>
                <Txt size={13} color={c.meta}>
                  {num(n / 8)}/2
                </Txt>
              </Pressable>
            </View>
            {isOpen &&
              [0, 1].map((h) => {
                const a = 16 * j + 8 * h;
                return (
                  <View key={h} style={styles.hizb}>
                    <Pressable onPress={() => span(th.start[a], end(a + 7))} accessibilityRole="button" style={[styles.hizbBtn, { borderColor: c.chosenLine }]}>
                      <Txt size={13.5} weight={700} color={c.ink}>
                        {HIF.hizbWord()} {num(2 * j + h + 1)}
                      </Txt>
                    </Pressable>
                    <View style={styles.cells}>
                      {cells.slice(8 * h, 8 * h + 8).map((u) => (
                        <Pressable
                          key={u}
                          onPress={() => span(th.start[u], end(u))}
                          accessibilityRole="button"
                          accessibilityState={{ checked: st[u] === 2 }}
                          style={[styles.cell, { backgroundColor: cellColor(st[u]), borderColor: st[u] ? c.goldStrong : c.chosenLine }]}
                        >
                          <Txt size={13} weight={700} color={st[u] === 2 ? c.onInk : c.ink}>
                            {num((u % 8) + 1)}
                          </Txt>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}

export function MemorizedPicker({ bits, onSet, quick = false }: Props) {
  const { c } = useTheme();
  const [tab, setTab] = useState<'surah' | 'juz'>('surah');
  const N: number = plan.units().N;
  const total = count(bits, 0, N);
  const none = total === 0 && plan.nothingMemorized(); // chosen on purpose; pressing it again lets go of it

  return (
    <View style={{ gap: 12 }}>
      {quick && (
        <>
          <View style={styles.sum}>
            <Txt size={22} weight={800} color={c.ink}>
              {num(plan.ringPercent())}%
            </Txt>
            <Txt size={14} color={c.meta}>
              {HIF.ofQuran()} · {num(hizbShare(bits))}/60 {UNIT_PLURAL.hizb()}
            </Txt>
          </View>
          <View style={styles.quick}>
            <View style={{ flex: 1 }}>
              {total === N ? <PrimaryButton label={HIF.wholeQuran()} onPress={() => onSet(0, N, false)} /> : <SecondaryButton label={HIF.wholeQuran()} onPress={() => (plan.setNothingMemorized(false), onSet(0, N, true))} />}
            </View>
            <View style={{ flex: 1 }}>
              {none ? (
                <PrimaryButton label={HIF.nothingYet()} onPress={() => (plan.setNothingMemorized(false), onSet(0, 0, false))} />
              ) : (
                <SecondaryButton label={HIF.nothingYet()} onPress={() => (plan.setNothingMemorized(true), onSet(0, N, false))} />
              )}
            </View>
          </View>
        </>
      )}
      <Tabs tab={tab} onTab={setTab} />
      {tab === 'surah' ? <SurahList bits={bits} onSet={onSet} /> : <JuzList bits={bits} onSet={onSet} />}
    </View>
  );
}

const styles = StyleSheet.create({
  check: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  some: { width: 10, height: 3, borderRadius: 2 },
  tabs: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  tab: { flex: 1, minHeight: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  search: { minHeight: 46, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontSize: 15 },
  searchRtl: { textAlign: 'right', writingDirection: 'rtl' },
  row: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowMain: { flex: 1, minHeight: 36, justifyContent: 'center' },
  range: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  num: { width: 64, minHeight: 40, borderWidth: 1, borderRadius: 12, textAlign: 'center', fontSize: 15 },
  act: { minHeight: 40, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  strip: { flex: 1, flexDirection: 'row', gap: 2, height: 8 },
  stripCell: { flex: 1, borderRadius: 2 },
  hizb: { gap: 8, paddingTop: 4 },
  hizbBtn: { alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sum: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  quick: { flexDirection: 'row', gap: 8 },
});
