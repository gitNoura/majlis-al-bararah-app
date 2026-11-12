// SETTINGS tab: one grouped list, like the phone's own Settings: a large title, then groups of white rows, each with a small line
// icon, its name, its present value and an arrow. A row opens its own page inside this tab (the same back button as the Hifdh pages):
//   Account      the profile (or log in)
//   Narration    Hafs / Warsh
//   Quran        the Quran's night mode and its night page, the tafsirs and the translations shown on an ayah
//   Appearance   light / night / auto, the language, the Hijri date's adjustment
//   Prayer       where the prayer times are for (the phone's location or a city from the list)
// The data and logic are unchanged (theme, language, hijri, prayer, riwaya, sources, nightPage). Saved items stay in their own features.
'use no memo'; // reads saved state (modules) when it draws, which the React Compiler cannot see change
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { HifHeader } from '@/components/hifdh/HifHeader';
import { Glass } from '@/components/home/Glass';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { BookIcon, CalendarIcon, CheckIcon, ClockIcon, ContrastIcon, LanguageIcon, MoonIcon, RiwayaIcon, TafsirIcon } from '@/components/icons';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { Chevron, Row, SegmentedControl, TAB_BAR_H } from '@/components/ui';
import { ACCOUNT } from '@/i18n/account';
import { L, LANG, isEnglish, isFrench, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { SETTINGS } from '@/i18n/settings';
import { useAccount } from '@/lib/account';
import * as hijri from '@/lib/hijri';
import { changeLanguage } from '@/lib/language';
import { setNightPage, useNightPage } from '@/lib/nightPage';
import { chooseCity, cityChoices, locate, place, placeName } from '@/lib/prayer';
import { HAFS, setRiwaya } from '@/lib/riwaya';
import { setSource, SOURCES, tafsirSources } from '@/lib/sources';
import { useSkin } from '@/theme/homeSkin';
import { lineStart } from '@/theme/ltr';
import { useTheme, type ThemeMode } from '@/theme/theme';
import { space } from '@/theme/tokens';

type City = { i: number; name: string; country: string | number };
type Source = { id: string; name: string; nameEn: string; nameFr?: string; about: string; aboutEn: string; aboutFr?: string; kind?: string };
type Page = null | 'riwaya' | 'appearance' | 'language' | 'hijri' | 'prayer' | 'night' | 'tafsirs' | 'translations';

const label = (s: Source) => (isEnglish ? (isFrench && s.nameFr) || s.nameEn : s.name);
const about = (s: Source) => (isEnglish ? (isFrench && s.aboutFr) || s.aboutEn : s.about);
const chosenIds = () => new Set((tafsirSources() as Source[]).map((s) => s.id));
const LANGUAGES: Record<string, string> = { ar: 'العربية', en: 'English', fr: 'Français' };

// a group: one lit glass card holding its rows
function Group({ children }: { children: ReactNode }) {
  return (
    <Glass radius={26} style={styles.group}>
      {children}
    </Glass>
  );
}

// a row of the list: a line icon, the name, the present value, the arrow; a hairline under it that starts after the icon
function Item({ icon, title, sub, value, onPress, last }: { icon: ReactNode; title: string; sub?: string; value?: string; onPress: () => void; last?: boolean }) {
  const k = useSkin();
  return (
    <>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
        <View style={styles.iconBox}>{icon}</View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt size={16.5} weight={500} color={k.ink} style={lineStart()} numberOfLines={1}>
            {title}
          </Txt>
          {!!sub && (
            <Txt size={12.5} color={k.meta} style={lineStart()} numberOfLines={1}>
              {sub}
            </Txt>
          )}
        </View>
        {!!value && (
          <Txt size={15} color={k.meta} numberOfLines={1} style={styles.value}>
            {value}
          </Txt>
        )}
        <Chevron color={k.meta} size={16} />
      </Pressable>
      {!last && <View style={[styles.line, { backgroundColor: k.hairline }]} />}
    </>
  );
}

// a page opened from the list: the back button and its name at the top, its content under it
function Detail({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <HifHeader title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: TAB_BAR_H + insets.bottom + space.md, gap: space.md }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

function Note({ children }: { children: string }) {
  const k = useSkin();
  return (
    <Txt size={12.5} color={k.meta} style={[lineStart(), { marginHorizontal: 8 }]}>
      {children}
    </Txt>
  );
}

export default function SettingsTab() {
  const { c, isDark, mode, setMode, quranMode, setQuranMode } = useTheme();
  const k = useSkin();
  const insets = useSafeAreaInsets();
  const account = useAccount();
  const member = account.profile ?? account.cached;
  const signedIn = !!(account.user || member);

  const asked = useLocalSearchParams<{ cities?: string }>().cities === '1'; // Home / qibla ask to choose a city
  const [page, setPage] = useState<Page>(asked ? 'prayer' : null);
  const [here, setHere] = useState(place);
  const [cities, setCities] = useState(asked);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shift, setShift] = useState(hijri.adjustment);
  const [chosen, setChosen] = useState(chosenIds);
  const nightPage = useNightPage();
  const sources = SOURCES as Source[];

  // the phone's back button closes a page before it leaves the tab
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!page) return false;
        setPage(null);
        return true;
      });
      return () => sub.remove();
    }, [page]),
  );

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
  const rowsOf = (kind: string) => sources.filter((s) => (s.kind ?? 'tafsir') === kind);
  const countOf = (kind: string) => String(rowsOf(kind).filter((s) => chosen.has(s.id)).length);
  const sourceRows = (kind: string) =>
    rowsOf(kind).map((s, i, all) => <Row key={s.id} title={label(s)} sub={about(s)} end={<Toggle value={chosen.has(s.id)} onChange={(on) => toggleSource(s.id, on)} />} last={i === all.length - 1} />);

  const modeName = { light: SETTINGS.light(), dark: SETTINGS.dark(), auto: SETTINGS.auto() }[mode];
  const riwayaName = HAFS ? L('حفص', 'Hafs', 'Hafs') : L('ورش', 'Warsh', 'Warsh');
  const where = here ? (placeName(here) ?? t('calMyLocation')) : SETTINGS.noPlace();
  const tick = <CheckIcon color={k.accent} />;
  const ico = (Icon: typeof ClockIcon) => <Icon color={k.accent} size={23} />;
  const back = () => setPage(null);

  const detail = () => {
    switch (page) {
      case 'riwaya':
        return (
          <Detail title={READER.riwaya()} onBack={back}>
            <Group>
              <Row title={READER.hafs()} end={HAFS ? tick : undefined} onPress={HAFS ? undefined : () => setRiwaya('hafs')} />
              <Row title={READER.warsh()} end={!HAFS ? tick : undefined} onPress={HAFS ? () => setRiwaya('warsh') : undefined} last />
            </Group>
            <Note>{READER.riwayaSub()}</Note>
          </Detail>
        );
      case 'appearance':
        return (
          <Detail title={SETTINGS.appearance()} onBack={back}>
            <Group>
              {(['light', 'dark', 'auto'] as ThemeMode[]).map((m, i) => (
                <Row key={m} title={{ light: SETTINGS.light(), dark: SETTINGS.dark(), auto: SETTINGS.auto() }[m]} end={mode === m ? tick : undefined} onPress={() => setMode(m)} last={i === 2} />
              ))}
            </Group>
          </Detail>
        );
      case 'language':
        return (
          <Detail title={SETTINGS.language()} onBack={back}>
            <Group>
              {(['ar', 'en', 'fr'] as const).map((l, i) => (
                <Row key={l} title={LANGUAGES[l]} end={LANG === l ? tick : undefined} onPress={() => l !== LANG && changeLanguage(l)} last={i === 2} />
              ))}
            </Group>
          </Detail>
        );
      case 'hijri':
        return (
          <Detail title={SETTINGS.hijri()} onBack={back}>
            <Group>
              <View style={styles.block}>
                <View style={styles.between}>
                  <Txt size={13} color={k.meta}>
                    {SETTINGS.today()}
                  </Txt>
                  <Txt size={15} weight={700} color={k.ink}>
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
              </View>
            </Group>
            <Note>{SETTINGS.hijriNote()}</Note>
          </Detail>
        );
      case 'prayer':
        return (
          <Detail title={SETTINGS.prayer()} onBack={back}>
            <Group>
              <Row title={SETTINGS.myLocation()} end={locating ? <ActivityIndicator color={c.ctlText} /> : here?.source === 'gps' ? tick : undefined} onPress={locating ? undefined : useLocation} />
              <Row title={SETTINGS.chooseCity()} chevron onPress={() => setCities((v) => !v)} last={!cities} />
              {cities &&
                shown.map((x, n) => (
                  <Pressable
                    key={x.i}
                    onPress={() => {
                      chooseCity(x.i);
                      setHere(place());
                      setCities(false);
                    }}
                    style={({ pressed }) => [styles.city, n < shown.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }, pressed && { opacity: 0.6 }]}
                  >
                    <Txt size={15} color={k.ink} style={{ flex: 1 }}>
                      {x.name}
                    </Txt>
                    {here?.source === 'city' && here.city === x.i && tick}
                  </Pressable>
                ))}
            </Group>
            <Note>{failed ? t('calLocateFailed') : here ? t('stPlaceNow', placeName(here) ?? t('calMyLocation'), hijri.countryName(here.country || hijri.calendarCountry())) : SETTINGS.noPlace()}</Note>
          </Detail>
        );
      case 'night':
        return (
          <Detail title={READER.night()} onBack={back}>
            <Group>
              <Row title={READER.night()} sub={READER.nightSub()} end={<Toggle value={nightOn} onChange={(on) => setQuranMode(on ? 'dark' : 'light')} />} last={!nightOn} />
              {nightOn && (
                <View style={styles.block}>
                  <Txt size={13} color={k.meta}>
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
          </Detail>
        );
      case 'tafsirs':
        return (
          <Detail title={READER.tafsirs()} onBack={back}>
            <Group>{sourceRows('tafsir')}</Group>
            <Note>{READER.sourcesSub()}</Note>
          </Detail>
        );
      case 'translations':
        return (
          <Detail title={READER.translations()} onBack={back}>
            <Group>{sourceRows('translation')}</Group>
          </Detail>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <HomeBackdrop />
      {page ? (
        detail()
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.lg, paddingBottom: TAB_BAR_H + insets.bottom + space.md, gap: 22 }} keyboardShouldPersistTaps="handled">
          <Txt size={32} weight={700} lineHeight={40} color={k.ink} style={{ marginBottom: 4 }}>
            {SETTINGS.title()}
          </Txt>

          <Group>
            <Item
              icon={<Avatar name={member?.display_name} size={30} />}
              title={signedIn ? (member?.display_name ?? account.user?.email ?? ACCOUNT.title()) : SETTINGS.signIn()}
              sub={signedIn ? (account.user?.email ?? undefined) : SETTINGS.signInSub()}
              onPress={() => router.push(signedIn ? '/profile' : '/login')}
              last
            />
          </Group>

          <Group>
            <Item icon={ico(RiwayaIcon)} title={READER.riwaya()} value={riwayaName} onPress={() => setPage('riwaya')} last />
          </Group>

          <Group>
            <Item icon={ico(MoonIcon)} title={READER.night()} value={nightOn ? L('مفعّل', 'On', 'Activé') : L('معطّل', 'Off', 'Désactivé')} onPress={() => setPage('night')} />
            <Item icon={ico(TafsirIcon)} title={READER.tafsirs()} value={countOf('tafsir')} onPress={() => setPage('tafsirs')} />
            <Item icon={ico(BookIcon)} title={READER.translations()} value={countOf('translation')} onPress={() => setPage('translations')} last />
          </Group>

          <Group>
            <Item icon={ico(ContrastIcon)} title={SETTINGS.appearance()} value={modeName} onPress={() => setPage('appearance')} />
            <Item icon={ico(LanguageIcon)} title={SETTINGS.language()} value={LANGUAGES[LANG]} onPress={() => setPage('language')} />
            <Item icon={ico(CalendarIcon)} title={SETTINGS.hijri()} value={`${shift > 0 ? '+' : ''}${shift}`} onPress={() => setPage('hijri')} last />
          </Group>

          <Group>
            <Item icon={ico(ClockIcon)} title={SETTINGS.prayer()} value={where} onPress={() => setPage('prayer')} last />
          </Group>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: 16, borderCurve: 'continuous', overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 58, paddingVertical: 10 },
  iconBox: { width: 26, alignItems: 'center', justifyContent: 'center' },
  value: { maxWidth: '45%', textAlign: 'right' },
  line: { height: StyleSheet.hairlineWidth, marginStart: 40 },
  block: { gap: space.sm, paddingVertical: space.sm + 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  city: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
});
