// HOME, card 1: the next prayer, the time left to it, the day's five times and a button to the qibla.
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
import { t } from '@/i18n/i18n';
import { prayerView, SKIES, skyByClock, type PrayerView } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { space } from '@/theme/tokens';

const RADIUS = 22;

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

  const phase = view?.phase ?? skyByClock();
  const sky = SKIES[phase]; // the card wears the sky of the moment (as in the earlier version)
  return (
    // the rounded clip is on the OUTER view and on the sky's own layer: the animated stars and clouds (moving layers)
    // are not cut by the gradient view's own corners on every phone, which showed the card square
    <View style={styles.card}>
      <LinearGradient colors={sky.sky} style={StyleSheet.absoluteFill} />
      <View style={styles.skyClip} pointerEvents="none">
        <PrayerSky phase={phase} sun={view?.sun ?? 0.5} />
      </View>
      {view ? (
        <>
          <View style={styles.head}>
            <View>
              <Txt size={12} weight={700} color={sky.soft}>
                {HOME.nextPrayer()}
              </Txt>
              <Txt size={24} weight={800} lineHeight={32} color={sky.ink}>
                {view.next}
              </Txt>
            </View>
            <Txt size={15} weight={700} color={sky.ink}>
              {DASH.left(view.h, view.m)}
            </Txt>
          </View>
          <View style={styles.strip}>
            {view.list.map((p) => (
              <View key={p.key} style={[styles.time, { backgroundColor: p.next ? sky.next : sky.circle }]}>
                <Txt size={11} weight={p.next ? 700 : 500} color={p.next ? sky.nextIcon : sky.soft} center>
                  {p.name}
                </Txt>
                <Txt size={13} weight={p.next ? 700 : 500} color={p.next ? sky.nextIcon : sky.ink} center style={p.past && !p.next ? { opacity: 0.62 } : undefined}>
                  {p.at}
                </Txt>
              </View>
            ))}
          </View>
          <View style={styles.buttons}>
            <Pressable onPress={() => router.push('/qibla')} accessibilityRole="button" style={[styles.btn, { backgroundColor: sky.circle }]}>
              <Txt size={14} weight={700} color={sky.ink}>
                {HOME.qibla()}
              </Txt>
            </Pressable>
            <Pressable onPress={() => router.push('/calendar')} accessibilityRole="button" style={[styles.btn, { backgroundColor: sky.circle }]}>
              <Txt size={14} weight={700} color={sky.ink}>
                {DASH.calendar()}
              </Txt>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Txt size={15} color={sky.ink}>
            {t('calPlaceAsk')}
          </Txt>
          <Pressable onPress={() => setAsking(true)} accessibilityRole="button" style={[styles.btn, { backgroundColor: sky.circle }]}>
            <Txt size={15} weight={700} color={sky.ink}>
              {HOME.setPlace()}
            </Txt>
          </Pressable>
        </>
      )}
      <PlaceSheet open={asking} busy={busy} failed={failed} onClose={() => setAsking(false)} onLocate={findPlace} onChooseCity={chooseCity} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderCurve: 'continuous', padding: space.md, gap: 10, overflow: 'hidden', boxShadow: '0px 8px 20px rgba(20, 50, 38, 0.16)' },
  skyClip: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, borderCurve: 'continuous', overflow: 'hidden' },
  buttons: { flexDirection: 'row', gap: space.sm },
  btn: { flex: 1, minHeight: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  strip: { flexDirection: 'row', gap: space.xs },
  time: { flex: 1, borderRadius: 10, paddingVertical: 6, gap: 1 },
});
