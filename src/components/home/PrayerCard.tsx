// HOME, the next prayer. No card and no sky: the name of the prayer and the time left to it, large, and under them the
// day as one line with five stops. A stop already prayed is filled, the next one is the marigold "you are here",
// the rest are hollow. Two small links: the qibla and the calendar. With no place chosen yet it asks for one
// (the phone's location, or a city from the settings).
// The line is built from five equal columns, each with a half-line on either side of its stop, so it mirrors by itself in
// Arabic (Fajr at the right) and needs no left/right maths.
'use no memo'; // reads saved state (the place) when it draws, which the React Compiler cannot see change
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PlaceSheet } from '@/components/PlaceSheet';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { t } from '@/i18n/i18n';
import { prayerView, type PrayerView } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { useSkin, type HomeSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

const STOP = 24; // the width and height of a stop

function Stop({ k, state }: { k: HomeSkin; state: 'past' | 'next' | 'later' }) {
  if (state === 'next') {
    return (
      <View style={[styles.stop, { backgroundColor: k.sparkSoft }]}>
        <View style={[styles.core, { backgroundColor: k.spark }]} />
      </View>
    );
  }
  return (
    <View style={styles.stop}>
      <View style={[styles.core, state === 'past' ? { backgroundColor: k.fill } : { borderWidth: 2, borderColor: k.dotOff }]} />
    </View>
  );
}

function DayLine({ k, view }: { k: HomeSkin; view: NonNullable<PrayerView> }) {
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
        return (
          <View key={p.key} style={styles.col}>
            <View style={styles.rail}>
              <View style={[styles.seg, { backgroundColor: i === 0 ? 'transparent' : before ? k.fill : k.track }]} />
              <Stop k={k} state={state} />
              <View style={[styles.seg, { backgroundColor: i === last ? 'transparent' : after ? k.fill : k.track }]} />
            </View>
            <Txt {...T.small} weight={state === 'next' ? 800 : 500} color={state === 'next' ? k.ink : k.meta} center numberOfLines={1}>
              {p.name}
            </Txt>
            <Txt {...T.small} weight={state === 'next' ? 800 : 500} color={state === 'past' ? k.meta : k.ink} center numberOfLines={1}>
              {p.at}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

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

  const link = (label: string, to: '/qibla' | '/calendar') => (
    <Pressable
      onPress={() => router.push(to)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.chip, { borderColor: k.hairline }, pressed && { backgroundColor: k.track }]}
    >
      <Txt {...T.smallBold} color={k.ink}>
        {label}
      </Txt>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      {view ? (
        <>
          <View style={styles.head}>
            <View style={styles.name}>
              <Txt {...T.small} color={k.meta}>
                {HOME.nextPrayer()}
              </Txt>
              <Txt {...T.display} color={k.ink} numberOfLines={1}>
                {view.next}
              </Txt>
            </View>
            <View style={styles.left}>
              <View style={[styles.live, { backgroundColor: k.spark }]} />
              <Txt {...T.figure} color={k.accent}>
                {DASH.left(view.h, view.m)}
              </Txt>
            </View>
          </View>
          <DayLine k={k} view={view} />
          <View style={styles.links}>
            {link(HOME.qibla(), '/qibla')}
            {link(DASH.calendar(), '/calendar')}
          </View>
        </>
      ) : (
        <>
          <Txt {...T.title} color={k.ink}>
            {t('calPlaceAsk')}
          </Txt>
          <Pressable
            onPress={() => setAsking(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.ask, { backgroundColor: k.fill }, pressed && { opacity: 0.88 }]}
          >
            <Txt {...T.button} color={k.paper}>
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
  wrap: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md },
  name: { flex: 1 },
  left: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingBottom: space.sm },
  live: { width: 8, height: 8, borderRadius: 4 },
  line: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'stretch', gap: 1 },
  rail: { height: STOP, flexDirection: 'row', alignItems: 'center', marginBottom: space.xs },
  seg: { flex: 1, height: 3 },
  stop: { width: STOP, height: STOP, borderRadius: STOP / 2, alignItems: 'center', justifyContent: 'center' },
  core: { width: 12, height: 12, borderRadius: 6 },
  links: { flexDirection: 'row', gap: space.sm },
  chip: { height: 36, paddingHorizontal: space.md, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ask: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
});
