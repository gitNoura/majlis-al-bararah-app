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
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
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
      <View pointerEvents="none" style={[styles.frame, { borderColor: h.forestLine }]} />
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={[styles.chip, { backgroundColor: 'rgba(244,246,236,0.12)' }]}>
            <Txt size={12} weight={700} color={h.forestInk}>
              {DASH.reading()}
            </Txt>
          </View>
          {r.started ? (
            <>
              <Txt serif size={30} weight={700} lineHeight={44} color={h.forestInk} numberOfLines={2}>
                {where.surahs}
              </Txt>
              <Txt size={14} color={h.forestSoft} numberOfLines={1}>
                {`${HOME.wirdPage(digits(r.page))} · ${where.extra}`}
              </Txt>
            </>
          ) : (
            <Txt size={18} weight={700} lineHeight={26} color={h.forestInk}>
              {DASH.beginKhatma()}
            </Txt>
          )}
        </View>
        <Ring value={r.percent / 100} size={66} color={h.lime} track="rgba(244,246,236,0.14)" a11y={`${r.percent}%`}>
          <Txt size={15} weight={800} color={h.forestInk}>
            {`${digits(r.percent)}%`}
          </Txt>
        </Ring>
      </View>
      <Pressable
        onPress={() => router.navigate('/quran')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.btn, { backgroundColor: h.lime }, pressed && { opacity: 0.88 }]}
      >
        <Txt size={15} weight={800} color={h.limeInk}>
          {r.started ? DASH.continueReading() : DASH.startReading()}
        </Txt>
        <View style={[styles.go, { backgroundColor: h.limeInk }]}>
          <Arrow color={h.lime} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 16, gap: 14, overflow: 'hidden' },
  frame: { position: 'absolute', top: 6, bottom: 6, start: 6, end: 6, borderRadius: 21, borderWidth: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12 },
  btn: { height: 46, borderRadius: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingStart: 20, paddingEnd: 6 },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
