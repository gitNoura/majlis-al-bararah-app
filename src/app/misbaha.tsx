// The misbaha: choose the words (on two lines, read from the right in every language, as Arabic) (subhan Allah, al-hamdu lillah, Allahu akbar, la ilaha illa Allah,
// astaghfiru Allah, the prayer on the Prophet ﷺ), and count them on a drawn misbaha - its beads on a
// loop, the separator bead and the tassel at the bottom. Each tap moves one bead across the gap, with a
// light touch; the round's end (33 or 100, or none) a stronger one, and the rounds go up. The words, the
// target, the count and today's total are kept (src/lib/misbaha.ts).
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/Stars';
import { CategoryPainting } from '@/components/CategoryPaintings';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Txt } from '@/components/Txt';
import { MISBAHA } from '@/i18n/misbaha';
import { isEnglish, isFrench } from '@/i18n/i18n';
import { chooseTarget, chooseWord, count, reset, TARGETS, useMisbaha, WORDS } from '@/lib/misbaha';
import { serif } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

// a row read from the right (the Arabic words), whatever the language: the phone's own direction; in
// the browser preview, whose page is left to right in English, the row turned round
const rtlRow = () => (Platform.OS === 'web' ? ({ flexDirection: isEnglish ? 'row-reverse' : 'row' } as const) : ({ flexDirection: 'row', direction: 'rtl' } as const));

const BEADS = 33;
const STEP = 8.4; // degrees between two beads
const GAP = 46; // the gap the counted bead crosses
const START = 196; // the first bead, just past the separator bead at the bottom (180°)
const BEAD = 15;

// a bead's place on the loop: before it is counted on one side of the gap, after on the other
function Bead({ i, k, r, cx, cy, color }: { i: number; k: SharedValue<number>; r: number; cx: number; cy: number; color: string }) {
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, k.get() - i));
    const deg = START + i * STEP + GAP * (1 - t);
    const a = (deg * Math.PI) / 180;
    return { transform: [{ translateX: cx + r * Math.sin(a) - BEAD / 2 }, { translateY: cy - r * Math.cos(a) - BEAD / 2 }] };
  });
  return (
    <Animated.View style={[styles.bead, { backgroundColor: color }, style]}>
      <View style={styles.beadShine} />
    </Animated.View>
  );
}

export default function Misbaha() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const m = useMisbaha();
  const word = WORDS.find((w) => w.id === m.word) ?? WORDS[0];
  const [page, setPage] = useState({ w: 0, h: 0 });

  // the misbaha's size, and its beads' loop
  const size = Math.min(width - 48, 300);
  const r = size / 2 - BEAD;
  const k = useSharedValue(m.count % BEADS);
  const pop = useSharedValue(1);

  // the beads follow the count (back round at once after a whole round)
  useEffect(() => {
    const target = m.count % BEADS;
    k.set(target < k.get() - 0.5 ? withTiming(target, { duration: 420, easing: Easing.out(Easing.quad) }) : withTiming(target, { duration: 170 }));
  }, [m.count, k]);

  const tap = () => {
    const done = count();
    pop.set(1.12);
    pop.set(withSpring(1, { damping: 12 }));
    if (done) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.selectionAsync().catch(() => {});
  };
  const number = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  const ink = '#4a3414';
  const wordName = (w: (typeof WORDS)[number]) => (isFrench ? w.fr : isEnglish ? w.en : w.ar);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }} onLayout={(e) => setPage({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <ScreenBackground />
      {/* the page: the remembrance painting at its bottom, its sky above */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CategoryPainting name="dhikr" width={page.w || width} height={page.h || height} mirrored={!isEnglish} tall />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(20,20,30,0.35)' : 'rgba(255,252,245,0.35)' }]} />
      </View>
      <StatusBar style="dark" />
      <ScreenHeader title={MISBAHA.title()} ink={ink} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        {/* the words to choose */}
        <View style={[styles.words, rtlRow()]}>
          {WORDS.map((w) => {
            const on = w.id === m.word;
            return (
              <Pressable
                key={w.id}
                onPress={() => chooseWord(w.id)}
                style={({ pressed }) => [styles.word, { backgroundColor: on ? c.on : 'rgba(255,255,255,0.75)', borderColor: on ? c.on : c.line }, pressed && { opacity: 0.7 }]}
              >
                {/* each word its own piece, wrapping between words: as one text, Android measures the
                    phrase too short and cuts its last word (الله in «أستغفر الله») */}
                <View style={[styles.wordLine, rtlRow()]}>
                  {w.ar.split(' ').map((part, j) => (
                    <Txt key={j} size={14} center color={on ? c.onInk : ink} lineHeight={24} style={{ fontFamily: serif(on ? 700 : 400), paddingHorizontal: 1.5 }}>
                      {part}
                    </Txt>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* the words being said */}
        <View style={[styles.wordLine, rtlRow(), { marginTop: 14, paddingHorizontal: 20, columnGap: 8 }]}>
          {word.ar.split(' ').map((part, j) => (
            <Txt key={j} size={28} center color={ink} lineHeight={48} style={{ fontFamily: serif(700), paddingHorizontal: 2 }}>
              {part}
            </Txt>
          ))}
        </View>
        {isEnglish && (
          <Txt size={14} center color="rgba(74,52,20,0.7)">
            {wordName(word)}
          </Txt>
        )}

        {/* the misbaha: tap it */}
        <Pressable onPress={tap} accessibilityLabel={MISBAHA.tap()} style={{ width: size, height: size + 46, marginTop: 14 }}>
          {/* its cord */}
          <View style={[styles.cord, { width: r * 2, height: r * 2, borderRadius: r, left: size / 2 - r, top: size / 2 - r }]} />
          {Array.from({ length: BEADS }, (_, i) => (
            <Bead key={i} i={i} k={k} r={r} cx={size / 2} cy={size / 2} color="#7a3f22" />
          ))}
          {/* the separator bead and the tassel, at the bottom */}
          <View style={[styles.imam, { left: size / 2 - 9, top: size / 2 + r - 13 }]} />
          <View style={[styles.tasselCord, { left: size / 2 - 1, top: size / 2 + r + 11 }]} />
          <View style={[styles.tassel, { left: size / 2 - 8, top: size / 2 + r + 24 }]} />
          {/* the count in the middle */}
          <View style={[StyleSheet.absoluteFill, styles.center, { height: size }]} pointerEvents="none">
            <Animated.View style={[styles.counter, { backgroundColor: 'rgba(255,255,255,0.85)' }, number]}>
              <Txt size={44} weight={800} color={ink}>
                {m.count}
              </Txt>
              <Txt size={13} weight={600} color="rgba(74,52,20,0.65)">
                {m.target ? `/ ${m.target}` : '∞'}
              </Txt>
            </Animated.View>
          </View>
        </Pressable>

        {/* the target */}
        <View style={[styles.targets, { backgroundColor: 'rgba(255,255,255,0.75)' }]}>
          {TARGETS.map((t) => {
            const on = t === m.target;
            return (
              <Pressable key={t} onPress={() => chooseTarget(t)} style={[styles.target, on && { backgroundColor: c.on }]}>
                <Txt size={14} weight={on ? 700 : 500} center color={on ? c.onInk : ink}>
                  {t ? String(t) : MISBAHA.noLimit()}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        {/* the rounds, and today */}
        <View style={styles.stats}>
          <Txt size={13.5} weight={600} color={ink}>
            {MISBAHA.rounds(m.rounds)}
          </Txt>
          <Txt size={13.5} color="rgba(74,52,20,0.7)">
            {MISBAHA.today(m.today[m.word] ?? 0)}
          </Txt>
        </View>
        <Pressable onPress={reset} hitSlop={6} style={({ pressed }) => [styles.resetBtn, { borderColor: c.chosenLine }, pressed && { opacity: 0.6 }]}>
          <Txt size={14} weight={700} color={ink}>
            {MISBAHA.reset()}
          </Txt>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  resetBtn: { marginTop: 14, paddingHorizontal: 22, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
  words: { flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 4, alignSelf: 'stretch' },
  // three a line, each its own fixed width - not the width the phone measures for its words, which is
  // too short for Arabic with its harakat on Android (the last word fell off: «Allahu akbar»,
  // «Astaghfiru Allah») - and as tall as its words need
  word: { width: '31.5%', paddingHorizontal: 6, paddingVertical: 7, minHeight: 44, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  wordLine: { flexWrap: 'wrap', justifyContent: 'center', columnGap: 3, alignSelf: 'stretch' },
  cord: { position: 'absolute', borderWidth: 1.4, borderColor: 'rgba(122,63,34,0.45)' },
  bead: { position: 'absolute', left: 0, top: 0, width: BEAD, height: BEAD, borderRadius: BEAD / 2, boxShadow: '0px 2px 3px rgba(60,30,10,0.35)' },
  beadShine: { position: 'absolute', top: 2.5, left: 3.5, width: 4.5, height: 3.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' },
  imam: { position: 'absolute', width: 18, height: 26, borderRadius: 9, backgroundColor: '#5e2c16', boxShadow: '0px 2px 3px rgba(60,30,10,0.35)' },
  tasselCord: { position: 'absolute', width: 2, height: 14, backgroundColor: '#c9a24c' },
  tassel: { position: 'absolute', width: 16, height: 20, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#c9a24c' },
  center: { alignItems: 'center', justifyContent: 'center' },
  counter: { width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 8px 22px rgba(60,40,20,0.15)' },
  targets: { flexDirection: 'row', padding: 4, borderRadius: 16, marginTop: 10, width: 260 },
  target: { flex: 1, paddingVertical: 9, borderRadius: 12 },
  stats: { flexDirection: 'row', gap: 18, marginTop: 14 },
});
