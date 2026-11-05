// «الأحاديث» (the website's section), in the look of the Home and Adhkar pages: the search in the three
// books at the top (in Arabic, without tashkeel), «continue reading» under it, then the three books -
// Sahih al-Bukhari, Sahih Muslim, an-Nawawi's Forty - as cards with their painting. A book opens its kitabs (/hadith-book); an-Nawawi has one, opened at
// once (/hadith-kitab). The bookmark at the top opens the saved hadiths (/hadith-saved).
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/BookCover';
import { BackIcon, BookmarkIcon, SearchIcon } from '@/components/icons';
import { Note, openBook, openHadith, ReadLangButton } from '@/components/HadithParts';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
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
        <View style={[styles.search, { backgroundColor: c.card, borderColor: c.line }]}>
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
          <ActivityIndicator color={c.gold} style={{ marginTop: 30 }} />
        ) : (
          <View style={{ gap: 12 }}>
            {/* where the reader was: the green button, as under the painted heads */}
            {last && (
              <Pressable onPress={() => openHadith(last.b, last.k, last.n)} style={({ pressed }) => [styles.continue, { backgroundColor: c.on }, pressed && { opacity: 0.8 }]}>
                <Txt size={15} weight={700} center color={c.onInk} numberOfLines={1}>
                  {`${t('ahContinue')} · ${bookName(last.b)} ${t('ahNumber', last.n)}`}
                </Txt>
              </Pressable>
            )}
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// a book as a card (as the Adhkar page's): its vintage leather cover in its colour, its name, the imam,
// how many hadiths
function BookCard({ book }: { book: Book }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => openBook(book.id)}
      style={({ pressed }) => [styles.book, { backgroundColor: c.card, boxShadow: `0px 6px 18px ${c.shadow}` }, pressed && { opacity: 0.8 }]}
    >
      {/* its old leather cover */}
      <View style={styles.cover}>
        <BookCover book={book.id} width={52} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt size={17} weight={700} serif color={c.ink} lineHeight={28}>
          {t(`ah_${book.id}`)}
        </Txt>
        <Txt size={12.5} color={c.meta} numberOfLines={1}>
          {t(`ah_${book.id}_by`)}
        </Txt>
        <Txt size={12} weight={600} color={c.gold}>
          {t('ahHadithCount', book.count)}
        </Txt>
      </View>
      <BackIcon color={c.meta} size={17} rtl={isEnglish} />
    </Pressable>
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
          style={({ pressed }) => [styles.result, { backgroundColor: c.card, boxShadow: `0px 4px 14px ${c.shadow}` }, pressed && { opacity: 0.7 }]}
        >
          <Txt size={13} weight={700} color={c.gold}>
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
  continue: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  book: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 12 },
  cover: {},
  result: { borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
});
