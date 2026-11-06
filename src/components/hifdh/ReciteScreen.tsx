// «Recite» (تسميع), as Murajaa's Tasmee: the mushaf page with its ayat hidden. Three buttons under the page:
//   play   shows the next ayah (the whole of it)
//   bulb  shows one more word of it
//   eye   hides everything again, on every page; a second tap shows everything, on every page
// A tap on an ayah of the page starts again from that ayah (the ones before it are shown). Any page of the Quran
// can be recited: it is the page on screen. The logic is src/lib/hifdh/recite.js; the cover is PageCurl's `veils`.
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Glass, GlassBackdrop } from '@/components/Glass';
import { BackIcon } from '@/components/icons';
import { PageCurl } from '@/components/PageCurl';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, surahName } from '@/i18n/i18n';
import { displayKeys } from '@/lib/ayahmap';
import { ayatOn, pageOf } from '@/lib/boxes';
import { PAGE_SHAPE } from '@/lib/crop';
import { keyOf } from '@/lib/hifdh';
import { loadInk } from '@/lib/hifdh/ink';
import { parse } from '@/lib/hifdh/listen';
import { begin, jumpTo, keysOfSegs, showAyah, showWord, veilFor, wordsOf } from '@/lib/hifdh/recite';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { readJSON } from '@/lib/storage';
import { QuranTheme, useTheme } from '@/theme/theme';

const BAR_H = 72; // the bar under the page
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

// the page last read, where Recite opens when there is no plan
const savedPage = () => {
  const n = Number(readJSON('lastPage', 1));
  return Number.isFinite(n) && n >= 1 && n <= TOTAL_PAGES ? n : 1;
};

function Round({ children, onPress, label, disabled, big, fill }: { children: React.ReactNode; onPress: () => void; label: string; disabled?: boolean; big?: boolean; fill?: string }) {
  const { c } = useTheme();
  const size = big ? 56 : 46;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: fill ?? c.soft, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export function ReciteScreen({ segs, onBack }: { segs: number[][] | null; onBack: () => void }) {
  return (
    <QuranTheme>
      <Recite segs={segs} onBack={onBack} />
    </QuranTheme>
  );
}

function Recite({ segs, onBack }: { segs: number[][] | null; onBack: () => void }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Any page of the Quran can be recited: what is recited is the page on screen. It opens on the first page of
  // today's portion if there is one (else the page last read); turning the page starts that page afresh.
  const firstPage = useMemo(() => {
    const fromPlan = segs?.length ? keysOfSegs(segs, keyOf, displayKeys) : [];
    return (fromPlan.length ? pageOf(...(parse(fromPlan[0]) as [number, number])) : null) ?? savedPage();
  }, [segs]);

  const [page, setPage] = useState(firstPage);
  const keys = useMemo(() => keysOfPage(page), [page]);
  const [st, setSt] = useState(() => begin(keys));
  // the session of the page on screen: a page just turned to starts afresh at once, not a frame later
  const sess = st.keys === keys ? st : begin(keys);
  const [override, setOverride] = useState<'hide' | 'show' | null>(null); // the eye: for the whole Quran, kept across pages
  const [words, setWords] = useState<Map<string, string[]>>(new Map()); // kept for the pages seen, and the ones beside
  const [failed, setFailed] = useState(false);
  const [inkTick, setInkTick] = useState(0); // a page's picture is read (see `veils`)
  const load: 'loading' | 'ready' | 'failed' = failed ? 'failed' : keys.every((k) => words.has(k)) ? 'ready' : 'loading';

  // the text of this page and the pages beside it, ready before the page is turned to
  useEffect(() => {
    let live = true;
    const want = [...new Set(around(page).flatMap(keysOfPage))];
    Promise.all(want.map(wordsOf))
      .then((lists) => live && setWords((prev) => new Map([...prev, ...want.map((k, i) => [k, lists[i]] as [string, string[]])])))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [page]);
  // and their pictures, where the number circles and the words' real edges are read from
  useEffect(() => {
    let live = true;
    (async () => {
      for (const p of around(page)) if ((await loadInk(p)) && live) setInkTick((t) => t + 1);
    })();
    return () => {
      live = false;
    };
  }, [page]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (onBack(), true));
    return () => sub.remove();
  }, [onBack]);
  useEffect(() => {
    const ahead = [page + 1, page + 2, page - 1].filter((n) => n >= 1 && n <= TOTAL_PAGES).map(pageUrl);
    Image.prefetch(ahead, 'disk').catch(() => {});
  }, [page]);

  const count = useCallback((key: string) => Math.max(1, words.get(key)?.length ?? 1), [words]);
  const n = keys.length;

  // play, bulb and a tap on an ayah go back to revealing one by one (they leave the eye's hide-all / show-all)
  const reveal = (next: typeof st) => {
    setOverride(null);
    setSt(next);
  };
  const play = () => reveal(sess.finished ? begin(keys) : showAyah(sess));
  const bulb = () => reveal(showWord(sess, count));
  const eye = () => setOverride(override === 'hide' ? 'show' : 'hide');
  const tapAyah = (su: number, a: number) => reveal(jumpTo(sess, `${su}:${a}`));

  // the room for the page, as the Quran screen's
  const top = insets.top + 96;
  const bottom = insets.bottom + BAR_H + 22;
  const roomH = height - top - bottom;
  const pageW = Math.min(width - 10, (roomH - 12) * PAGE_SHAPE);
  const pageH = pageW / PAGE_SHAPE;
  const nameTop = Math.min(insets.top + 10 + 32, top + (roomH - pageH) / 2 - 44 - 6);

  // The cover of this page and of the two beside it, so a page turned to is covered from its first frame.
  // `inkTick` only forces a redraw once a page's picture is read (the number circles are then placed exactly).
  const veils = useMemo(() => {
    if (load === 'failed') return undefined;
    const covers: Record<number, ReturnType<typeof veilFor>> = {};
    for (const p of around(page)) {
      covers[p] = veilFor(p, p === page ? sess : begin(keysOfPage(p)), words, override);
    }
    return covers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, page, sess, words, override, inkTick]);
  const first = (ayatOn(page) as { s: number }[])[0];
  const where = first ? surahName(SURAHS[first.s - 1]) : '';
  const shownCount = sess.finished ? n : Math.min(sess.i + 1, n);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen, overflow: 'hidden' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GlassBackdrop
        glass={
          <>
            <View style={[styles.top, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
              <Pressable onPress={onBack} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel={HIF.close()}>
                <BackIcon color={c.ink} rtl={!isEnglish} />
              </Pressable>
            </View>
            <View style={[styles.name, { top: nameTop, height: 44 }]} pointerEvents="box-none">
              <View style={styles.where}>
                <Txt size={18} weight={700} center color={c.ink} numberOfLines={1}>
                  {where}
                </Txt>
                <Txt size={13} center color={c.meta}>
                  {HIF.lsPageN(page)}
                </Txt>
              </View>
            </View>

            {/* eye · counter · bulb · play, always in this order (as Murajaa) */}
            <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: insets.bottom + 14 }]}>
              <Glass acrylic style={[styles.bar, { width: Math.min(width - 24, 460) }]}>
                <View style={styles.barRow}>
                  <Round onPress={eye} label={override === 'hide' ? HIF.reciteShowAll() : HIF.reciteHideAll()}>
                    {override === 'hide' ? <EyeOpen color={c.ink} /> : <EyeClosed color={c.ink} />}
                  </Round>
                  <View style={[styles.counter, { backgroundColor: c.soft }]}>
                    <View style={[styles.fill, { width: `${n ? (Math.min(sess.i, n) / n) * 100 : 0}%`, backgroundColor: c.line }]} />
                    {load === 'loading' ? (
                      <ActivityIndicator color={c.meta} size="small" />
                    ) : (
                      <Txt size={16} weight={700} color={load === 'failed' ? '#b3402e' : c.ink} numberOfLines={1}>
                        {load === 'failed' ? HIF.reciteFailed() : `${shownCount} / ${n}`}
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
            marks={[]}
            veils={veils}
            pins={[]}
            onAyah={tapAyah}
            onPin={() => {}}
            onEmptyTap={() => {}}
            onZoomed={() => {}}
          />
        </View>
      </GlassBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4, zIndex: 5 },
  back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  name: { position: 'absolute', left: 100, right: 100, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  where: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10 },
  bar: { height: BAR_H, borderRadius: BAR_H / 2 },
  barRow: { alignSelf: 'stretch', height: BAR_H, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, direction: 'ltr' },
  round: { alignItems: 'center', justifyContent: 'center' },
  counter: { flex: 1, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
});