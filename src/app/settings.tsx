// The app's settings, a page of its own (the website's #settings): day, night or the phone's own; the
// language; where the prayer times are for (the phone's location, or a city chosen from the list); the
// Hijri date a day earlier or later when one's country announced the month apart; the way to the
// Quran's own settings; and - coming - sending feedback.
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon, BookOpenIcon, CheckIcon, ClockIcon, CommentIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Row, Section, Segments, Tag } from '@/components/SettingsList';
import { Txt } from '@/components/Txt';
import { isEnglish, LANG, t } from '@/i18n/i18n';
import { SETTINGS } from '@/i18n/settings';
import * as hijri from '@/lib/hijri';
import { changeLanguage } from '@/lib/language';
import { chooseCity, cityChoices, locate, place, placeName } from '@/lib/prayer';
import { useTheme, type ThemeMode } from '@/theme/theme';

type City = { i: number; name: string; country: string | number };

export default function Settings() {
  const { c, isDark, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [here, setHere] = useState(place);
  // the list of cities open (at once when the home screen asks to choose a city)
  const asked = useLocalSearchParams<{ cities?: string }>().cities === '1';
  const [cities, setCities] = useState(asked);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shift, setShift] = useState(hijri.adjustment);

  const where = here
    ? t('stPlaceNow', placeName(here) ?? t('calMyLocation'), hijri.countryName(here.country || hijri.calendarCountry()))
    : SETTINGS.noPlace();
  const useLocation = () => {
    setLocating(true);
    setFailed(false);
    locate()
      .then((p) => setHere(p))
      .catch(() => {
        setFailed(true);
        setCities(true);
      })
      .finally(() => setLocating(false));
  };
  // the member's country's cities first (cityChoices), the others after
  const country = hijri.calendarCountry();
  const list: City[] = cityChoices();
  const near = list.filter((x) => x.country === country);
  const shown = near.length ? near : list;
  const today = (() => {
    try {
      const h = hijri.hijri(hijri.noon(new Date()));
      return `${h.d} ${hijri.monthName(h.m)} ${h.y}`;
    } catch {
      return '';
    }
  })();
  const arrow = <BackIcon color={c.meta} size={18} rtl={isEnglish} />;

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={SETTINGS.title()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28 }}>
        <Section title={SETTINGS.appearance()}>
          <Segments<ThemeMode>
            value={mode}
            onChange={setMode}
            options={[
              ['light', SETTINGS.light()],
              ['dark', SETTINGS.dark()],
              ['auto', SETTINGS.auto()],
            ]}
          />
        </Section>

        <Section title={SETTINGS.language()}>
          {(
            [
              ['ar', 'العربية'],
              ['en', 'English'],
              ['fr', 'Français'],
            ] as const
          ).map(([lang, name], i) => (
            <Row key={lang} title={name} end={LANG === lang && <CheckIcon color={c.on} />} onPress={LANG === lang ? undefined : () => changeLanguage(lang)} last={i === 2} />
          ))}
        </Section>

        <Section title={SETTINGS.place()} note={failed ? t('calLocateFailed') : undefined}>
          <Row icon={<ClockIcon color={c.ink} size={20} />} title={where} />
          <Row
            title={SETTINGS.myLocation()}
            end={locating ? <ActivityIndicator color={c.gold} /> : here?.source === 'gps' ? <CheckIcon color={c.on} /> : arrow}
            onPress={locating ? undefined : useLocation}
          />
          <Row title={SETTINGS.chooseCity()} end={arrow} onPress={() => setCities((v) => !v)} last={!cities} />
          {cities &&
            shown.map((x, k) => (
              <Pressable
                key={x.i}
                onPress={() => {
                  chooseCity(x.i);
                  setHere(place());
                  setCities(false);
                }}
                style={({ pressed }) => [
                  styles.city,
                  k < shown.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Txt size={15} color={c.text} style={{ flex: 1 }}>
                  {x.name}
                </Txt>
                {here?.source === 'city' && here.city === x.i && <CheckIcon color={c.on} size={18} />}
              </Pressable>
            ))}
        </Section>

        <Section title={SETTINGS.hijri()} note={SETTINGS.hijriNote()}>
          <View style={styles.hijri}>
            <Txt size={14} color={c.meta}>
              {SETTINGS.today()}
            </Txt>
            <Txt size={16} weight={700} color={c.ink}>
              {today}
            </Txt>
          </View>
          <Segments<number>
            value={shift}
            onChange={(n) => {
              hijri.setAdjustment(n);
              setShift(n);
            }}
            options={[
              [-1, '−1'],
              [0, '0'],
              [1, '+1'],
            ]}
          />
        </Section>

        <Section title={SETTINGS.quranGroup()}>
          <Row icon={<BookOpenIcon color={c.ink} size={20} />} title={SETTINGS.quran()} sub={SETTINGS.quranSub()} end={arrow} onPress={() => router.push('/quran-settings')} last />
        </Section>

        <Section title={SETTINGS.feedback()}>
          <Row icon={<CommentIcon color={c.meta} size={20} />} title={SETTINGS.sendFeedback()} end={<Tag label={SETTINGS.soon()} />} quiet last />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  city: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  hijri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 },
});
