// HOME, reading: a small mushaf page. An off-white block in a thin green frame: the surah's name in Arabic in Amiri, the face
// of the Quran, and under it the page, the hizb and juz (and, outside Arabic, the surah) in the reader's language. Then the
// khatma as thirty small marks, one per juz, that fill from the bottom as the reading passes through them (the juz being
// read is a fresher green), with how many juz are read and the percentage of the Quran, and one white button that opens the
// Quran at the marker. The marks draw themselves in once (Grow). The hadith is its own quiet note at the end.
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
const BEAD = 12; // the height of a juz mark

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
  const here = r.started ? r.cells.findIndex((n) => n < 1) : -1; // the juz being read
  const juzDone = Math.floor(r.cells.reduce((a, n) => a + n, 0));
  // the surah (outside Arabic, where the big name is not in the reader's language), the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [LANG === 'ar' ? null : where.surahs, HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return (
    <View style={[styles.page, { backgroundColor: k.page }]}>
      <View style={[styles.frame, { borderColor: k.pageLine }]}>
        <View style={styles.title}>
          <Txt serif weight={700} size={24} lineHeight={34} color={k.pageInk} center numberOfLines={1}>
            {arabicName(r.page)}
          </Txt>
          <Txt {...T.small} color={k.pageSoft} center numberOfLines={1}>
            {sub}
          </Txt>
        </View>

        <View style={styles.beads} accessible accessibilityRole="progressbar" accessibilityLabel={DASH.juzRead(digits(juzDone))} accessibilityValue={{ min: 0, max: 100, now: r.percent }}>
          {r.cells.map((n, i) => (
            <View key={i} style={[styles.bead, { backgroundColor: k.pageBead }]}>
              {n > 0 && <Grow axis="y" to={BEAD * Math.max(n, 0.16)} delay={120 + i * 22} style={{ width: '100%', backgroundColor: i === here ? k.pageHere : k.pageInk }} />}
            </View>
          ))}
        </View>
        <View style={styles.counts}>
          <Txt {...T.small} color={k.pageSoft}>
            {DASH.juzRead(digits(juzDone))}
          </Txt>
          <Txt {...T.figure} color={k.pageInk}>
            {`${digits(r.percent)}%`}
          </Txt>
        </View>

        <Pressable onPress={open} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: k.pageButton, borderColor: k.pageLine }, pressed && { opacity: 0.88 }]}>
          <Txt {...T.button} color={k.pageInk}>
            {r.started ? DASH.continueReading() : DASH.startReading()}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { borderRadius: 20, borderCurve: 'continuous', padding: space.xs },
  frame: { borderWidth: 1, borderRadius: 16, borderCurve: 'continuous', padding: space.cozy, gap: space.sm },
  title: { alignItems: 'center', gap: space.hair },
  beads: { flexDirection: 'row', gap: 2, height: BEAD },
  bead: { flex: 1, borderRadius: 2, overflow: 'hidden', justifyContent: 'flex-end' },
  counts: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  btn: { height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
