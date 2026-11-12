// HOME, reading: the head of the sage card (SageCard), set like the prayer card's head: «Reading», the surah's name and the page, hizb
// and juz as plain words on one side, the khatma as a ring on the other, level with the name; under it «Continue reading» as one
// see-through pill. A tap anywhere on it opens the Quran at the marker.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useSage } from '@/components/home/SageCard';
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
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');

// the surah(s) on the page, with «Surah» before the name, in the reader's language
function surahLine(page: number): string {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => (isEnglish || isFrench ? SURAHS[n - 1].latin : SURAHS[n - 1].name));
  return HOME.surah(names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – '));
}

export function ReadingCard() {
  const k = useSkin();
  const sage = useSage();
  const r = readingView();
  const where = placeOf(r.page);
  // the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');
  const action = r.started ? DASH.continueReading() : DASH.startReading();

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  const ring = (
    <Ring key="ring" value={r.percent / 100} size={58} color={k.fill} track={sage.track} a11y={`${r.percent}%`}>
      <Txt size={13} weight={700} color={k.ink}>
        {`${digits(r.percent)}%`}
      </Txt>
    </Ring>
  );
  const words = (
    <View key="words" style={styles.words}>
      <Txt size={12} weight={700} color={k.meta}>
        {DASH.reading()}
      </Txt>
      <Txt size={22} weight={800} lineHeight={32} color={k.ink} numberOfLines={1}>
        {surahLine(r.page)}
      </Txt>
      <Txt size={12} weight={500} color={k.meta} numberOfLines={1}>
        {sub}
      </Txt>
    </View>
  );

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${DASH.reading()} ${action}`} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.85 }]}>
      {/* the ring is always at the left edge of the screen in Arabic (the line begins at the right), at the right edge otherwise */}
      <View style={styles.head}>{LANG === 'ar' ? [ring, words] : [words, ring]}</View>
      <View style={[styles.go, { backgroundColor: sage.inset }]}>
        <Txt size={14} weight={700} color={k.ink}>
          {action}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.cozy },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 1 },
  go: { height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
