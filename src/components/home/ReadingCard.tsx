// HOME, reading: open on the page, no box. «Reading» and the surah's name (in the page's one font) with the khatma's percentage at
// the end, as the prayer card has the next prayer and the time left; the page, hizb and juz as plain words under it (not a pill);
// then «Continue reading» as the one dark pill (cream in dark mode, as on the prayer card). A tap anywhere opens the Quran at the marker.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Title } from '@/components/home/Title';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { isEnglish, isFrench, LANG } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';
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
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={LANG === 'ar' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
    </Svg>
  );
}

export function ReadingCard() {
  const k = useSkin();
  const { isDark } = useTheme();
  const r = readingView();
  const where = placeOf(r.page);
  // the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');
  const action = r.started ? DASH.continueReading() : DASH.startReading();

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${DASH.reading()} ${action}`} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.85 }]}>
      <View style={styles.head}>
        <View style={styles.words}>
          <Title>{DASH.reading()}</Title>
          <Txt size={24} weight={800} lineHeight={34} color={k.ink} numberOfLines={1}>
            {surahLine(r.page)}
          </Txt>
          <Txt size={12} weight={500} color={k.meta} numberOfLines={1}>
            {sub}
          </Txt>
        </View>
        <Txt size={14} weight={700} color={k.ink}>
          {`${digits(r.percent)}%`}
        </Txt>
      </View>
      <View style={[styles.go, { backgroundColor: isDark ? k.pageButton : k.goBg }]}>
        <Txt size={14} weight={700} color={isDark ? k.buttonInk : k.goInk}>
          {action}
        </Txt>
        <Arrow color={isDark ? k.buttonInk : k.goInk} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.cozy, paddingHorizontal: space.xs },
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md },
  words: { flex: 1, gap: 1 },
  go: { minHeight: 42, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.md },
});
