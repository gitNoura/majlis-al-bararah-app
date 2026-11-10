// HOME, reading: a mushaf page. The block is a deep navy card with off-white ink, in a thin frame, set like the top
// of a page of the mushaf: a rule with the rosette of the ayah in its middle (the page number in the medallion), then the
// surah's name in Arabic in Amiri, the face of the Quran, and under it the surah and the hizb and juz in the reader's
// language. Then the khatma as thirty small marks, one per juz, that fill from the bottom as the reading passes through them
// (the juz being read is light blue), with how many juz are read and the percentage of the Quran, and one off-white button that
// opens the Quran at the marker. The marks draw themselves in once (Grow). The hadith is its own quiet note at the end.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { Rosette } from '@/components/home/Rosette';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');
const BEAD = 16; // the height of a juz mark

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
  const sub = !r.started ? DASH.beginKhatma() : LANG === 'ar' ? where.extra : `${where.surahs} • ${where.extra}`;

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return (
    <View style={[styles.page, { backgroundColor: k.page }]}>
      <View style={[styles.frame, { borderColor: k.pageLine }]}>
        {/* the head of the page: a rule, the rosette with the page number, a rule */}
        <View style={styles.crest}>
          <View style={[styles.rule, { backgroundColor: k.pageLine }]} />
          <Rosette size={34} color={k.pageInk} fill={k.page}>
            <Txt size={11} weight={700} lineHeight={14} color={k.pageInk}>
              {digits(r.page)}
            </Txt>
          </Rosette>
          <View style={[styles.rule, { backgroundColor: k.pageLine }]} />
        </View>
        <View style={styles.title}>
          <Txt serif weight={700} size={26} lineHeight={40} color={k.pageInk} center numberOfLines={1}>
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

        <Pressable onPress={open} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: k.pageInk }, pressed && { opacity: 0.88 }]}>
          <Txt {...T.button} color={k.page}>
            {r.started ? DASH.continueReading() : DASH.startReading()}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { borderRadius: 22, borderCurve: 'continuous', padding: space.sm },
  frame: { borderWidth: 1, borderRadius: 16, borderCurve: 'continuous', padding: space.md, gap: space.cozy },
  crest: { flexDirection: 'row', alignItems: 'center', gap: space.cozy },
  rule: { flex: 1, height: 1 },
  title: { alignItems: 'center', gap: space.hair },
  beads: { flexDirection: 'row', gap: 2, height: BEAD },
  bead: { flex: 1, borderRadius: 2, overflow: 'hidden', justifyContent: 'flex-end' },
  counts: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  btn: { height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
