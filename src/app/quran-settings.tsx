// The Quran's own settings, a page of its own (opened from the settings button on the Quran page): the Quran's night
// mode and the night page (for the Quran only), the narration (Warsh or Hafs: the app opens again at the same place),
// which tafsirs and translations show when an ayah is tapped, and - coming - downloads for reading offline.
// The app's settings (language, theme, prayer, account) are in the Settings tab, not here.
'use no memo'; // reads saved state (modules) when it draws, which the React Compiler cannot see change
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, DownloadIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { Card, Row, SegmentedControl } from '@/components/ui';
import { isEnglish, isFrench, LANG } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { setNightPage, useNightPage } from '@/lib/nightPage';
import { HAFS, setRiwaya } from '@/lib/riwaya';
import { setSource, SOURCES, tafsirSources } from '@/lib/sources';
import { QuranTheme, useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

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
  const toggleSource = (id: string, on: boolean) => {
    setSource(id, on);
    setChosen(chosenIds());
  };
  const sourceRows = (kind: string) =>
    sources
      .filter((s) => (s.kind ?? 'tafsir') === kind)
      .map((s, i, all) => <Row key={s.id} title={label(s)} sub={about(s)} end={<Toggle value={chosen.has(s.id)} onChange={(on) => toggleSource(s.id, on)} />} last={i === all.length - 1} />);
  const soon = (
    <Txt size={12} weight={700} color={c.meta}>
      {READER.soonTag()}
    </Txt>
  );

  return (
    // the page's own direction (right to left in Arabic), so it never falls back to left to right
    <View style={[{ flex: 1, backgroundColor: c.screen }, Platform.OS !== 'web' && { direction: LANG === 'ar' ? 'rtl' : 'ltr' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={READER.settingsTitle()} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: insets.bottom + space.lg, gap: space.lg }}>
        <Group title={READER.appearance()}>
          <Row title={READER.night()} sub={READER.nightSub()} end={<Toggle value={isDark} onChange={(on) => setQuranMode(on ? 'dark' : 'light')} />} last={!isDark} />
          {isDark && (
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

        <Group title={READER.downloads()}>
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlMushaf()} end={soon} quiet />
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlTafsir()} end={soon} quiet />
          <Row icon={<DownloadIcon color={c.meta} size={20} />} title={READER.dlTranslations()} end={soon} quiet last />
        </Group>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.sm, paddingVertical: space.sm + 4 },
});
