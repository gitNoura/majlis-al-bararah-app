// The Display sheet (Read mode's tool): the Quran's night mode (and, at night, the page's dimming), the narration
// (Warsh / Hafs: the app reopens on the same page), and which tafsirs and translations show when an ayah is tapped.
import { useState } from 'react';

import { CheckIcon } from '@/components/icons';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { Card, Row, SegmentedControl, Sheet } from '@/components/ui';
import { isEnglish, isFrench } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { setNightPage, useNightPage } from '@/lib/nightPage';
import { HAFS, setRiwaya } from '@/lib/riwaya';
import { setSource, SOURCES, tafsirSources } from '@/lib/sources';
import { useTheme } from '@/theme/theme';

type Source = { id: string; name: string; nameEn: string; nameFr?: string; about: string; aboutEn: string; aboutFr?: string; kind?: string };

const label = (s: Source) => (isEnglish ? (isFrench && s.nameFr) || s.nameEn : s.name);
const about = (s: Source) => (isEnglish ? (isFrench && s.aboutFr) || s.aboutEn : s.about);
const chosenIds = () => new Set((tafsirSources() as Source[]).map((s) => s.id));

export function DisplaySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c, isDark, setQuranMode } = useTheme();
  const nightPage = useNightPage();
  const [chosen, setChosen] = useState(chosenIds);
  const sources = SOURCES as Source[];
  const toggle = (id: string, on: boolean) => {
    setSource(id, on);
    setChosen(chosenIds());
  };
  const group = (kind: 'tafsir' | 'translation') => sources.filter((s) => (s.kind ?? 'tafsir') === kind);
  const heading = (text: string) => (
    <Txt size={13} weight={700} color={c.meta} style={{ marginTop: 8 }}>
      {text}
    </Txt>
  );
  const sourceRows = (list: Source[]) => (
    <Card style={{ paddingVertical: 4 }}>
      {list.map((s, i) => (
        <Row key={s.id} title={label(s)} sub={about(s)} end={<Toggle value={chosen.has(s.id)} onChange={(on) => toggle(s.id, on)} />} last={i === list.length - 1} />
      ))}
    </Card>
  );

  return (
    <Sheet open={open} onClose={onClose} title={QURAN.display()}>
      <Card style={{ paddingVertical: 4 }}>
        <Row title={READER.night()} sub={READER.nightSub()} end={<Toggle value={isDark} onChange={(on) => setQuranMode(on ? 'dark' : 'light')} />} last={!isDark} />
        {isDark && (
          <>
            <Row title={READER.normalPage()} sub={READER.normalPageSub()} end={nightPage === 'normal' && <CheckIcon color={c.accent} />} onPress={() => setNightPage('normal')} />
            <Row title={READER.dimPage()} sub={READER.dimPageSub()} end={nightPage === 'dim' && <CheckIcon color={c.accent} />} onPress={() => setNightPage('dim')} last />
          </>
        )}
      </Card>

      {heading(READER.riwaya())}
      <SegmentedControl
        value={HAFS ? 'hafs' : 'warsh'}
        options={[
          { value: 'warsh', label: READER.warsh() },
          { value: 'hafs', label: READER.hafs() },
        ]}
        onChange={(v) => {
          if ((v === 'hafs') !== HAFS) setRiwaya(v);
        }}
      />
      <Txt size={12.5} color={c.meta}>
        {READER.riwayaSub()}
      </Txt>

      {heading(READER.tafsirs())}
      {sourceRows(group('tafsir'))}
      {heading(READER.translations())}
      {sourceRows(group('translation'))}
    </Sheet>
  );
}
