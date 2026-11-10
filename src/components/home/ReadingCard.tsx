// HOME, reading: the one dark block of the screen and its memorable thing. The surah where the reader stopped, the share of
// the Quran read as one large figure, then the khatma as thirty small marks, one per juz, that fill from the bottom as the
// reading passes through them; the juz the reader is in is marigold ("you are here"). One cream button opens the Quran at
// the marker. The marks draw themselves in once, one after another (Grow). Nothing else sits in the block: the hadith is
// its own quiet note at the end of the screen.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grow } from '@/components/home/Grow';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { readingView } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString('en');
const BEAD = 26; // the height of a juz mark

export function ReadingCard() {
  const k = useSkin();
  const r = readingView();
  const where = placeOf(r.page);
  const here = r.started ? r.cells.findIndex((n) => n < 1) : -1; // the juz being read
  const juzDone = Math.floor(r.cells.reduce((a, n) => a + n, 0));

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return (
    <View style={[styles.block, { backgroundColor: k.forest }]}>
      <View style={styles.top}>
        <View style={styles.words}>
          {r.started ? (
            <>
              <Txt {...T.hero} color={k.forestInk} numberOfLines={2}>
                {HOME.surah(where.surahs)}
              </Txt>
              <View style={styles.where}>
                <Txt {...T.small} color={k.forestSoft}>
                  {HOME.wirdPage(digits(r.page))}
                </Txt>
                <View style={[styles.tick, { backgroundColor: k.forestSoft }]} />
                <Txt {...T.small} color={k.forestSoft} numberOfLines={1}>
                  {where.extra}
                </Txt>
              </View>
            </>
          ) : (
            <Txt {...T.hero} color={k.forestInk}>
              {DASH.beginKhatma()}
            </Txt>
          )}
        </View>
        {r.started && (
          <Txt {...T.display} color={k.spark}>
            {`${digits(r.percent)}%`}
          </Txt>
        )}
      </View>

      <View style={styles.beads} accessible accessibilityRole="progressbar" accessibilityLabel={DASH.juzRead(digits(juzDone))} accessibilityValue={{ min: 0, max: 100, now: r.percent }}>
        {r.cells.map((n, i) => (
          <View key={i} style={[styles.bead, { backgroundColor: k.bead }]}>
            {n > 0 && <Grow axis="y" to={BEAD * Math.max(n, 0.14)} delay={120 + i * 22} style={{ width: '100%', backgroundColor: i === here ? k.spark : k.beadOn }} />}
          </View>
        ))}
      </View>
      <Txt {...T.small} color={k.forestSoft}>
        {DASH.juzRead(digits(juzDone))}
      </Txt>

      <Pressable onPress={open} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: k.forestInk }, pressed && { opacity: 0.88 }]}>
        <Txt {...T.button} color={k.forest}>
          {r.started ? DASH.continueReading() : DASH.startReading()}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: 28, borderCurve: 'continuous', padding: space.lg, gap: space.cozy },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  words: { flex: 1, gap: space.xs },
  where: { flexDirection: 'row', alignItems: 'center', gap: space.cozy },
  tick: { width: 1, height: 12, opacity: 0.5 },
  beads: { flexDirection: 'row', gap: 3, height: BEAD, marginTop: space.sm },
  bead: { flex: 1, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  btn: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
});
