// The picker of what you know, or what to work on (pk* of the website's hifz.js): two tabs, «Surahs» (a
// searchable list, each surah can be marked whole or by ayah range) and «Juz» (30 rows, each opening into
// its 16 thumun, grouped in two hizb). It does not own the data: `bits` is one 0/1 per ayah and `onSet`
// is called to put a span [from, to) in or out. The memorized page feeds it the ledger; the plan setup
// (3c-2) feeds it the plan's range. `quick` adds the summary and the two shortcuts of the memorized page.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { PrimaryButton, SecondaryButton, alpha, useAccent } from '@/components/hifdh/Section';
import { Sheet } from '@/components/ui/Sheet';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { UNIT_PLURAL, num, unitCount } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { SURAHS } from '@/lib/quran';
import { useHome } from '@/theme/home';
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

// A round mark: empty, part-picked (the page's yellow) or all picked (forest green with a tick)
function Check({ st }: { st: St }) {
  const h = useHome();
  const { c } = useTheme();
  const a = useAccent();
  return (
    <View style={[styles.check, { borderColor: st === 2 ? h.forest : st === 1 ? a.mark : c.chosenLine, backgroundColor: st === 2 ? h.forest : st === 1 ? a.fill : 'transparent' }]}>
      {st === 2 && <CheckIcon color={h.forestInk} size={16} strokeWidth={2.6} />}
      {st === 1 && <View style={[styles.some, { backgroundColor: a.mark }]} />}
    </View>
  );
}

function Tabs({ tab, onTab }: { tab: 'surah' | 'juz'; onTab: (t: 'surah' | 'juz') => void }) {
  const { c } = useTheme();
  const h = useHome();
  return (
    <View style={[styles.tabs, { backgroundColor: h.well }]}>
      {(['surah', 'juz'] as const).map((t) => (
        <Pressable
          key={t}
          onPress={() => onTab(t)}
          accessibilityRole="button"
          accessibilityState={{ selected: tab === t }}
          style={[styles.tab, tab === t && { backgroundColor: h.card, boxShadow: `0px 2px 8px ${h.shadow}` }]}
        >
          <Txt size={14.5} weight={700} color={tab === t ? c.ink : c.meta}>
            {t === 'surah' ? HIF.surahs() : HIF.juzPlural()}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

// − / + button of the ayah range
function Step({ label, onPress, wide }: { label: string; onPress: () => void; wide?: boolean }) {
  const h = useHome();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={[styles.step, wide && styles.stepWide, { backgroundColor: h.card }]}>
      <Txt size={wide ? 13.5 : 20} weight={700} color={h.tileInk} style={wide ? undefined : { marginTop: -1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

// One end of the range: its name, − / + (and ±10 for the long surahs) around a number that can also be typed
function NumField({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  const h = useHome();
  const [text, setText] = useState<string | null>(null); // what is being typed, until the field is left
  const go = (v: number) => (setText(null), onChange(Math.min(Math.max(v, 1), max)));
  return (
    <View style={[styles.numCard, { backgroundColor: h.well }]}>
      <Txt size={13} weight={700} color={c.meta}>
        {label}
      </Txt>
      <View style={styles.numRow}>
        {max > 30 && <Step wide label="−10" onPress={() => go(value - 10)} />}
        <Step label="−" onPress={() => go(value - 1)} />
        <TextInput
          value={text ?? String(value)}
          onChangeText={(t) => {
            const d = t.replace(/\D/g, '');
            setText(d);
            if (d) onChange(Math.min(Math.max(Number(d), 1), max));
          }}
          onBlur={() => setText(null)}
          keyboardType="number-pad"
          selectTextOnFocus
          accessibilityLabel={label}
          style={[styles.numInput, { color: c.ink }]}
        />
        <Step label="+" onPress={() => go(value + 1)} />
        {max > 30 && <Step wide label="+10" onPress={() => go(value + 10)} />}
      </View>
    </View>
  );
}

// A sheet to put some ayat of a surah in or out: the range as two steppers, and a strip of the surah that shows what is
// already picked (green) and the range being set (yellow).
function RangeSheet({ title, n, a, bits, onSet, onClose }: { title: string; n: number; a: number; bits: Bits; onSet: Props['onSet']; onClose: () => void }) {
  const { c } = useTheme();
  const h = useHome();
  const acc = useAccent();
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(n);
  const setF = (v: number) => (setFrom(v), v > to && setTo(v));
  const setT = (v: number) => (setTo(v), v < from && setFrom(v));
  const apply = (on: boolean) => (onSet(a + from - 1, a + to, on), onClose());
  const BUCKETS = 36;
  const strip = Array.from({ length: BUCKETS }, (_, k) => {
    const lo = Math.floor((k * n) / BUCKETS);
    const hi = Math.max(lo + 1, Math.floor(((k + 1) * n) / BUCKETS));
    return count(bits, a + lo, a + hi) / (hi - lo);
  });
  return (
    <Sheet open onClose={onClose} title={title}>
      <Txt size={14} color={c.meta}>
        {unitCount('ayah', n)}
      </Txt>
      <View style={styles.stripWrap}>
        <View style={styles.stripRow}>
          {strip.map((f, k) => (
            <View key={k} style={[styles.stripBar, { backgroundColor: f >= 0.5 ? h.leaf : alpha(h.leaf, 0.16) }]} />
          ))}
        </View>
        <View pointerEvents="none" style={styles.stripSel}>
          <View style={{ flex: from - 1 }} />
          <View style={[styles.stripMark, { flex: to - from + 1, backgroundColor: alpha(acc.mark, 0.35), borderColor: acc.mark }]} />
          <View style={{ flex: n - to }} />
        </View>
      </View>
      <View style={styles.numPair}>
        <NumField label={HIF.fromAyah()} value={from} max={n} onChange={setF} />
        <NumField label={HIF.toAyah()} value={to} max={n} onChange={setT} />
      </View>
      <View style={styles.sumRow}>
        <View style={[styles.sumPill, { backgroundColor: acc.fill }]}>
          <Txt size={14} weight={700} color={acc.ink}>
            {num(from)} – {num(to)} · {unitCount('ayah', to - from + 1)}
          </Txt>
        </View>
        <Pressable
          onPress={() => (setFrom(1), setTo(n))}
          accessibilityRole="button"
          style={{ minHeight: 36, justifyContent: 'center' }}
        >
          <Txt size={14} weight={700} color={c.goldStrong}>
            {HIF.lsQuickSurah()}
          </Txt>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <SecondaryButton label={HIF.remove()} onPress={() => apply(false)} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton label={HIF.add()} onPress={() => apply(true)} />
        </View>
      </View>
    </Sheet>
  );
}

function SurahList({ bits, onSet }: Omit<Props, 'quick'>) {
  const { c } = useTheme();
  const h = useHome();
  const acc = useAccent();
  const U = plan.units();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(-1); // the surah whose ayat are being chosen
  const query = q.trim().toLowerCase();
  // Arabic runs right to left: typed Arabic (or an empty field in the Arabic interface) sits on the right
  const rtl = ARABIC.test(q) || (!q && !isEnglish);

  const list = SURAHS.map((sr, i) => ({ sr, i })).filter(({ sr, i }) => !query || String(i + 1) === query || String(sr.name).includes(query) || (sr.latin || '').toLowerCase().includes(query));

  return (
    <View style={{ gap: 10 }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={HIF.searchSurah()}
        placeholderTextColor={c.meta}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        style={[styles.search, { backgroundColor: h.well, color: c.ink }, rtl && styles.searchRtl]}
      />
      <View style={[styles.group, { backgroundColor: h.card, borderColor: h.cardLine }]}>
        {list.map(({ sr, i }, k) => {
          const a: number = U.surahStart[i];
          const n: number = U.surahStart[i + 1] - a;
          const have = count(bits, a, a + n);
          const st = stateOf(have, n);
          return (
            <Pressable
              key={i}
              onPress={() => onSet(a, a + n, have !== n)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: st === 2 }}
              style={[styles.srow, k < list.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }]}
            >
              <Check st={st} />
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={16} weight={700} color={c.ink}>
                  {i + 1}. {surahName(sr)}
                </Txt>
                <Txt size={13} color={c.meta}>
                  {st === 1 ? `${num(have)}/${num(n)}` : unitCount('ayah', n)}
                </Txt>
                {st === 1 && (
                  <View style={[styles.prog, { backgroundColor: alpha(acc.mark, 0.25) }]}>
                    <View style={{ flex: have, backgroundColor: acc.mark, borderRadius: 2 }} />
                    <View style={{ flex: n - have }} />
                  </View>
                )}
              </View>
              <Pressable onPress={() => setOpen(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${surahName(sr)} · ${HIF.ayatShort()}`} style={[styles.ayatBtn, { backgroundColor: acc.fill }]}>
                <Txt size={13.5} weight={700} color={acc.ink}>
                  {HIF.ayatShort()}
                </Txt>
              </Pressable>
            </Pressable>
          );
        })}
      </View>
      {open >= 0 && (
        <RangeSheet key={open} title={surahName(SURAHS[open])} n={U.surahStart[open + 1] - U.surahStart[open]} a={U.surahStart[open]} bits={bits} onSet={onSet} onClose={() => setOpen(-1)} />
      )}
    </View>
  );
}

function JuzList({ bits, onSet }: Omit<Props, 'quick'>) {
  const { c } = useTheme();
  const h = useHome();
  const acc = useAccent();
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
  const cellColor = (s: St) => (s === 2 ? h.forest : s === 1 ? acc.fill : h.well);

  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: 30 }, (_, j) => {
        const cells = Array.from({ length: 16 }, (_, k) => 16 * j + k);
        const n = cells.filter((u) => st[u] === 2).length;
        const isOpen = open === j;
        return (
          <View key={j} style={[styles.row, { backgroundColor: h.card, borderColor: h.cardLine }]}>
            <View style={styles.rowHead}>
              <Pressable onPress={() => span(th.start[16 * j], end(16 * j + 15))} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${HIF.juzWord()} ${j + 1}`}>
                <Check st={n === 16 ? 2 : cells.some((u) => st[u]) ? 1 : 0} />
              </Pressable>
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
              [0, 1].map((half) => {
                const a = 16 * j + 8 * half;
                return (
                  <View key={half} style={styles.hizb}>
                    <Pressable onPress={() => span(th.start[a], end(a + 7))} accessibilityRole="button" style={[styles.hizbBtn, { borderColor: c.chosenLine }]}>
                      <Txt size={13.5} weight={700} color={c.ink}>
                        {HIF.hizbWord()} {num(2 * j + half + 1)}
                      </Txt>
                    </Pressable>
                    <View style={styles.cells}>
                      {cells.slice(8 * half, 8 * half + 8).map((u) => (
                        <Pressable
                          key={u}
                          onPress={() => span(th.start[u], end(u))}
                          accessibilityRole="button"
                          accessibilityState={{ checked: st[u] === 2 }}
                          style={[styles.cell, { backgroundColor: cellColor(st[u]), borderColor: st[u] === 2 ? h.forest : st[u] === 1 ? acc.mark : c.chosenLine }]}
                        >
                          <Txt size={13} weight={700} color={st[u] === 2 ? h.forestInk : c.ink}>
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
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  some: { width: 10, height: 3, borderRadius: 2 },
  tabs: { flexDirection: 'row', borderRadius: 18, padding: 4, gap: 4 },
  tab: { flex: 1, minHeight: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  search: { minHeight: 48, borderRadius: 16, paddingHorizontal: 16, fontSize: 15 },
  searchRtl: { textAlign: 'right', writingDirection: 'rtl' },
  group: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  srow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 64 },
  prog: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' },
  ayatBtn: { minHeight: 34, paddingHorizontal: 14, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  row: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowMain: { flex: 1, minHeight: 36, justifyContent: 'center' },
  step: { minWidth: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stepWide: { minWidth: 46, borderRadius: 14, paddingHorizontal: 6 },
  numPair: { gap: 10 },
  numCard: { borderRadius: 20, padding: 14, gap: 8 },
  numRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  numInput: { flex: 1, minWidth: 56, padding: 0, textAlign: 'center', fontSize: 26, fontWeight: '800', minHeight: 44 },
  stripWrap: { height: 14, justifyContent: 'center' },
  stripRow: { flexDirection: 'row', gap: 2, height: 10 },
  stripBar: { flex: 1, borderRadius: 3 },
  stripSel: { ...StyleSheet.absoluteFill as object, flexDirection: 'row' },
  stripMark: { borderWidth: 2, borderRadius: 6 },
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sumPill: { minHeight: 34, paddingHorizontal: 14, borderRadius: 17, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  strip: { flex: 1, flexDirection: 'row', gap: 2, height: 8 },
  stripCell: { flex: 1, borderRadius: 2 },
  hizb: { gap: 8, paddingTop: 4 },
  hizbBtn: { alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sum: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  quick: { flexDirection: 'row', gap: 8 },
});
