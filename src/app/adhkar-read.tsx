// Reading adhkar one card at a time (a group: ?g=…, a chapter: ?c=…, or a whole category: ?k=…, every
// chapter of it one after the other, each card with its chapter's name on top): one full card on the screen;
// a swipe brings the next one (towards the reading side: from the right in English and French, from
// the left in Arabic) or the one before. A thin bar shows how far; at the bottom a big round counter -
// a tap counts once, and when the dhikr has been said its number of times the next card comes by
// itself. After the last: «may Allah accept from you», start again or go back.
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { categoryTone, chapterTone, tone, type Tone } from '@/components/AdhkarArt';
import { AdhkarScene, sceneGround } from '@/components/AdhkarScene';
import { CategoryPainting, isNightPainting } from '@/components/CategoryPaintings';
import { DhikrBody, ListenButton } from '@/components/DhikrParts';
import { Note, ReadLangButton } from '@/components/HadithParts';
import { CheckIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Txt } from '@/components/Txt';
import { ADHKAR } from '@/i18n/adhkar';
import { isEnglish } from '@/i18n/i18n';
import { categories, categoryOf, chapterTitle, loadChapter, loadIndex, loadRefs, repeatOf, useAdhkarStore, type Dhikr, type Ref } from '@/lib/adhkar';
import { stopAudio } from '@/lib/adhkarAudio';
import { useReadLang } from '@/lib/hadith';
import { useTheme } from '@/theme/theme';

type Item = Dhikr & Ref & { title?: string };

// a card behind the top one, `k` places back (in between while the top one moves): turned a little -
// one one way, the next the other, as cards in a hand - so the deck shows at its corners
const peek = (k: number) => {
  'worklet';
  return { transform: [{ translateY: 6 * k }, { rotate: `${k * 3.2}deg` }, { scale: 1 - 0.03 * k }], opacity: 1 - 0.22 * k };
};
const peekOther = (k: number) => {
  'worklet';
  return { transform: [{ translateY: 6 * k }, { rotate: `${-k * 2.4}deg` }, { scale: 1 - 0.03 * k }], opacity: 1 - 0.22 * k };
};

// the counter's ring
const RING = 96;
const R = RING / 2 - 5;
const CIRC = 2 * Math.PI * R;

export default function AdhkarRead() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ g?: string; c?: string; k?: string }>();
  const lang = useReadLang();
  const { groups, liked } = useAdhkarStore();
  // the cards as they were when opened (the store read once)
  const [refs] = useState<Ref[] | null>(() => (params.c || params.k ? null : params.g === 'liked' ? liked : (groups.find((g) => g.id === params.g)?.items ?? [])));
  const kind = groups.find((g) => g.id === params.g)?.kind;
  const morning = kind === 'morning';
  // its colour: the dawn's, the dusk's, a heart's rose, the member's green, or the chapter's own
  const tint: Tone = params.k
    ? params.k === 'daily'
      ? 'gold'
      : categoryTone(params.k)
    : params.c
    ? Number(params.c) === 27
      ? 'gold'
      : chapterTone(Number(params.c))
    : params.g === 'liked'
      ? 'rose'
      : kind === 'morning'
        ? 'gold'
        : kind === 'evening'
          ? 'indigo'
          : 'green';
  const t = tone(tint, isDark);
  // a chapter (not the morning and evening one): its own painting, its sky's colour
  // (a whole category: its own painting)
  const painting = params.k ? (params.k === 'daily' ? null : params.k) : params.c && Number(params.c) !== 27 ? categoryOf(Number(params.c)) : null;
  const chapterPainting = !!painting;
  const dusk = painting ? isNightPainting(painting) : kind === 'evening' || (kind !== 'morning' && isDark);
  const headInk = dusk ? '#f4efff' : '#4a3414';
  const [items, setItems] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [at, setAt] = useState(0);
  const [counts, setCounts] = useState<number[]>([]);
  const [page, setPage] = useState({ w: 0, h: 0 });
  const dx = useSharedValue(0); // the top card's sideways move (with the finger, or thrown off / back)

  useEffect(() => {
    const ch = Number(params.c);
    const load = refs
      ? loadRefs(refs)
      : params.k
        ? // a whole category: its chapters in order, each dhikr with its chapter's name
          loadIndex().then(async (index) => {
            const cat = categories(index).find((x) => x.key === params.k);
            const lists = await Promise.all((cat?.chapters ?? []).map((chap) => loadChapter(chap.id).then((l) => l.map((d) => ({ ...d, c: chap.id, title: chapterTitle(chap) })))));
            return lists.flat();
          })
        : loadChapter(ch).then((l) => l.map((d) => ({ ...d, c: ch })));
    load
      .then((l) => {
        setItems(l);
        setCounts(l.map(() => 0));
      })
      .catch(() => setFailed(true));
  }, [refs, params.c, params.k]);

  // the recording stops on another card, and when the page is left
  useEffect(() => stopAudio(), [at]);
  useEffect(() => stopAudio, []);

  const last = items ? items.length : 0; // the «done» card's place, after the adhkar

  // The deck: the card on top, and the next two peeking out behind it, a little smaller and lower.
  // A swipe throws the top card off to its side (tilting as it goes) while the ones behind move up; the
  // card before comes back from the side it was thrown to.
  const throwTo = (i: number, side: number) => {
    if (i < 0 || i > last || i === at) {
      dx.set(withTiming(0, { duration: 180 }));
      return;
    }
    if (i > at) {
      dx.set(
        withTiming(side * width * 1.3, { duration: 220 }, () => {
          scheduleOnRN(arrive, i);
        }),
      );
    } else {
      setAt(i);
      dx.set(side * width * 1.3);
      dx.set(withTiming(0, { duration: 240 }));
    }
  };
  const arrive = (i: number) => {
    setAt(i);
    dx.set(0);
  };
  // forward: thrown towards the reading side's start (to the left in English, the right in Arabic)
  const ahead = isEnglish ? -1 : 1;
  const go = (i: number) => throwTo(i, i < at ? -ahead : ahead);

  const swipe = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-14, 14],
    failOffsetY: [-14, 14],
    onUpdate: (e) => dx.set(e.translationX),
    onDeactivate: (e) => {
      const far = Math.abs(e.translationX) > width * 0.2 || Math.abs(e.velocityX) > 650;
      if (!far) return throwTo(at, 0);
      const side = e.translationX < 0 ? -1 : 1;
      throwTo(side === ahead ? at + 1 : at - 1, side);
    },
  });
  const top = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.get() }, { translateY: Math.abs(dx.get()) * 0.04 }, { rotate: `${(dx.get() / width) * 9}deg` }],
  }));
  // how far the top card has gone (0 to 1): the cards behind move up as much
  const behind1 = useAnimatedStyle(() => peek(1 - Math.min(1, Math.abs(dx.get()) / (width * 0.6))));
  const behind2 = useAnimatedStyle(() => peekOther(2 - Math.min(1, Math.abs(dx.get()) / (width * 0.6))));

  const tap = () => {
    if (!items || at >= last) return;
    const total = repeatOf(items[at]);
    const n = Math.min(total, (counts[at] ?? 0) + 1);
    setCounts((cs) => cs.map((x, i) => (i === at ? n : x)));
    if (n >= total) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => go(at + 1), 300);
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const restart = () => {
    setCounts((cs) => cs.map(() => 0));
    go(0);
  };

  const done = items ? at >= last : false;
  const item = items && !done ? items[at] : null;

  return (
    // the page's own colour is the ground's, so nothing white can ever show under the picture
    <View style={{ flex: 1, backgroundColor: sceneGround(dusk) }} onLayout={(e) => setPage({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* the page painted: the dawn for the morning adhkar, the dusk for the evening ones (and for the
          others, the dawn by day and the dusk at night) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* the picture as big as the page itself (the window's height can leave out the phone's bottom bar) */}
        {chapterPainting ? (
          <CategoryPainting name={painting as string} width={page.w || width} height={page.h || height} mirrored={!isEnglish} tall />
        ) : (
          <AdhkarScene evening={dusk} width={page.w || width} height={page.h || height} mirrored={!isEnglish} tall />
        )}
        {/* a light veil, so the cards stay the eye's place */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: dusk ? 'rgba(20, 20, 40, 0.18)' : 'rgba(255, 252, 245, 0.22)' }]} />
      </View>
      <StatusBar style={dusk ? 'light' : 'dark'} />
      <ScreenHeader title={items && !done ? `${at + 1} / ${last}` : ''} ink={headInk} end={<ReadLangButton ink={headInk} />} />
      {failed ? (
        <Note text={ADHKAR.offline()} />
      ) : !items ? (
        <ActivityIndicator color={c.gold} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* how far */}
          <View style={[styles.bar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={[styles.barFill, { backgroundColor: t.ink, width: `${(Math.min(at, last) / Math.max(1, last)) * 100}%` }]} />
          </View>

          <View style={styles.stage}>
            <View style={styles.deck}>
              {/* the next two, peeking out behind (their paper only) */}
              {at + 2 <= last && <Animated.View style={[styles.card, styles.under, { backgroundColor: c.card, boxShadow: `0px 6px 16px ${c.shadow}` }, behind2]} />}
              {at + 1 <= last && <Animated.View style={[styles.card, styles.under, { backgroundColor: c.card, boxShadow: `0px 6px 16px ${c.shadow}` }, behind1]} />}
              <GestureDetector gesture={swipe}>
                <Animated.View style={[styles.card, { backgroundColor: c.card, boxShadow: `0px 12px 28px ${c.shadow}` }, top]}>
                  {item ? (
                    <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                      {/* reading a whole category: which chapter this dhikr is from */}
                      {!!item.title && (
                        <View style={[styles.cardTitle, { borderBottomColor: c.divider }]}>
                          <Txt size={13} weight={700} center color={t.ink}>
                            {item.title}
                          </Txt>
                        </View>
                      )}
                      <DhikrBody d={item} lang={lang} big morning={morning} evening={kind === 'evening'} />
                    </ScrollView>
                  ) : (
                    <View style={styles.doneCard}>
                      <View style={[styles.doneMark, { backgroundColor: t.ink }]}>
                        <CheckIcon color={c.onInk} size={30} strokeWidth={2.5} />
                      </View>
                      <Txt size={22} weight={700} serif center color={c.ink} lineHeight={36}>
                        {ADHKAR.done()}
                      </Txt>
                      <Txt size={14} center color={c.meta}>
                        {ADHKAR.doneSub()}
                      </Txt>
                      <View style={styles.doneButtons}>
                        <Pressable onPress={restart} style={({ pressed }) => [styles.doneBtn, { borderColor: c.line }, pressed && { opacity: 0.6 }]}>
                          <Txt size={15} weight={600} color={c.ink}>
                            {ADHKAR.again()}
                          </Txt>
                        </Pressable>
                        <Pressable
                          onPress={() => router.back()}
                          style={({ pressed }) => [styles.doneBtn, { backgroundColor: c.on, borderColor: c.on }, pressed && { opacity: 0.8 }]}
                        >
                          <Txt size={15} weight={700} color={c.onInk}>
                            {ADHKAR.back()}
                          </Txt>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </Animated.View>
              </GestureDetector>
            </View>
          </View>

          {/* the counter, the recording beside it */}
          <View style={[styles.counterRow, { paddingBottom: insets.bottom + 18 }]}>
            {item && (
              <>
                <View style={[styles.listenAt, isEnglish ? { right: 26 } : { left: 26 }]}>
                  <View style={[styles.listenRound, { backgroundColor: c.card, boxShadow: `0px 6px 16px ${c.shadow}` }]}>
                    <ListenButton audio={item.audio} size={46} tint={t.ink} />
                  </View>
                </View>
                <Pressable onPress={tap} style={({ pressed }) => [styles.counter, { backgroundColor: c.card, boxShadow: `0px 8px 22px ${c.shadow}` }, pressed && { transform: [{ scale: 0.95 }] }]}>
                  {/* a ring that fills as it is counted */}
                  <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
                    <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={t.wash} strokeWidth={6} fill="none" />
                    <Circle
                      cx={RING / 2}
                      cy={RING / 2}
                      r={R}
                      stroke={t.ink}
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${CIRC} ${CIRC}`}
                      strokeDashoffset={CIRC * (1 - (counts[at] ?? 0) / repeatOf(item))}
                      transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
                    />
                  </Svg>
                  <Txt size={26} weight={700} color={t.ink}>
                    {counts[at] ?? 0}
                  </Txt>
                  <Txt size={12} weight={600} color={t.ink} style={{ opacity: 0.7 }}>
                    {`/ ${repeatOf(item)}`}
                  </Txt>
                </Pressable>
                <Txt size={12.5} weight={600} color={headInk}>
                  {ADHKAR.tapToCount()}
                </Txt>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { alignSelf: 'center', paddingBottom: 8, marginBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10 },
  bar: { height: 3, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 18, paddingBottom: 34 },
  // the deck: a little narrower than the screen, not too tall
  deck: { width: '84%', flex: 1, maxHeight: 440 },
  card: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, overflow: 'hidden' },
  under: {},
  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 8 },
  doneMark: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  doneButtons: { flexDirection: 'row', gap: 10, marginTop: 18 },
  doneBtn: { paddingHorizontal: 20, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  listenAt: { position: 'absolute', top: 30 },
  listenRound: { borderRadius: 30, padding: 4, flexDirection: 'row' },
  counterRow: { alignItems: 'center', gap: 8, paddingTop: 6, minHeight: 132 },
  counter: { width: RING, height: RING, borderRadius: RING / 2, alignItems: 'center', justifyContent: 'center' },
});
