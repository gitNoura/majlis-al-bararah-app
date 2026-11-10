// HOME, reading: the wird card. One card in the muted gold that stays the same under every sky of the prayer card above it
// (src/theme/homeSkin.ts), with nothing boxed inside it and no green: the name of the section, the surah's name in Arabic in
// Amiri (the face of the Quran) with the surah, page, hizb and juz under it, the khatma as ONE thin line with how many juz are
// read and the percentage of the Quran, and one dark button that opens the Quran at the marker. The line draws itself in once
// (Grow). The hadith is its own quiet note at the end.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { LANG } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');

// the surah(s) on the page, in Arabic, whatever the app's language is
function arabicName(page: number): string {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => SURAHS[n - 1].name);
  return names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – ');
}

export function ReadingCard() {
  const k = useSkin();
  const r = readingView();
  const where = placeOf(r.page);
  const juzDone = Math.floor(r.cells.reduce((a, n) => a + n, 0));
  // the surah (in the reader's language, when that is not Arabic), the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [LANG === 'ar' ? null : where.surahs, HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return (
    <View style={[styles.card, { backgroundColor: k.wird }]}>
      <Txt {...T.smallBold} color={k.wirdSoft}>
        {DASH.reading()}
      </Txt>
      <View style={styles.title}>
        <Txt serif weight={700} size={28} lineHeight={42} color={k.wirdInk} numberOfLines={1}>
          {arabicName(r.page)}
        </Txt>
        <Txt {...T.small} color={k.wirdSoft} numberOfLines={2}>
          {sub}
        </Txt>
      </View>

      <View style={styles.progress} accessible accessibilityRole="progressbar" accessibilityLabel={DASH.juzRead(digits(juzDone))} accessibilityValue={{ min: 0, max: 100, now: r.percent }}>
        <View style={styles.counts}>
          <Txt {...T.small} color={k.wirdSoft}>
            {DASH.juzRead(digits(juzDone))}
          </Txt>
          <Txt {...T.figure} color={k.wirdInk}>
            {`${digits(r.percent)}%`}
          </Txt>
        </View>
        <View style={[styles.track, { backgroundColor: k.wirdTrack }]}>
          {r.percent > 0 && <Grow axis="x" to={Math.max(r.percent, 2) / 100} delay={200} style={{ height: '100%', borderRadius: 2, backgroundColor: k.wirdInk }} />}
        </View>
      </View>

      <Pressable onPress={open} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: k.wirdInk }, pressed && { opacity: 0.88 }]}>
        <Txt {...T.button} color={k.wird}>
          {r.started ? DASH.continueReading() : DASH.startReading()}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderCurve: 'continuous', padding: space.md + space.xs, gap: space.md },
  title: { gap: space.hair },
  progress: { gap: space.sm },
  counts: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  track: { height: 3, borderRadius: 2, overflow: 'hidden', flexDirection: 'row' },
  btn: { height: 44, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
