// HOME, card 2: reading, the hero card. It wears a deeper companion of the prayers card's sky (READING_SKIES), so the
// two cards match at every hour of the day. The khatma as one ring, where the reader is
// (surah, page, juz), the pages read today, and the one filled button of the screen: it opens the Quran tab at the marker.
// The ring is the only progress mark here (the juz strip was the same number drawn twice).
'use no memo'; // reads saved state (the marker, the wird) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { L } from '@/i18n/i18n';
import { READING_SKIES, readingView, skyPhase } from '@/lib/dashboard';
import { space } from '@/theme/tokens';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

export function ReadingCard() {
  const [phase, setPhase] = useState(skyPhase);
  // the sky moves on while Home is open (the prayers card does the same)
  useEffect(() => {
    const timer = setInterval(() => setPhase(skyPhase()), 30000);
    return () => clearInterval(timer);
  }, []);
  const k = READING_SKIES[phase];
  const r = readingView();
  const where = placeOf(r.page);
  const facts = [DASH.juzRead(digits(r.juzFull)), r.pagesToday ? DASH.pagesToday(digits(r.pagesToday)) : DASH.pagesNone(), r.khatmas ? DASH.khatmas(digits(r.khatmas)) : ''].filter(Boolean);
  return (
    <LinearGradient colors={k.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { boxShadow: `0px 10px 22px ${k.shadow}` }]}>
      {/* a soft light in the corner, for depth */}
      <View pointerEvents="none" style={styles.glow} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Ring value={r.percent / 100} size={58} color={k.ink} track={k.track} a11y={`${r.percent}%`}>
          <Txt size={14} weight={800} color={k.ink}>
            {`${digits(r.percent)}%`}
          </Txt>
        </Ring>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt size={12} weight={700} color={k.soft}>
            {DASH.reading()}
          </Txt>
          {r.started ? (
            <>
              <Txt size={21} weight={800} lineHeight={28} color={k.ink} numberOfLines={1}>
                {where.surahs}
              </Txt>
              <Txt size={13} color={k.soft} numberOfLines={1}>
                {`${HOME.wirdPage(digits(r.page))} · ${where.extra}`}
              </Txt>
            </>
          ) : (
            <Txt size={15} weight={700} color={k.ink}>
              {DASH.beginKhatma()}
            </Txt>
          )}
        </View>
      </View>
      <Txt size={12.5} color={k.soft}>
        {facts.join(' · ')}
      </Txt>
      <Pressable onPress={() => router.navigate('/quran')} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: k.btn }, pressed && { opacity: 0.85 }]}>
        <Txt size={15} weight={800} color={k.btnInk}>
          {r.started ? DASH.continueReading() : DASH.startReading()}
        </Txt>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: space.md, gap: 10, overflow: 'hidden' },
  glow: { position: 'absolute', top: -60, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.09)' },
  btn: { minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
});
