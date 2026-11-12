// HOME, card 1: the next prayer with its time and the time left, and the two buttons (qibla, calendar), as one card (like the ones under it)
// filled with the sky of the moment (with pills). The day's five times are in the calendar.
// With no place chosen yet it asks for one (the phone's location, or a city from the settings).
'use no memo'; // reads saved state (the place) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/home/Glass';
import { PlaceSheet } from '@/components/PlaceSheet';
import { PrayerSky } from '@/components/PrayerSky';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { LANG, t } from '@/i18n/i18n';
import { prayerView, SKIES, skyByClock, type PrayerView } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { ltr, ltrStart } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

const RADIUS = 26;

export function PrayerCard() {
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
  // the countdown ticks every second; when it reaches zero the next prayer takes over
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setView((v) => (v && Date.now() >= v.nextAt ? prayerView() : v));
    }, 1000);
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

  const phase = view?.phase ?? skyByClock();
  const { isDark } = useTheme();
  const sky = SKIES[phase]; // the same sky in light and dark mode
  const lightSky = phase !== 'night' && phase !== 'sunset';
  const darkPill = isDark && lightSky; // dark mode on a light sky: a mid-grey pill with white words, not the bright white one and not a black one
  const pill = (label: string, onPress: () => void, key: string) => (
    <Pressable key={key} onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.btn, { backgroundColor: darkPill ? 'rgba(100, 106, 112, 0.55)' : sky.btn }, pressed && { opacity: 0.7 }]}>
      <Txt size={13} weight={700} color={darkPill ? '#ffffff' : sky.ink}>
        {label}
      </Txt>
    </Pressable>
  );

  // the next prayer: «Next prayer · 04:33:12» (a live countdown) over «Dhuhr · 12:20»
  const next = view?.list.find((p) => p.next);
  const secs = view ? Math.max(0, Math.floor((view.nextAt - now) / 1000)) : 0;
  const pad = (n: number) => String(n).padStart(2, '0');
  const countdown = `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;
  const nameInk = lightSky ? '#111111' : sky.ink; // black on the light skies; the night's cream on the dark ones
  const info = view && (
    <View key="info" style={styles.info}>
      <Txt size={12} weight={500} color={sky.soft} style={[ltrStart(), { fontVariant: ['tabular-nums'] }]}>
        {`${HOME.nextPrayer()} · ${countdown}`}
      </Txt>
      <Txt size={18} weight={800} lineHeight={26} color={nameInk} style={ltrStart()}>
        {next ? `${view.next} · ${next.at}` : view.next}
      </Txt>
    </View>
  );
  const qibla = pill(HOME.qibla(), () => router.push('/qibla'), 'qibla');
  const calendar = pill(DASH.calendar(), () => router.push('/calendar'), 'calendar');

  return (
    // a card like the ones under it, filled with the sky of the moment. The rounded clip is on the sky's own layer: the animated
    // stars and clouds (moving layers) are not cut by the card's corners on every phone
    <Glass radius={RADIUS} style={styles.card}>
      <View style={styles.skyClip} pointerEvents="none">
        <LinearGradient colors={sky.sky} style={StyleSheet.absoluteFill} />
        <PrayerSky phase={phase} sun={view?.sun ?? 0.5} />
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
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.cozy, paddingVertical: space.cozy + 8 }, // a little thicker
  skyClip: { ...StyleSheet.absoluteFill, borderRadius: RADIUS, borderCurve: 'continuous', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  info: { flex: 1, gap: 1 },
  ask: { gap: space.sm },
  btn: { minHeight: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
});
