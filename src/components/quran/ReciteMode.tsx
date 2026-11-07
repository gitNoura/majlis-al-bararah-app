// RECITE mode of the Quran page (تسميع, as Murajaa's Tasmee): the same mushaf page with its ayat covered, and under it
// one bar:  eye · counter · hint · show
//   show   shows the next ayah (the whole of it); once the page is finished it starts the page again
//   hint   shows one more word of the ayah being worked on
//   eye    hides everything again, on every page; a second press shows everything, on every page
//   a tap on an ayah starts again from that ayah (the ones before it are shown)
// Any page can be recited: it is the page on screen, and turning the page starts that page afresh. The logic is
// src/lib/hifdh/recite.js; the cover is PageCurl's `veils`; the words' real edges are read from the page picture (ink.ts).
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { ayatOn } from '@/lib/boxes';
import { loadInk } from '@/lib/hifdh/ink';
import { begin, jumpTo, showAyah, showWord, veilFor, wordsOf } from '@/lib/hifdh/recite';
import { TOTAL_PAGES } from '@/lib/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const RECITE_BAR_H = 64;
const ICON = { fill: 'none', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const EyeClosed = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M3 10c2.5 4 6 6 9 6s6.5-2 9-6M12 16v3M6.3 14.2l-1.8 2.4M17.7 14.2l1.8 2.4" stroke={color} {...ICON} />
  </Svg>
);
const EyeOpen = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke={color} {...ICON} />
    <Circle cx={12} cy={12} r={3} stroke={color} {...ICON} />
  </Svg>
);
const Bulb = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z" stroke={color} {...ICON} />
  </Svg>
);
const Next = ({ color }: { color: string }) => (
  <Svg width={26} height={26} viewBox="0 0 24 24">
    <Path d="M9 5l7 7-7 7" stroke={color} {...ICON} strokeWidth={2.4} />
  </Svg>
);
const Again = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke={color} {...ICON} />
  </Svg>
);

const keysOfPage = (p: number) => (ayatOn(p) as { s: number; a: number }[]).map((e) => `${e.s}:${e.a}`);
// the page and the two beside it: what is made ready before it is turned to
const around = (p: number) => [p, p + 1, p - 1].filter((n) => n >= 1 && n <= TOTAL_PAGES);

export function useRecite(active: boolean, page: number) {
  const { c } = useTheme();
  const keys = useMemo(() => keysOfPage(page), [page]);
  const [st, setSt] = useState(() => begin(keys));
  // the session of the page on screen: a page just turned to starts afresh at once, not a frame later
  const sess = st.keys === keys ? st : begin(keys);
  const [override, setOverride] = useState<'hide' | 'show' | null>(null); // the eye: for the whole Quran, kept across pages
  const [words, setWords] = useState<Map<string, string[]>>(new Map());
  const [failed, setFailed] = useState(false);
  const [inkTick, setInkTick] = useState(0); // a page's picture is read (see `veils`)
  const load: 'loading' | 'ready' | 'failed' = failed ? 'failed' : keys.every((k) => words.has(k)) ? 'ready' : 'loading';

  // the text of this page and the pages beside it, ready before the page is turned to
  useEffect(() => {
    if (!active) return;
    let live = true;
    const want = [...new Set(around(page).flatMap(keysOfPage))];
    Promise.all(want.map(wordsOf))
      .then((lists) => live && setWords((prev) => new Map([...prev, ...want.map((k, i) => [k, lists[i]] as [string, string[]])])))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [active, page]);
  // and their pictures, where the number circles and the words' real edges are read from
  useEffect(() => {
    if (!active) return;
    let live = true;
    (async () => {
      for (const p of around(page)) if ((await loadInk(p)) && live) setInkTick((t) => t + 1);
    })();
    return () => {
      live = false;
    };
  }, [active, page]);
  // «start at this ayah» (from a Hifdh task): the ayat of the page before it are shown, it and the rest covered
  const [pending, setPending] = useState<string | null>(null);
  // a fresh start each time the mode is entered (state adjusted while rendering, not in an effect)
  const [was, setWas] = useState(active);
  if (active !== was) {
    setWas(active);
    if (active) {
      setOverride(null);
      setSt(begin(keys));
    }
  }
  if (active && pending && keys.includes(pending)) {
    setPending(null);
    setOverride(null);
    setSt(jumpTo(begin(keys), pending));
  }

  const count = useCallback((key: string) => Math.max(1, words.get(key)?.length ?? 1), [words]);
  const n = keys.length;

  // show, hint and a tap on an ayah go back to revealing one by one (they leave the eye's hide-all / show-all)
  const reveal = (next: typeof st) => {
    setOverride(null);
    setSt(next);
  };
  const play = () => reveal(sess.finished ? begin(keys) : showAyah(sess));
  const bulb = () => reveal(showWord(sess, count));
  const eye = () => setOverride(override === 'hide' ? 'show' : 'hide');
  const tap = (su: number, a: number) => reveal(jumpTo(sess, `${su}:${a}`));

  // the cover of this page and of the two beside it, so a page turned to is covered from its first frame
  const veils = useMemo(() => {
    if (!active || load === 'failed') return undefined;
    const covers: Record<number, ReturnType<typeof veilFor>> = {};
    for (const p of around(page)) covers[p] = veilFor(p, p === page ? sess : begin(keysOfPage(p)), words, override);
    return covers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, load, page, sess, words, override, inkTick]);

  const shown = sess.finished ? n : Math.min(sess.i + 1, n);
  const bar = (
    <View style={styles.box}>
      <View style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}>
        <Round onPress={eye} label={override === 'hide' ? HIF.reciteShowAll() : HIF.reciteHideAll()}>
          {override === 'hide' ? <EyeOpen color={c.ink} /> : <EyeClosed color={c.ink} />}
        </Round>
        <View style={[styles.counter, { backgroundColor: c.surface2 }]}>
          <View style={[styles.fill, { width: `${n ? (Math.min(sess.i, n) / n) * 100 : 0}%`, backgroundColor: c.line }]} />
          {load === 'loading' ? (
            <ActivityIndicator color={c.meta} size="small" />
          ) : (
            <Txt size={16} weight={700} color={load === 'failed' ? '#b3402e' : c.ink} numberOfLines={1}>
              {load === 'failed' ? HIF.reciteFailed() : `${shown} / ${n}`}
            </Txt>
          )}
        </View>
        <Round onPress={bulb} label={HIF.reciteHint()} disabled={load !== 'ready' || sess.finished}>
          <Bulb color="#d99a1f" />
        </Round>
        <Round onPress={play} label={sess.finished ? HIF.reciteAgain() : HIF.reciteReveal()} big fill={c.on} disabled={load === 'loading'}>
          {sess.finished ? <Again color={c.onInk} /> : <Next color={c.onInk} />}
        </Round>
      </View>
    </View>
  );

  return { bar, veils, tap, startAt: setPending };
}

function Round({ children, onPress, label, disabled, big, fill }: { children: ReactNode; onPress: () => void; label: string; disabled?: boolean; big?: boolean; fill?: string }) {
  const { c } = useTheme();
  const size = big ? 48 : 40;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: fill ?? c.surface2, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  // the buttons keep the same left-to-right order in every language (as Murajaa)
  row: { alignSelf: 'stretch', maxWidth: 460, height: RECITE_BAR_H - space.sm * 2 + 8, borderRadius: 32, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.sm, flexDirection: 'row', alignItems: 'center', gap: 8, direction: 'ltr', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  round: { alignItems: 'center', justifyContent: 'center' },
  counter: { flex: 1, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
});
