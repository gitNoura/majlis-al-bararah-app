// HOME, card 1: the next prayer with its time and the time left, and the two buttons (qibla, calendar), as one glass box that keeps
// the sky of the moment behind it (a white veil over the sky, a bright edge, white glass pills). The day's five times are in the calendar.
// With no place chosen yet it asks for one (the phone's location, or a city from the settings).
'use no memo'; // reads saved state (the place) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PlaceSheet } from '@/components/PlaceSheet';
import { PrayerSky } from '@/components/PrayerSky';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { LANG, t } from '@/i18n/i18n';
import { prayerView, SKIES, skyByClock, type PrayerView } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { lineStart, ltr } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

const RADIUS = 26;
const EDGE = 'rgba(48, 48, 48, 0.62)'; // dark mode: the grey at the very edge of the card (the vignette); lower the 0.62 for a lighter one

export function PrayerCard() {
  const k = useSkin();
  const [view, setView] = useState<PrayerView>(prayerView);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // back on Home: the place may have been chosen in the settings; and the time left, every half minute
  useFocusEffect(
    useCallback(() => {
      setView(prayerView());
    }, []),
  );
  useEffect(() => {
    const timer = setInterval(() => setView(prayerView()), 30000);
    return () => clearInterval(timer);
  }, []);

  const findPlace = () => {
    setBusy(true);
    setFailed(false);
    locate()
      .then(() => {
        setView(prayerView());
        setAsking(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  };
  const chooseCity = () => {
    setAsking(false);
    router.navigate({ pathname: '/settings', params: { cities: '1' } });
  };

  const { isDark } = useTheme();
  const phase = view?.phase ?? skyByClock();
  const sky = SKIES[phase];
  const pill = (label: string, onPress: () => void, key: string) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: sky.btn, borderColor: k.glassEdge }, pressed && { opacity: 0.7 }]}>
      <Txt size={13} weight={700} color={sky.ink}>
        {label}
      </Txt>
    </Pressable>
  );

  // the next prayer: «Next prayer · 4h 33m» over «Dhuhr · 12:20»
  const next = view?.list.find((p) => p.next);
  const info = view && (
    <View key="info" style={styles.info}>
      <Txt size={12} weight={500} color={sky.soft} style={lineStart()}>
        {`${HOME.nextPrayer()} · ${DASH.left(view.h, view.m)}`}
      </Txt>
      <Txt size={18} weight={800} lineHeight={26} color={sky.ink} style={lineStart()}>
        {next ? `${view.next} · ${next.at}` : view.next}
      </Txt>
    </View>
  );
  const qibla = pill(HOME.qibla(), () => router.push('/qibla'), 'qibla');
  const calendar = pill(DASH.calendar(), () => router.push('/calendar'), 'calendar');

  return (
    // the rounded clip is on the OUTER view and on the sky's own layer: the animated stars and clouds (moving layers)
    // are not cut by the gradient view's own corners on every phone, which showed the card square
    <View style={[styles.card, { borderColor: k.glassEdge, boxShadow: `0px 8px 24px ${k.glassShadow}` }]}>
      <LinearGradient colors={sky.sky} style={StyleSheet.absoluteFill} />
      <View style={styles.skyClip} pointerEvents="none">
        <PrayerSky phase={phase} sun={view?.sun ?? 0.5} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: sky.veil }]} />
        {isDark && (
          // dark mode: the card is as in light mode; only a soft grey vignette round its edges, to blend it into the dark page
          // (four edge gradients: the corners get two of them, so they are the darkest)
          <>
            <LinearGradient colors={[EDGE, 'rgba(48, 48, 48, 0)']} style={[styles.edge, { top: 0, left: 0, right: 0, height: '38%' }]} />
            <LinearGradient colors={['rgba(48, 48, 48, 0)', EDGE]} style={[styles.edge, { bottom: 0, left: 0, right: 0, height: '38%' }]} />
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[EDGE, 'rgba(48, 48, 48, 0)']} style={[styles.edge, { top: 0, bottom: 0, left: 0, width: '30%' }]} />
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['rgba(48, 48, 48, 0)', EDGE]} style={[styles.edge, { top: 0, bottom: 0, right: 0, width: '30%' }]} />
          </>
        )}
      </View>
      {view ? (
        // left to right on the screen in every language: in Arabic the prayer is at the right edge, then qibla, then calendar
        <View style={[styles.row, ltr()]}>{LANG === 'ar' ? [calendar, qibla, info] : [info, qibla, calendar]}</View>
      ) : (
        <View style={styles.ask}>
          <Txt size={15} color={sky.ink}>
            {t('calPlaceAsk')}
          </Txt>
          {pill(HOME.setPlace(), () => setAsking(true), 'place')}
        </View>
      )}
      <PlaceSheet open={asking} busy={busy} failed={failed} onClose={() => setAsking(false)} onLocate={findPlace} onChooseCity={chooseCity} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderCurve: 'continuous', borderWidth: 1, padding: space.cozy, overflow: 'hidden' },
  edge: { position: 'absolute' },
  skyClip: { ...StyleSheet.absoluteFill, borderRadius: RADIUS, borderCurve: 'continuous', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  info: { flex: 1, gap: 1 },
  ask: { gap: space.sm },
  btn: { minHeight: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md, boxShadow: '0px 4px 12px rgba(20, 50, 38, 0.10)' },
});
