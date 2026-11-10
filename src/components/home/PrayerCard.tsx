// HOME, the next prayer. The card wears the sky of the moment again (night, dawn, midday, afternoon, sunset: the stars, the
// clouds, the sun, src/components/PrayerSky.tsx), but compact: the name of the prayer with the time left said as a
// sentence («in 2h 14m», so it needs no label above it), the day as one line of five stops, and two small links (the qibla and
// the calendar). A stop already prayed is filled, the next one is ringed, the rest are hollow. The line is built from five
// equal columns, each with a half-line on either side of its stop, so it mirrors by itself in Arabic (Fajr at the right).
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
import { prayerView, SKIES, skyByClock, type PrayerView, type Sky } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const RADIUS = 20;
const STOP = 20; // the width and height of a stop

function Stop({ sky, state }: { sky: Sky; state: 'past' | 'next' | 'later' }) {
  if (state === 'next') {
    return (
      <View style={[styles.stop, { borderWidth: 1.5, borderColor: sky.next }]}>
        <View style={[styles.core, { backgroundColor: sky.next }]} />
      </View>
    );
  }
  return (
    <View style={styles.stop}>
      <View style={[styles.core, state === 'past' ? { backgroundColor: sky.ink } : { borderWidth: 1.5, borderColor: sky.soft }]} />
    </View>
  );
}

function DayLine({ sky, view }: { sky: Sky; view: NonNullable<PrayerView> }) {
  // after Isha the next prayer is tomorrow's Fajr: then the whole day is behind us
  const dayDone = view.list[0].next && view.list.slice(1).every((p) => p.past);
  const nextAt = dayDone ? view.list.length : view.list.findIndex((p) => p.next);
  const last = view.list.length - 1;
  return (
    <View style={styles.line}>
      {view.list.map((p, i) => {
        const state = i < nextAt ? 'past' : i === nextAt ? 'next' : 'later';
        const before = i <= nextAt; // the half-line leading into this stop is travelled
        const after = i < nextAt; // and the one leaving it
        const seg = (travelled: boolean, hidden: boolean) => (hidden ? { backgroundColor: 'transparent' } : travelled ? { backgroundColor: sky.ink } : { backgroundColor: sky.soft, opacity: 0.35 });
        return (
          <View key={p.key} style={styles.col}>
            <View style={styles.rail}>
              <View style={[styles.seg, seg(before, i === 0)]} />
              <Stop sky={sky} state={state} />
              <View style={[styles.seg, seg(after, i === last)]} />
            </View>
            <Txt {...T.small} weight={state === 'next' ? 700 : 500} color={state === 'next' ? sky.ink : sky.soft} center numberOfLines={1}>
              {p.name}
            </Txt>
            <Txt {...T.small} weight={state === 'next' ? 700 : 500} color={sky.ink} center numberOfLines={1} style={state === 'past' ? { opacity: 0.62 } : undefined}>
              {p.at}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

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
  const sky = SKIES[phase];

  const link = (label: string, to: '/qibla' | '/calendar') => (
    <Pressable onPress={() => router.push(to)} accessibilityRole="button" style={({ pressed }) => [styles.chip, { backgroundColor: sky.circle }, pressed && { opacity: 0.7 }]}>
      <Txt {...T.smallBold} color={sky.ink}>
        {label}
      </Txt>
    </Pressable>
  );

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
            <Txt {...T.display} color={sky.ink} numberOfLines={1} style={styles.name}>
              {view.next}
            </Txt>
            <Txt {...T.figure} color={sky.ink}>
              {DASH.inTime(DASH.left(view.h, view.m))}
            </Txt>
          </View>
          <DayLine sky={sky} view={view} />
          <View style={styles.links}>
            {link(HOME.qibla(), '/qibla')}
            {link(DASH.calendar(), '/calendar')}
          </View>
        </>
      ) : (
        <>
          <Txt {...T.title} color={sky.ink}>
            {t('calPlaceAsk')}
          </Txt>
          <Pressable onPress={() => setAsking(true)} accessibilityRole="button" style={({ pressed }) => [styles.ask, { backgroundColor: sky.next }, pressed && { opacity: 0.88 }]}>
            <Txt {...T.button} color={sky.nextIcon}>
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
  card: { borderRadius: RADIUS, borderCurve: 'continuous', padding: space.cozy, gap: space.cozy, overflow: 'hidden' },
  skyClip: { ...StyleSheet.absoluteFill, borderRadius: RADIUS, borderCurve: 'continuous', overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md },
  name: { flex: 1 },
  line: { flexDirection: 'row' },
  col: { flex: 1, gap: 1 },
  rail: { height: STOP, flexDirection: 'row', alignItems: 'center', marginBottom: space.xs },
  seg: { flex: 1, height: 2 },
  stop: { width: STOP, height: STOP, borderRadius: STOP / 2, alignItems: 'center', justifyContent: 'center' },
  core: { width: 10, height: 10, borderRadius: 5 },
  links: { flexDirection: 'row', gap: space.sm },
  chip: { height: 32, paddingHorizontal: space.cozy, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ask: { height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
});
