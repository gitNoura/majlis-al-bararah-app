// SETTINGS tab: the one place for every setting, one screen of cards:
//   Account     the profile (or log in)
//   General     language, theme (light / night / auto), the Hijri date's adjustment
//   Prayer      where the prayer times are for (the phone's location or a city from the list)
//   Quran       night mode and the night page, narration (Warsh / Hafs), the tafsirs and translations shown on an ayah
// It replaces the old settings page, the Quran's settings page and the place sheet's second home. The data and logic are
// unchanged (theme, language, hijri, prayer, riwaya, sources, nightPage). Saved items stay in their own features.
'use no memo'; // reads saved state (modules) when it draws, which the React Compiler cannot see change
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_H } from '@/components/ui/TabBar';

import { ScreenBackground } from '@/components/Stars';
import { Avatar } from '@/components/Avatar';
import { CheckIcon } from '@/components/icons';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { Card, Row, SegmentedControl } from '@/components/ui';
import { ACCOUNT } from '@/i18n/account';
import { LANG, isEnglish, isFrench, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { SETTINGS } from '@/i18n/settings';
import { useAccount } from '@/lib/account';
import * as hijri from '@/lib/hijri';
import { changeLanguage } from '@/lib/language';
import { setNightPage, useNightPage } from '@/lib/nightPage';
import { chooseCity, cityChoices, locate, place, placeName } from '@/lib/prayer';
import { HAFS, setRiwaya } from '@/lib/riwaya';
import { setSource, SOURCES, tafsirSources } from '@/lib/sources';
import { useTheme, type ThemeMode } from '@/theme/theme';
import { space } from '@/theme/tokens';

type City = { i: number; name: string; country: string | number };
type Source = { id: string; name: string; nameEn: string; nameFr?: string; about: string; aboutEn: string; aboutFr?: string; kind?: string };

const label = (s: Source) => (isEnglish ? (isFrench && s.nameFr) || s.nameEn : s.name);
const about = (s: Source) => (isEnglish ? (isFrench && s.aboutFr) || s.aboutEn : s.about);
const chosenIds = () => new Set((tafsirSources() as Source[]).map((s) => s.id));

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space.sm }}>
      <Txt size={13} weight={700} color={c.meta}>
        {title}
      </Txt>
      <Card style={{ paddingVertical: space.xs, gap: 0 }}>{children}</Card>
      {!!note && (
        <Txt size={12.5} color={c.meta}>
          {note}
        </Txt>
      )}
    </View>
  );
}

export default function SettingsTab() {
  const { c, isDark, mode, setMode, quranMode, setQuranMode } = useTheme();
  const insets = useSafeAreaInsets();
  const account = useAccount();
  const member = account.profile ?? account.cached;
  const signedIn = !!(account.user || member);

  const [here, setHere] = useState(place);
  const asked = useLocalSearchParams<{ cities?: string }>().cities === '1'; // Home / qibla ask to choose a city
  const [cities, setCities] = useState(asked);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shift, setShift] = useState(hijri.adjustment);
  const [chosen, setChosen] = useState(chosenIds);
  const nightPage = useNightPage();
  const sources = SOURCES as Source[];

  const where = here ? t('stPlaceNow', placeName(here) ?? t('calMyLocation'), hijri.countryName(here.country || hijri.calendarCountry())) : SETTINGS.noPlace();
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
  // the member's country's cities first, the others if that country has none
  const list: City[] = cityChoices();
  const near = list.filter((x) => x.country === hijri.calendarCountry());
  const shown = near.length ? near : list;
  const today = (() => {
    try {
      const h = hijri.hijri(hijri.noon(new Date()));
      return `${h.d} ${hijri.monthName(h.m)} ${h.y}`;
    } catch {
      return '';
    }
  })();
  const toggleSource = (id: string, on: boolean) => {
    setSource(id, on);
    setChosen(chosenIds());
  };
  const nightOn = quranMode ? quranMode === 'dark' : isDark;
  const sourceRows = (kind: string) =>
    sources
      .filter((s) => (s.kind ?? 'tafsir') === kind)
      .map((s, i, all) => <Row key={s.id} title={label(s)} sub={about(s)} end={<Toggle value={chosen.has(s.id)} onChange={(on) => toggleSource(s.id, on)} />} last={i === all.length - 1} />);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.lg, paddingBottom: TAB_BAR_H + insets.bottom + space.md, gap: space.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Txt size={30} weight={800} lineHeight={40} color={c.ink}>
          {SETTINGS.title()}
        </Txt>

        <Group title={SETTINGS.account()}>
          <Row
            icon={<Avatar name={member?.display_name} size={36} />}
            title={signedIn ? (member?.display_name ?? account.user?.email ?? ACCOUNT.title()) : SETTINGS.signIn()}
            sub={signedIn ? (account.user?.email ?? undefined) : SETTINGS.signInSub()}
            chevron
            onPress={() => router.push(signedIn ? '/profile' : '/login')}
            last
          />
        </Group>

        <Group title={SETTINGS.general()}>
          <View style={styles.block}>
            <Txt size={13} color={c.meta}>
              {SETTINGS.language()}
            </Txt>
            <SegmentedControl<string>
              value={LANG}
              onChange={(l) => l !== LANG && changeLanguage(l as 'ar' | 'en' | 'fr')}
              options={[
                { value: 'ar', label: 'العربية' },
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
              ]}
            />
          </View>
          <View style={styles.block}>
            <Txt size={13} color={c.meta}>
              {SETTINGS.appearance()}
            </Txt>
            <SegmentedControl<ThemeMode>
              value={mode}
              onChange={setMode}
              options={[
                { value: 'light', label: SETTINGS.light() },
                { value: 'dark', label: SETTINGS.dark() },
                { value: 'auto', label: SETTINGS.auto() },
              ]}
            />
          </View>
          <View style={styles.block}>
            <View style={styles.between}>
              <Txt size={13} color={c.meta}>
                {SETTINGS.hijri()}
              </Txt>
              <Txt size={14} weight={700} color={c.ink}>
                {today}
              </Txt>
            </View>
            <SegmentedControl<number>
              value={shift}
              onChange={(n) => {
                hijri.setAdjustment(n);
                setShift(n);
              }}
              options={[
                { value: -1, label: '−1' },
                { value: 0, label: '0' },
                { value: 1, label: '+1' },
              ]}
            />
            <Txt size={12.5} color={c.meta}>
              {SETTINGS.hijriNote()}
            </Txt>
          </View>
        </Group>

        <Group title={SETTINGS.prayer()} note={failed ? t('calLocateFailed') : undefined}>
          <Row title={where} />
          <Row
            title={SETTINGS.myLocation()}
            end={locating ? <ActivityIndicator color={c.ctlText} /> : here?.source === 'gps' ? <CheckIcon color={c.ctlText} /> : undefined}
            chevron={!locating && here?.source !== 'gps'}
            onPress={locating ? undefined : useLocation}
          />
          <Row title={SETTINGS.chooseCity()} chevron onPress={() => setCities((v) => !v)} last={!cities} />
          {cities &&
            shown.map((x, k) => (
              <Pressable
                key={x.i}
                onPress={() => {
                  chooseCity(x.i);
                  setHere(place());
                  setCities(false);
                }}
                style={({ pressed }) => [styles.city, k < shown.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }, pressed && { opacity: 0.6 }]}
              >
                <Txt size={15} color={c.text} style={{ flex: 1 }}>
                  {x.name}
                </Txt>
                {here?.source === 'city' && here.city === x.i && <CheckIcon color={c.ctlText} size={18} />}
              </Pressable>
            ))}
        </Group>

        <Group title={SETTINGS.quranSection()}>
          <Row title={READER.night()} sub={READER.nightSub()} end={<Toggle value={nightOn} onChange={(on) => setQuranMode(on ? 'dark' : 'light')} />} last={!nightOn} />
          {nightOn && (
            <View style={styles.block}>
              <Txt size={13} color={c.meta}>
                {READER.nightPage()}
              </Txt>
              <SegmentedControl<string>
                value={nightPage}
                onChange={(v) => setNightPage(v as 'normal' | 'dim')}
                options={[
                  { value: 'normal', label: READER.normalPage() },
                  { value: 'dim', label: READER.dimPage() },
                ]}
              />
            </View>
          )}
        </Group>

        <Group title={READER.riwaya()} note={READER.riwayaSub()}>
          <Row title={READER.warsh()} end={!HAFS && <CheckIcon color={c.ctlText} />} onPress={HAFS ? () => setRiwaya('warsh') : undefined} />
          <Row title={READER.hafs()} end={HAFS && <CheckIcon color={c.ctlText} />} onPress={HAFS ? undefined : () => setRiwaya('hafs')} last />
        </Group>

        <Group title={READER.tafsirs()} note={READER.sourcesSub()}>
          {sourceRows('tafsir')}
        </Group>
        <Group title={READER.translations()}>{sourceRows('translation')}</Group>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.sm, paddingVertical: space.sm + 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  city: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
});
