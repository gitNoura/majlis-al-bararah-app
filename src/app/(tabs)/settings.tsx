// SETTINGS tab: one page, in the manner of the phone's own Settings: a large title, then each setting under its own name,
// its choices listed right there on a card (the chosen one marked at its end), and a short note under the card when the
// setting needs one. No icons and no drilling into pages: everything can be seen and changed on this one page.
//   Account      the profile (or log in)
//   Appearance   light / night / auto
//   Language     Arabic / English / French
//   Narration    Hafs / Warsh
//   Night mode   the Quran's night mode and its night page
//   Tafsirs, Translations   the ones shown when an ayah is tapped
//   Hijri date   the adjustment
//   Prayer       where the prayer times are for (the phone's location or a city from the list)
// The data and logic are unchanged (theme, language, hijri, prayer, riwaya, sources, nightPage). Saved items stay in their own features.
'use no memo'; // reads saved state (modules) when it draws, which the React Compiler cannot see change
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Glass } from '@/components/home/Glass';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { Chevron, TAB_BAR_H } from '@/components/ui';
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

const label = (s: Source) => (isEnglish ? (isFrench && s.nameFr) || s.nameEn : s.name);
const about = (s: Source) => (isEnglish ? (isFrench && s.aboutFr) || s.aboutEn : s.about);
const chosenIds = () => new Set((tafsirSources() as Source[]).map((s) => s.id));
const LANGUAGES: Record<string, string> = { ar: 'العربية', en: 'English', fr: 'Français' };

// a setting: its name, its card, and the note under the card
function Section({ title, note, children, onLayout }: { title: string; note?: string; children: ReactNode; onLayout?: (e: LayoutChangeEvent) => void }) {
  const k = useSkin();
  return (
    <View style={styles.section} onLayout={onLayout}>
      <Txt size={17} weight={700} lineHeight={24} color={k.ink} style={[lineStart(), styles.heading]}>
        {title}
      </Txt>
      <Glass radius={24} style={styles.card}>
        {children}
      </Glass>
      {!!note && (
        <Txt size={12.5} color={k.meta} style={[lineStart(), styles.note]}>
          {note}
        </Txt>
      )}
    </View>
  );
}

// the mark at a row's end: a round one for "one of these" (filled when chosen), a plain tick for "any of these"
function Mark({ on, kind }: { on: boolean; kind: 'radio' | 'tick' }) {
  const k = useSkin();
  const { isDark } = useTheme();
  const tick = (stroke: string) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
  if (kind === 'tick') return <View style={styles.mark}>{on && tick(k.fill)}</View>;
  return (
    <View style={[styles.mark, styles.radio, on ? { backgroundColor: k.fill, borderColor: k.fill } : { borderColor: k.meta, opacity: 0.55 }]}>{on && tick(isDark ? '#1d1d1d' : '#ffffff')}</View>
  );
}

// a row of a card: its name (and a line under it), what is at its end, a hairline under it
function Line({
  title,
  sub,
  end,
  onPress,
  last,
  role,
  checked,
}: {
  title: string;
  sub?: string;
  end?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  role?: 'radio' | 'checkbox';
  checked?: boolean;
}) {
  const k = useSkin();
  const inside = (
    <>
      <View style={styles.words}>
        <Txt size={16} weight={500} color={k.ink} style={lineStart()}>
          {title}
        </Txt>
        {!!sub && (
          <Txt size={12.5} color={k.meta} style={lineStart()}>
            {sub}
          </Txt>
        )}
      </View>
      {end}
    </>
  );
  return (
    <>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole={role ?? 'button'} accessibilityState={role ? { checked } : undefined} accessibilityLabel={title} style={({ pressed }) => [styles.line, pressed && { opacity: 0.6 }]}>
          {inside}
        </Pressable>
      ) : (
        <View style={styles.line}>{inside}</View>
      )}
      {!last && <View style={[styles.rule, { backgroundColor: k.hairline }]} />}
    </>
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
  const scroll = useRef<ScrollViewInstance>(null);
  const [here, setHere] = useState(place);
  const [cities, setCities] = useState(asked);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shift, setShift] = useState(hijri.adjustment);
  const [chosen, setChosen] = useState(chosenIds);
  const nightPage = useNightPage();
  const sources = SOURCES as Source[];

  const findMe = () => {
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
  const sourceRows = (kind: string) => {
    const rows = sources.filter((s) => (s.kind ?? 'tafsir') === kind);
    return rows.map((s, i) => <Line key={s.id} title={label(s)} sub={about(s)} role="checkbox" checked={chosen.has(s.id)} end={<Mark kind="tick" on={chosen.has(s.id)} />} onPress={() => toggleSource(s.id, !chosen.has(s.id))} last={i === rows.length - 1} />);
  };

  const modes: [ThemeMode, string][] = [
    ['auto', SETTINGS.auto()],
    ['light', SETTINGS.light()],
    ['dark', SETTINGS.dark()],
  ];
  const shifts: [number, string][] = [
    [-1, L('يوم أقل (−١)', 'One day earlier (−1)', 'Un jour plus tôt (−1)')],
    [0, L('بدون تعديل', 'No adjustment', 'Aucun ajustement')],
    [1, L('يوم أكثر (+١)', 'One day later (+1)', 'Un jour plus tard (+1)')],
  ];
  const nights: [string, string][] = [
    ['normal', READER.normalPage()],
    ['dim', READER.dimPage()],
  ];
  const placeNote = failed ? t('calLocateFailed') : here ? t('stPlaceNow', placeName(here) ?? t('calMyLocation'), hijri.countryName(here.country || hijri.calendarCountry())) : SETTINGS.noPlace();

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <HomeBackdrop />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: space.md, paddingTop: insets.top + space.lg, paddingBottom: TAB_BAR_H + insets.bottom + space.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Txt size={32} weight={700} lineHeight={40} color={k.ink} style={lineStart()}>
          {SETTINGS.title()}
        </Txt>

        <Section title={SETTINGS.account()}>
          <Line
            title={signedIn ? (member?.display_name ?? account.user?.email ?? ACCOUNT.title()) : SETTINGS.signIn()}
            sub={signedIn ? (account.user?.email ?? undefined) : SETTINGS.signInSub()}
            end={<Chevron color={k.meta} size={16} />}
            onPress={() => router.push(signedIn ? '/profile' : '/login')}
            last
          />
        </Section>

        <Section title={SETTINGS.appearance()} note={L('التلقائي يتبع مظهر جهازك.', 'Auto follows your device’s appearance.', 'Auto suit l’apparence de votre appareil.')}>
          {modes.map(([m, name], i) => (
            <Line key={m} title={name} role="radio" checked={mode === m} end={<Mark kind="radio" on={mode === m} />} onPress={() => setMode(m)} last={i === modes.length - 1} />
          ))}
        </Section>

        <Section title={SETTINGS.language()}>
          {(['ar', 'en', 'fr'] as const).map((l, i) => (
            <Line key={l} title={LANGUAGES[l]} role="radio" checked={LANG === l} end={<Mark kind="radio" on={LANG === l} />} onPress={() => l !== LANG && changeLanguage(l)} last={i === 2} />
          ))}
        </Section>

        <Section title={READER.riwaya()} note={READER.riwayaSub()}>
          <Line title={READER.hafs()} role="radio" checked={HAFS} end={<Mark kind="radio" on={HAFS} />} onPress={HAFS ? undefined : () => setRiwaya('hafs')} />
          <Line title={READER.warsh()} role="radio" checked={!HAFS} end={<Mark kind="radio" on={!HAFS} />} onPress={HAFS ? () => setRiwaya('warsh') : undefined} last />
        </Section>

        <Section title={READER.night()} note={READER.nightSub()}>
          <Line title={READER.night()} end={<Toggle value={nightOn} onChange={(on) => setQuranMode(on ? 'dark' : 'light')} label={READER.night()} />} last />
        </Section>

        {nightOn && (
          <Section title={READER.nightPage()}>
            {nights.map(([v, name], i) => (
              <Line key={v} title={name} role="radio" checked={nightPage === v} end={<Mark kind="radio" on={nightPage === v} />} onPress={() => setNightPage(v as 'normal' | 'dim')} last={i === nights.length - 1} />
            ))}
          </Section>
        )}

        <Section title={READER.tafsirs()} note={READER.sourcesSub()}>
          {sourceRows('tafsir')}
        </Section>

        <Section title={READER.translations()}>{sourceRows('translation')}</Section>

        <Section title={SETTINGS.hijri()} note={SETTINGS.hijriNote()}>
          <Line title={SETTINGS.today()} end={<Txt size={15} weight={700} color={k.ink}>{today}</Txt>} />
          {shifts.map(([n, name], i) => (
            <Line
              key={n}
              title={name}
              role="radio"
              checked={shift === n}
              end={<Mark kind="radio" on={shift === n} />}
              onPress={() => {
                hijri.setAdjustment(n);
                setShift(n);
              }}
              last={i === shifts.length - 1}
            />
          ))}
        </Section>

        <Section title={SETTINGS.prayer()} note={placeNote} onLayout={asked ? (e) => scroll.current?.scrollTo({ y: Math.max(0, e.nativeEvent.layout.y - space.md), animated: false }) : undefined}>
          <Line title={SETTINGS.myLocation()} role="radio" checked={here?.source === 'gps'} end={locating ? <ActivityIndicator color={c.ctlText} /> : <Mark kind="radio" on={here?.source === 'gps'} />} onPress={locating ? undefined : findMe} />
          <Line
            title={SETTINGS.chooseCity()}
            end={
              <View style={{ transform: [{ rotate: cities ? '90deg' : '0deg' }] }}>
                <Chevron color={k.meta} size={16} />
              </View>
            }
            onPress={() => setCities((v) => !v)}
            last={!cities}
          />
          {cities &&
            shown.map((x, n) => {
              const on = here?.source === 'city' && here.city === x.i;
              return (
                <Line
                  key={x.i}
                  title={x.name}
                  role="radio"
                  checked={on}
                  end={<Mark kind="radio" on={on} />}
                  onPress={() => {
                    chooseCity(x.i);
                    setHere(place());
                    setCities(false);
                  }}
                  last={n === shown.length - 1}
                />
              );
            })}
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  heading: { marginBottom: 10, marginHorizontal: 4 },
  card: { paddingHorizontal: 16, borderCurve: 'continuous', overflow: 'hidden' },
  note: { marginTop: 8, marginHorizontal: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 10 },
  words: { flex: 1, gap: 1 },
  rule: { height: StyleSheet.hairlineWidth },
  mark: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  radio: { borderRadius: 12, borderWidth: 1.5 },
});
