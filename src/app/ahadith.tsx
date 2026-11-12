// «الأحاديث» (the website's section), in the app's plain look (cards and rows, no covers): the search in the three
// books at the top (in Arabic, without tashkeel), «continue reading» under it, then the three books -
// Sahih al-Bukhari, Sahih Muslim, an-Nawawi's Forty - as rows. A book opens its kitabs (/hadith-book); an-Nawawi has one, opened at
// once (/hadith-kitab). The bookmark at the top opens the saved hadiths (/hadith-saved).
import { GlassBack } from '@/components/home/Glass';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/Stars';
import { BookmarkIcon, SearchIcon } from '@/components/icons';
import { Note, openBook, openHadith, ReadLangButton } from '@/components/HadithParts';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { Card, Row } from '@/components/ui';
import { isEnglish, t } from '@/i18n/i18n';
import { bookName, lastRead, loadBooks, searchHadiths, type Book, type Found } from '@/lib/hadith';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

export default function Ahadith() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ found: Found[]; many: boolean } | 'busy' | 'failed' | null>(null);
  const [last] = useState(lastRead);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    loadBooks()
      .then(setBooks)
      .catch(() => setFailed(true));
  }, []);

  const onQuery = (text: string) => {
    setQuery(text);
    clearTimeout(timer.current);
    if (!text.trim()) return setResults(null);
    timer.current = setTimeout(() => {
      setResults('busy');
      searchHadiths(text)
        .then(setResults)
        .catch(() => setResults('failed'));
    }, 300);
  };

  const savedButton = (
    <Pressable onPress={() => router.push('/hadith-saved')} hitSlop={8} accessibilityLabel={t('ahSaved')} style={styles.savedBtn}>
      <BookmarkIcon color={c.ink} size={22} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* at the end of the top bar: the hadiths' language, then the saved hadiths */}
      <ScreenHeader
        title={t('ahTitle')}
        end={
          <>
            <ReadLangButton />
            {savedButton}
          </>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, gap: 18 }} keyboardShouldPersistTaps="handled">
        {/* the search, in Arabic in every language */}
        <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.line }]}>
          <SearchIcon color={c.meta} size={20} />
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder={t('ahSearchAll')}
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.78)' : c.meta}
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.input, { color: c.ink, fontFamily: ui(500), textAlign: isEnglish && !/[؀-ۿ]/.test(query) ? 'left' : 'right' }]}
          />
        </View>

        {results ? (
          <Results results={results} />
        ) : failed ? (
          <Note text={t('ahOffline')} />
        ) : !books ? (
          <ActivityIndicator color={c.accent} style={{ marginTop: 30 }} />
        ) : (
          <View style={{ gap: 12 }}>
            {/* where the reader was: the one filled button */}
            {last && <PrimaryButton label={`${t('ahContinue')} · ${bookName(last.b)} ${t('ahNumber', last.n)}`} onPress={() => openHadith(last.b, last.k, last.n)} />}
            <Card style={{ paddingVertical: 4, gap: 0 }}>
              {books.map((b, i) => (
                <Row key={b.id} title={t(`ah_${b.id}`)} sub={`${t(`ah_${b.id}_by`)} · ${t('ahHadithCount', b.count)}`} chevron onPress={() => openBook(b.id)} last={i === books.length - 1} />
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Results({ results }: { results: { found: Found[]; many: boolean } | 'busy' | 'failed' }) {
  const { c } = useTheme();
  if (results === 'busy') return <Note text={t('ahSearching')} />;
  if (results === 'failed') return <Note text={t('ahOffline')} />;
  if (!results.found.length) return <Note text={t('ahNoResults')} />;
  return (
    <View style={{ gap: 10 }}>
      <Note text={results.many ? t('ahManyResults') : t('ahResultCount', results.found.length)} />
      {results.found.map((r) => (
        <Pressable
          key={`${r.b}-${r.n}`}
          onPress={() => openHadith(r.b, r.k, r.n)}
          style={({ pressed }) => [styles.result, { borderWidth: 0 }, pressed && { opacity: 0.7 }]}
        >
          <GlassBack radius={18} />
          <Txt size={13} weight={700} color={c.accent}>
            {`${bookName(r.b)} · ${t('ahNumber', r.n)}`}
          </Txt>
          <Txt size={15} color={c.text} style={{ fontFamily: serif(400), writingDirection: 'rtl', textAlign: textSide('right') }} lineHeight={28}>
            {r.snippet}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  savedBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: 25, borderWidth: 1, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15.5, height: '100%' },
  result: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
});
