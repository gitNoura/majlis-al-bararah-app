// HOME, card 1: the next prayer, the time left to it, the day's five times and a button to the qibla.
// With no place chosen yet it asks for one (the phone's location, or a city from the settings).
'use no memo'; // reads saved state (the place) when it draws, which the React Compiler cannot see change
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SecondaryButton } from '@/components/hifdh/Section';
import { PlaceSheet } from '@/components/PlaceSheet';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { t } from '@/i18n/i18n';
import { prayerView, type PrayerView } from '@/lib/dashboard';
import { locate } from '@/lib/prayer';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export function PrayerCard() {
  const { c } = useTheme();
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

  return (
    <Card>
      <Txt size={13} weight={700} color={c.meta}>
        {HOME.nextPrayer()}
      </Txt>
      {view ? (
        <>
          <View style={styles.head}>
            <Txt size={30} weight={800} lineHeight={40} color={c.ink}>
              {view.next}
            </Txt>
            <Txt size={16} weight={600} color={c.accent}>
              {DASH.left(view.h, view.m)}
            </Txt>
          </View>
          <View style={styles.strip}>
            {view.list.map((p) => (
              <View key={p.key} style={[styles.time, p.next && { backgroundColor: c.accentSoft }]}>
                <Txt size={12} weight={p.next ? 700 : 500} color={p.next ? c.accent : c.meta} center>
                  {p.name}
                </Txt>
                <Txt size={14} weight={p.next ? 700 : 500} color={p.next ? c.accent : p.past ? c.meta : c.ink} center>
                  {p.at}
                </Txt>
              </View>
            ))}
          </View>
          <SecondaryButton label={HOME.qibla()} onPress={() => router.push('/qibla')} />
        </>
      ) : (
        <>
          <Txt size={15} color={c.text}>
            {t('calPlaceAsk')}
          </Txt>
          <SecondaryButton label={HOME.setPlace()} onPress={() => setAsking(true)} />
        </>
      )}
      <PlaceSheet open={asking} busy={busy} failed={failed} onClose={() => setAsking(false)} onLocate={findPlace} onChooseCity={chooseCity} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  strip: { flexDirection: 'row', gap: space.xs },
  time: { flex: 1, borderRadius: 12, paddingVertical: space.sm, gap: 2 },
});
