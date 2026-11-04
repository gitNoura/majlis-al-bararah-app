// «الأحاديث» (the website's section): the shelf of the three books - Sahih al-Bukhari, Sahih Muslim and
// an-Nawawi's Forty, each a bound cover - with «continue reading» above them, and a search in all three
// (in Arabic, without tashkeel). A book opens its kitabs (/hadith-book); an-Nawawi has one, opened at
// once (/hadith-kitab). The bookmark at the top opens the saved hadiths (/hadith-saved).
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookmarkIcon, SearchIcon } from '@/components/icons';
import { Note, openBook, openHadith, ReadLangButton } from '@/components/HadithParts';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { isEnglish, t } from '@/i18n/i18n';
import { bookName, lastRead, loadBooks, searchHadiths, type Book, type BookId, type Found } from '@/lib/hadith';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

// the covers' leather, as the website's (ahadith.css)
const COVERS: Record<BookId, [string, string]> = {
  bukhari: ['#1d5c47', '#0f3d2f'],
  muslim: ['#8a2f43', '#561726'],
  nawawi: ['#34569a', '#1c3366'],
};

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
          <>
            {last && (
              <Pressable
                onPress={() => openHadith(last.b, last.k, last.n)}
                style={({ pressed }) => [styles.continue, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.7 }]}
              >
                <Txt size={13} color={c.meta}>
                  {t('ahContinue')}
                </Txt>
                <Txt size={15.5} weight={700} color={c.ink}>
                  {`${bookName(last.b)} · ${t('ahNumber', last.n)}`}
                </Txt>
              </Pressable>
            )}
            <View style={styles.shelf}>
              {books.map((b) => (
                <Cover key={b.id} book={b} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// a bound book: its leather, a gold frame, the name, the imam, how many hadiths
function Cover({ book }: { book: Book }) {
  const [from, to] = COVERS[book.id];
  return (
    <Pressable onPress={() => openBook(book.id)} style={({ pressed }) => [styles.coverBox, pressed && { transform: [{ scale: 0.97 }] }]}>
      <LinearGradient colors={[from, to]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[styles.cover, isEnglish ? styles.spineLeft : styles.spineRight]}>
        {/* the spine's fold */}
        <View style={[styles.spine, isEnglish ? { left: '8%' } : { right: '8%' }]} />
        <View style={styles.frame}>
          <Txt size={15} weight={700} serif center color="#f3e3b3" lineHeight={24} numberOfLines={3}>
            {t(`ah_${book.id}_cover`)}
          </Txt>
          {isEnglish && (
            <Txt size={10.5} weight={600} center color="rgba(243, 227, 179, 0.85)" numberOfLines={2}>
              {t(`ah_${book.id}`)}
            </Txt>
          )}
          <Txt size={9.5} center color="rgba(243, 227, 179, 0.75)" numberOfLines={3}>
            {t(`ah_${book.id}_by`)}
          </Txt>
          <Txt size={10} weight={600} center color="#efe3c4" style={{ marginTop: 2 }}>
            {t('ahHadithCount', book.count)}
          </Txt>
        </View>
      </LinearGradient>
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
          style={({ pressed }) => [styles.result, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.7 }]}
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
  continue: { borderRadius: 18, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 18, gap: 3 },
  shelf: { flexDirection: 'row', gap: 12 },
  coverBox: { flex: 1, aspectRatio: 3 / 4.2, boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.25)', borderRadius: 10 },
  cover: { flex: 1, overflow: 'hidden', padding: 7 },
  spineLeft: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingLeft: 14 },
  spineRight: { borderTopRightRadius: 4, borderBottomRightRadius: 4, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, paddingRight: 14 },
  spine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(0, 0, 0, 0.18)' },
  frame: { flex: 1, borderWidth: 1.2, borderColor: 'rgba(232, 214, 163, 0.75)', borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4, gap: 5 },
  result: { borderRadius: 16, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
});
