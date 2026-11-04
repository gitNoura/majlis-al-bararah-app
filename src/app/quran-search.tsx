// Searching the mushaf, a page of its own (the website's search, src/lib/search.js): a word or part of
// an ayah typed without tashkeel, or a surah and ayah number like 48:11; the ayat found, the words found
// marked in gold, each with its surah, its number and its page. A tap opens that page in the reader and
// lights the ayah a moment.
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, SearchIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { isEnglish, surahTitle, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { pageOf } from '@/lib/boxes';
import { SURAHS } from '@/lib/quran';
import { readerGo } from '@/lib/reader-nav';
import { EXAMPLES, loadSearch, MAX_SHOWN, pieces, search } from '@/lib/search';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { QuranTheme, useTheme } from '@/theme/theme';

type Entry = { s: number; a: number; text: string };
type Match = { entry: Entry; ranges: number[][] };

export default function QuranSearchScreen() {
  return (
    <QuranTheme>
      <QuranSearch />
    </QuranTheme>
  );
}

function QuranSearch() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const typed = useDeferredValue(query);

  useEffect(() => {
    loadSearch()
      .then(() => setState('ready'))
      .catch(() => setState('failed'));
  }, []);

  const found = useMemo(() => (state === 'ready' ? search(typed) : null), [state, typed]);
  const matches: Match[] = found ? found.matches.slice(0, MAX_SHOWN) : [];
  const count = found?.matches.length ?? 0;
  const meta = !found || found.kind === 'help'
    ? ''
    : found.kind === 'ayah'
      ? found.missing ? t('noSuchAyah') : ''
      : count
        ? t('resultCount', count) + (count > MAX_SHOWN ? t('firstShown', MAX_SHOWN) : '')
        : t('searchNone');

  const open = (m: Match) => {
    const { s, a } = m.entry;
    readerGo(pageOf(s, a) ?? SURAHS[s - 1].page, { s, a });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={READER.searchTitle()} />

      {/* the field */}
      <View style={[styles.field, { backgroundColor: c.surface, borderColor: c.line }]}>
        <SearchIcon color={c.ink} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={READER.searchField()}
          placeholderTextColor={c.meta}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => matches[0] && open(matches[0])}
          style={[styles.input, { color: c.ink, fontFamily: ui(500), textAlign: isEnglish && !/[؀-ۿ]/.test(query) ? 'left' : 'right' }]}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={READER.close()}>
            <CloseIcon color={c.meta} size={18} />
          </Pressable>
        )}
      </View>
      {!!meta && (
        <Txt size={13} color={c.meta} style={styles.meta}>
          {meta}
        </Txt>
      )}

      {state === 'loading' && (
        <View style={styles.middle}>
          <ActivityIndicator color={c.gold} />
          <Txt size={14} color={c.meta}>
            {t('searchLoading')}
          </Txt>
        </View>
      )}
      {state === 'failed' && (
        <Txt size={14} center color={c.meta} style={{ marginTop: 32 }}>
          {t('ahOffline')}
        </Txt>
      )}

      {/* nothing typed yet: how to search, and examples */}
      {found?.kind === 'help' && (
        <View style={styles.help}>
          <Txt size={14.5} color={c.text} lineHeight={24}>
            {t('searchHelp').replace(/<[^>]+>/g, '')}
          </Txt>
          <View style={styles.examples}>
            {EXAMPLES.map((e) => (
              <Pressable key={e} onPress={() => setQuery(e)} style={[styles.example, { backgroundColor: c.surface, borderColor: c.chosenLine }]}>
                <Txt size={15} weight={600} color={c.ink}>
                  {e}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {found && found.kind !== 'help' && (
        <FlatList
          data={matches}
          keyExtractor={(m) => `${m.entry.s}:${m.entry.a}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => <Result match={item} onPress={() => open(item)} />}
        />
      )}
    </View>
  );
}

// one ayah found: its surah, number and page, and its text with the words found in gold
function Result({ match, onPress }: { match: Match; onPress: () => void }) {
  const { c, isDark } = useTheme();
  const { s, a } = match.entry;
  const page = pageOf(s, a) ?? SURAHS[s - 1].page;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.result, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.7 }]}>
      <View style={styles.resultHead}>
        <Txt size={15} weight={700} color={c.ink} style={{ flex: 1 }} numberOfLines={1}>
          {surahTitle(SURAHS[s - 1])}
          <Txt size={13} weight={500} color={c.meta}>
            {'  ·  '}
            {t('ayahN', a)}
          </Txt>
        </Txt>
        <Txt size={13} weight={500} color={c.pageNum}>
          {t('pageShort', page)}
        </Txt>
      </View>
      <Text style={[styles.ayah, { color: c.text, fontFamily: serif(400), textAlign: textSide('right') }]}>
        {pieces(match.entry, match.ranges).map((p: { text: string; mark: boolean }, i: number) =>
          p.mark ? (
            <Text key={i} style={{ backgroundColor: isDark ? 'rgba(201, 165, 78, 0.32)' : 'rgba(201, 165, 78, 0.28)', color: c.ink }}>
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
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingHorizontal: 16, height: 50, borderRadius: 25, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  meta: { marginHorizontal: 22, marginTop: 10, marginBottom: 2 },
  middle: { alignItems: 'center', gap: 10, marginTop: 40 },
  help: { marginHorizontal: 22, marginTop: 18, gap: 16 },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  example: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  result: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 8, marginTop: 10 },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ayah: { fontSize: 20, lineHeight: 40, writingDirection: 'rtl' },
});
