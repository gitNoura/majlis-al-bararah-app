// HOME, reading: a card of the prayer card's family. Its head is the surah being read (in Amiri in Arabic) with «Reading» over
// it and the khatma's percentage at the end, as the prayer card has the next prayer and the time left; under it the same pair
// of pills: the page and juz (tinted), and the one dark pill «Continue reading» with an arrow. A tap anywhere opens the
// Quran at the marker.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HomeCard, useCardSky } from '@/components/home/HomeCard';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { isEnglish, isFrench, LANG } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';

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
  const c = useCardSky();
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
    <HomeCard onPress={open} label={`${DASH.reading()} ${action}`}>
      <View style={styles.head}>
        <View style={styles.words}>
          <Txt size={12} weight={700} color={c.soft}>
            {DASH.reading()}
          </Txt>
          <Txt serif={LANG === 'ar'} size={21} weight={800} lineHeight={LANG === 'ar' ? 34 : 28} color={c.ink} numberOfLines={1}>
            {surahLine(r.page)}
          </Txt>
        </View>
        <Txt size={14} weight={700} color={c.ink}>
          {`${digits(r.percent)}%`}
        </Txt>
      </View>
      <View style={styles.buttons}>
        <View style={[styles.btn, { backgroundColor: c.pill }]}>
          <Txt size={12} weight={500} color={c.soft} numberOfLines={1}>
            {sub}
          </Txt>
        </View>
        <View style={[styles.btn, { backgroundColor: c.hi }]}>
          <Txt size={13} weight={700} color={c.hiInk} numberOfLines={1}>
            {action}
          </Txt>
          <Arrow color={c.hiInk} />
        </View>
      </View>
    </HomeCard>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  words: { flex: 1 },
  buttons: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, minHeight: 34, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12 },
});
