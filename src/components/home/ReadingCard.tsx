// HOME, card 2: reading, the hero. A deep forest card framed like a mushaf page, the surah in Amiri (the Quran's own face), the surah and page where the reader stopped,
// the khatma as one cream ring, and the one filled button of the screen (a cream pill that opens the Quran tab at the
// marker). The juz read, the pages today and the streak are the tiles under it (StatTiles).
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { L, LANG } from '@/i18n/i18n';
import { readingView } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

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
  return (
    <View style={[styles.card, { backgroundColor: h.forest, boxShadow: `0px 14px 28px ${h.shadow}` }]}>
      {/* a thin inset frame, like a mushaf page */}
      <View pointerEvents="none" style={[styles.frame, { borderColor: h.goldLine }]} />
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={12} weight={700} color={h.gold}>
            {DASH.reading()}
          </Txt>
          {r.started ? (
            <>
              <Txt size={18} weight={800} lineHeight={26} color={h.forestInk} numberOfLines={2}>
                {HOME.surah(where.surahs)}
              </Txt>
              <Txt size={13} color={h.forestSoft} numberOfLines={1}>
                {`${HOME.wirdPage(digits(r.page))} · ${where.extra}`}
              </Txt>
            </>
          ) : (
            <Txt size={20} weight={800} lineHeight={28} color={h.forestInk}>
              {DASH.beginKhatma()}
            </Txt>
          )}
        </View>
        <Pressable
          onPress={() => router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, { backgroundColor: h.lime }, pressed && { opacity: 0.88 }]}
        >
          <Txt size={13} weight={800} color={h.limeInk}>
            {r.started ? DASH.continueReading() : DASH.startReading()}
          </Txt>
          <View style={[styles.go, { backgroundColor: h.limeInk }]}>
            <Arrow color={h.lime} />
          </View>
        </Pressable>
        <Ring value={r.percent / 100} size={54} color={h.gold} track="rgba(244,246,236,0.14)" a11y={`${r.percent}%`}>
          <Txt size={13} weight={800} color={h.forestInk}>
            {`${digits(r.percent)}%`}
          </Txt>
        </Ring>
      </View>
      {/* the hadith of the reader («read and rise») and who told it: plain text on the card, same font as the rest */}
      <View style={{ gap: 2 }}>
        <Txt size={13} weight={500} lineHeight={20} color={h.forestInk}>
          {HOME.hadith()}
        </Txt>
        <Txt size={12} lineHeight={17} color={h.gold}>
          {HOME.heroSource()}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, gap: 10, overflow: 'hidden' },
  frame: { position: 'absolute', top: 6, bottom: 6, start: 6, end: 6, borderRadius: 19, borderWidth: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { height: 34, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 8, paddingStart: 12, paddingEnd: 4 },
  go: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
