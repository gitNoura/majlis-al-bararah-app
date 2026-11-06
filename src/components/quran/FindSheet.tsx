// The Find sheet: ONE place to get to a page. Surah / Juz / Hizb tabs, and one field that takes a name, words of an
// ayah, or a reference like 2:255 (the website's text search, src/lib/search.js). A row or a result opens its page; a
// result also lights its ayah for a moment.
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckIcon, CloseIcon, SearchIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Card, Row, SegmentedControl, Sheet } from '@/components/ui';
import { isEnglish, surahTitle, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { pageOf } from '@/lib/boxes';
import { current, filterItems, type Tab } from '@/lib/find';
import { SURAHS } from '@/lib/quran';
import { loadSearch, pieces, search } from '@/lib/search';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Entry = { s: number; a: number; text: string };
type Match = { entry: Entry; ranges: number[][] };
type Piece = { text: string; mark: boolean };

const SHOWN = 30; // the most ayat listed (the sheet draws them all at once)

type Props = { open: boolean; page: number; onClose: () => void; onGo: (page: number, ayah: { s: number; a: number } | null) => void };

export function FindSheet({ open, page, onClose, onGo }: Props) {
  const { c, isDark } = useTheme();
  const [tab, setTab] = useState<Tab>('surahs');
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    if (!open) return;
    loadSearch()
      .then(() => setState('ready'))
      .catch(() => setState('failed'));
  }, [open]);

  const q = query.trim();
  const rows = filterItems(tab, q);
  const found = q && state === 'ready' ? search(q) : null;
  const matches: Match[] = found && found.kind !== 'help' ? found.matches.slice(0, SHOWN) : [];
  const here = current(tab, page);

  const go = (target: number, ayah: { s: number; a: number } | null) => {
    onClose();
    onGo(target, ayah);
  };

  return (
    <Sheet open={open} onClose={onClose} title={QURAN.find()}>
      <SegmentedControl
        value={tab}
        options={[
          { value: 'surahs' as Tab, label: QURAN.tabSurah() },
          { value: 'ajza' as Tab, label: QURAN.tabJuz() },
          { value: 'ahzab' as Tab, label: QURAN.tabHizb() },
        ]}
        onChange={setTab}
      />

      <View style={[styles.field, { backgroundColor: c.surface2, borderColor: c.line }]}>
        <SearchIcon color={c.meta} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={QURAN.findField()}
          placeholderTextColor={c.meta}
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => matches[0] && go(pageOf(matches[0].entry.s, matches[0].entry.a) ?? SURAHS[matches[0].entry.s - 1].page, { s: matches[0].entry.s, a: matches[0].entry.a })}
          style={[styles.input, { color: c.ink, fontFamily: ui(500), textAlign: isEnglish && !/[؀-ۿ]/.test(query) ? 'left' : 'right' }]}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={QURAN.find()}>
            <CloseIcon color={c.meta} size={18} />
          </Pressable>
        )}
      </View>

      {!!rows.length && (
        <Card style={{ paddingVertical: 4 }}>
          {rows.map((item, i) => (
            <Row
              key={item.number}
              title={item.title}
              sub={item.other || item.sub || undefined}
              end={
                <>
                  <Txt size={13} color={c.pageNum}>
                    {t('pageShort', item.page)}
                  </Txt>
                  {item.number === here && <CheckIcon color={c.accent} size={18} />}
                </>
              }
              onPress={() => go(item.page, null)}
              last={i === rows.length - 1}
            />
          ))}
        </Card>
      )}

      {!!q && state === 'loading' && (
        <View style={styles.middle}>
          <ActivityIndicator color={c.accent} />
          <Txt size={13} color={c.meta}>
            {QURAN.loadingSearch()}
          </Txt>
        </View>
      )}
      {!!q && state === 'failed' && (
        <Txt size={13} color={c.meta}>
          {QURAN.searchOffline()}
        </Txt>
      )}
      {found?.kind === 'ayah' && found.missing && (
        <Txt size={13} color={c.meta}>
          {t('noSuchAyah')}
        </Txt>
      )}
      {!!matches.length && (
        <Txt size={13} weight={700} color={c.meta} style={{ marginTop: space.sm }}>
          {QURAN.ayatFound()}
        </Txt>
      )}
      {matches.map((m) => (
        <AyahResult key={`${m.entry.s}:${m.entry.a}`} match={m} dark={isDark} onPress={() => go(pageOf(m.entry.s, m.entry.a) ?? SURAHS[m.entry.s - 1].page, { s: m.entry.s, a: m.entry.a })} />
      ))}
      {!!q && state === 'ready' && !rows.length && !matches.length && !(found?.kind === 'ayah' && found.missing) && (
        <Txt size={14} center color={c.meta}>
          {QURAN.noResults()}
        </Txt>
      )}
    </Sheet>
  );
}

// one ayah found: its surah, number and page, and its text with the words found marked
function AyahResult({ match, dark, onPress }: { match: Match; dark: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const { s, a } = match.entry;
  const at = pageOf(s, a) ?? SURAHS[s - 1].page;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.result, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.7 }]}>
      <View style={styles.resultHead}>
        <Txt size={15} weight={700} color={c.ink} style={{ flex: 1 }} numberOfLines={1}>
          {surahTitle(SURAHS[s - 1])}
          <Txt size={13} weight={500} color={c.meta}>
            {'  ·  '}
            {t('ayahN', a)}
          </Txt>
        </Txt>
        <Txt size={13} weight={500} color={c.pageNum}>
          {t('pageShort', at)}
        </Txt>
      </View>
      <Text numberOfLines={3} style={[styles.ayah, { color: c.text, fontFamily: serif(400), textAlign: textSide('right') }]}>
        {pieces(match.entry, match.ranges).map((p: Piece, i: number) =>
          p.mark ? (
            <Text key={i} style={{ backgroundColor: dark ? 'rgba(111, 181, 151, 0.32)' : 'rgba(31, 90, 69, 0.16)', color: c.ink }}>
              {p.text}
            </Text>
          ) : (
            p.text
          ),
        )}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, height: 48, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  middle: { alignItems: 'center', gap: space.sm, marginVertical: space.md },
  result: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: space.sm },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ayah: { fontSize: 20, lineHeight: 36, writingDirection: 'rtl' },
});
