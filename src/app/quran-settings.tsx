// The Quran's settings, a page of its own as in the phone's apps (the website's #quran-settings, and its
// tafsir sources): the Quran's night mode (for the Quran only, as on the website), the narration (Warsh
// or Hafs: the app opens again at the same place), which tafsirs and translations show when an ayah is
// tapped, and - coming - downloading the mushaf, the tafsirs and the translations for reading offline.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, DownloadIcon, MoonIcon, RiwayaIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Row, Section, Tag } from '@/components/SettingsList';
import { Toggle } from '@/components/Toggle';
import { isEnglish, isFrench } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { setNightPage, useNightPage } from '@/lib/nightPage';
import { HAFS, setRiwaya } from '@/lib/riwaya';
import { setSource, SOURCES, tafsirSources } from '@/lib/sources';
import { QuranTheme, useTheme } from '@/theme/theme';

type Source = { id: string; name: string; nameEn: string; nameFr?: string; about: string; aboutEn: string; aboutFr?: string; kind?: string };

const label = (s: Source) => (isEnglish ? (isFrench && s.nameFr) || s.nameEn : s.name);
const about = (s: Source) => (isEnglish ? (isFrench && s.aboutFr) || s.aboutEn : s.about);
const chosenIds = () => new Set((tafsirSources() as Source[]).map((s) => s.id));

export default function QuranSettingsScreen() {
  return (
    <QuranTheme>
      <QuranSettings />
    </QuranTheme>
  );
}

function QuranSettings() {
  const { c, isDark, setQuranMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [chosen, setChosen] = useState(chosenIds);
  const nightPage = useNightPage();
  const sources = SOURCES as Source[];
  const toggle = (id: string, on: boolean) => {
    setSource(id, on);
    setChosen(chosenIds());
  };
  const onOff = (on: boolean, onChange: (on: boolean) => void) => <Toggle value={on} onChange={onChange} />;
  const soon = <Tag label={READER.soonTag()} />;

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={READER.settingsTitle()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28 }}>
        <Section title={READER.appearance()}>
          <Row
            icon={<MoonIcon color={c.ink} size={20} />}
            title={READER.night()}
            sub={READER.nightSub()}
            end={onOff(isDark, (on) => setQuranMode(on ? 'dark' : 'light'))}
            last
          />
        </Section>

        {/* at night: the page as by day, or dimmed */}
        {isDark && (
          <Section title={READER.nightPage()}>
            <Row title={READER.normalPage()} sub={READER.normalPageSub()} end={nightPage === 'normal' && <CheckIcon color={c.on} />} onPress={() => setNightPage('normal')} />
            <Row title={READER.dimPage()} sub={READER.dimPageSub()} end={nightPage === 'dim' && <CheckIcon color={c.on} />} onPress={() => setNightPage('dim')} last />
          </Section>
        )}

        <Section title={READER.riwaya()} note={READER.riwayaSub()}>
          <Row
            icon={<RiwayaIcon color={c.ink} size={20} />}
            title={READER.warsh()}
            end={!HAFS && <CheckIcon color={c.on} />}
            onPress={HAFS ? () => setRiwaya('warsh') : undefined}
          />
          <Row
            icon={<RiwayaIcon color={c.ink} size={20} />}
            title={READER.hafs()}
            end={HAFS && <CheckIcon color={c.on} />}
            onPress={HAFS ? undefined : () => setRiwaya('hafs')}
            last
          />
        </Section>

        <Section title={READER.tafsirs()} note={READER.sourcesSub()}>
          {sources
            .filter((s) => (s.kind ?? 'tafsir') === 'tafsir')
            .map((s, i, all) => (
              <Row key={s.id} title={label(s)} sub={about(s)} end={onOff(chosen.has(s.id), (on) => toggle(s.id, on))} last={i === all.length - 1} />
            ))}
        </Section>

        <Section title={READER.translations()}>
          {sources
            .filter((s) => s.kind === 'translation')
            .map((s, i, all) => (
              <Row key={s.id} title={label(s)} sub={about(s)} end={onOff(chosen.has(s.id), (on) => toggle(s.id, on))} last={i === all.length - 1} />
            ))}
        </Section>

        <Section title={READER.downloads()}>
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlMushaf()} end={soon} quiet />
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlTafsir()} end={soon} quiet />
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlTranslations()} end={soon} quiet last />
        </Section>
      </ScrollView>
    </View>
  );
}
