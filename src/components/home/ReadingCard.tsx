// HOME, card 2: reading, the hero. On the neutral surface of the Home cards (Surface): the surah and page where the reader stopped,
// the khatma as one green ring, the one filled button of the screen (a green pill that opens the Quran tab at the marker), and,
// under a hairline, the hadith of the reader. The surah is the largest line of the screen under the greeting (Heading 5), and the button
// is a full 44 high with the prayer card's own forest green, so the one filled button of the screen reads as the hero.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { placeOf } from '@/components/quran/QuranHeader';
import { Surface } from '@/components/home/Surface';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { LANG } from '@/i18n/i18n';
import { readingView } from '@/lib/dashboard';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';
import { type } from '@/theme/type';

const digits = (n: number) => n.toLocaleString('en');

// an arrow that points to the end of the line (left in Arabic)
function Arrow({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={LANG === 'ar' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
    </Svg>
  );
}

export function ReadingCard() {
  const h = useHome();
  const r = readingView();
  const where = placeOf(r.page);

  const ring = (
    <Ring key="ring" value={r.percent / 100} size={54} color={h.deepTop} track={h.trackSoft} a11y={`${r.percent}%`}>
      <Txt {...type.caption3} color={h.ink}>
        {`${digits(r.percent)}%`}
      </Txt>
    </Ring>
  );
  const button = (
    <Pressable
      onPress={() => router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, { backgroundColor: h.forest }, pressed && { opacity: 0.88 }]}
    >
      <Txt {...type.buttonMd} color={h.forestInk}>
        {r.started ? DASH.continueReading() : DASH.startReading()}
      </Txt>
      <View style={[styles.go, { backgroundColor: h.forestInk }]}>
        <Arrow color={h.forest} />
      </View>
    </Pressable>
  );
  const words = (
    <View style={{ flex: 1, gap: space.xs }}>
      {r.started ? (
        <>
          <Txt {...type.heading5} color={h.ink} numberOfLines={2}>
            {HOME.surah(where.surahs)}
          </Txt>
          <Txt {...type.body6} color={h.meta} numberOfLines={1}>
            {`${HOME.wirdPage(digits(r.page))} · ${where.extra}`}
          </Txt>
        </>
      ) : (
        <Txt {...type.heading6} color={h.ink}>
          {DASH.beginKhatma()}
        </Txt>
      )}
    </View>
  );
  return (
    <Surface>
      {/* «Reading»: its own line, apart from the row below */}
      <Txt {...type.caption3} color={h.deepTop}>
        {DASH.reading()}
      </Txt>
      <View style={styles.top}>
        {/* the ring is always at the right edge of the screen: first in Arabic (the line begins at the right), last otherwise */}
        {LANG === 'ar' ? <>{ring}{words}</> : <>{words}{ring}</>}
      </View>
      {button}
      {/* the hadith of the reader («read and rise») and who told it, under a hairline */}
      <View style={[styles.hadith, { borderTopColor: h.trackSoft }]}>
        <Txt {...type.hadith} color={h.ink}>
          <Txt {...type.hadith} color={h.deepTop}>
            {`${HOME.hadithIntro()} `}
          </Txt>
          {HOME.hadith()}
        </Txt>
        <Txt {...type.caption4} color={h.meta}>
          {HOME.heroSource()}
        </Txt>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.cozy },
  btn: { height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: space.md, paddingEnd: space.xs },
  hadith: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.cozy, gap: space.xs },
  go: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
