// HOME, reading: the Quran card as it was in the earlier design (a thin inset frame, a small «Reading» chip, the surah's name
// in Amiri, the page and juz under it, the khatma as one ring, and a long button with an arrow that opens the Quran at the
// marker), now on white. The ring is in forest on a pale track; the button is white with a thin green edge.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Panel } from '@/components/home/Panel';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { isEnglish, isFrench, LANG } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');

// the surah(s) on the page, with «Surah» before the name, in the reader's language
function surahLine(page: number): string {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => (isEnglish || isFrench ? SURAHS[n - 1].latin : SURAHS[n - 1].name));
  return HOME.surah(names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – '));
}

// an arrow that points to the end of the line (left in Arabic)
function Arrow({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={LANG === 'ar' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
    </Svg>
  );
}

export function ReadingCard() {
  const k = useSkin();
  const r = readingView();
  const where = placeOf(r.page);
  // the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  const ring = (
    <Ring key="ring" value={r.percent / 100} size={54} color={k.fill} track={k.pageBead} a11y={`${r.percent}%`}>
      <Txt size={12} weight={700} color={k.ink}>
        {`${digits(r.percent)}%`}
      </Txt>
    </Ring>
  );
  const words = (
    <View key="words" style={styles.words}>
      <Txt {...T.big} size={21} lineHeight={28} color={k.ink} numberOfLines={1}>
        {surahLine(r.page)}
      </Txt>
      <Txt {...T.small} color={k.meta} numberOfLines={1}>
        {sub}
      </Txt>
    </View>
  );

  return (
    <Panel style={styles.card}>
      <View pointerEvents="none" style={[styles.frame, { borderColor: k.hairline }]} />
      <View style={[styles.chip, { backgroundColor: k.track }]}>
        <Txt {...T.smallBold} color={k.meta}>
          {DASH.reading()}
        </Txt>
      </View>
      {/* the ring is always at the left edge of the screen in Arabic (the line begins at the right), at the right edge otherwise */}
      <View style={styles.top}>{LANG === 'ar' ? [ring, words] : [words, ring]}</View>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        style={({ pressed }) => [styles.btn, { backgroundColor: k.pageButton, borderColor: k.pageLine }, pressed && { opacity: 0.88 }]}
      >
        <Txt {...T.button} color={k.buttonInk}>
          {r.started ? DASH.continueReading() : DASH.startReading()}
        </Txt>
        <View style={[styles.go, { backgroundColor: k.goBg }]}>
          <Arrow color={k.goInk} />
        </View>
      </Pressable>
    </Panel>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderCurve: 'continuous', padding: space.cozy, gap: space.sm, overflow: 'hidden' },
  frame: { position: 'absolute', top: 6, bottom: 6, start: 6, end: 6, borderRadius: 19, borderWidth: 1 },
  chip: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: space.sm, paddingVertical: 3 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 2 },
  btn: { height: 42, borderRadius: 21, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: space.md, paddingEnd: 5 },
  go: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
