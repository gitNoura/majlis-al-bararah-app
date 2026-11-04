// A book's kitabs (كتاب الإيمان، كتاب الصلاة…) as a table of contents, as on the website: the number, the kitab's name (in English or French its name in that language, the Arabic
// under it), how many hadiths and their numbers. A kitab opens its hadiths (/hadith-kitab).
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Note, openHadith, useToTop } from '@/components/HadithParts';
import { BackIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { isEnglish, t } from '@/i18n/i18n';
import { bookName, kitabName, loadBooks, type Book, type BookId, type Kitab } from '@/lib/hadith';
import { serif } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

export default function HadithBook() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const b = useLocalSearchParams<{ b: BookId }>().b;
  const [book, setBook] = useState<Book | null>(null);
  const [failed, setFailed] = useState(false);
  const list = useRef<FlatList<Kitab>>(null);
  const [onScroll, toTopButton] = useToTop(() => list.current?.scrollToOffset({ offset: 0, animated: true }));

  useEffect(() => {
    loadBooks()
      .then((all) => setBook(all.find((x) => x.id === b) ?? null))
      .catch(() => setFailed(true));
  }, [b]);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={bookName(b)} />
      {failed ? (
        <Note text={t('ahOffline')} />
      ) : !book ? (
        <ActivityIndicator color={c.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={list}
          onScroll={onScroll}
          scrollEventThrottle={100}
          data={book.kitabs}
          keyExtractor={(k) => String(k.n)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            <Txt size={13.5} center color={c.meta} style={{ marginBottom: 14 }}>
              {t('ahHadithCount', book.count)}
            </Txt>
          }
          renderItem={({ item: k, index }) => {
            const name = kitabName(b, k);
            const other = name !== k.title;
            return (
              <Pressable
                onPress={() => openHadith(b, k.n)}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: c.card, borderColor: c.line },
                  index === 0 && styles.first,
                  index === book.kitabs.length - 1 && styles.last,
                  index > 0 && { borderTopWidth: 0 },
                  pressed && { backgroundColor: c.soft },
                ]}
              >
                <Txt size={14} weight={700} center color={c.gold} style={styles.num}>
                  {k.n || '—'}
                </Txt>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={other ? 15.5 : 17} weight={700} color={c.ink} style={!other && { fontFamily: serif(700) }} lineHeight={other ? 22 : 30}>
                    {name}
                  </Txt>
                  {other && (
                    <Txt size={14} color={c.meta} style={{ fontFamily: serif(400), writingDirection: 'rtl', textAlign: textSide('left') }}>
                      {k.title}
                    </Txt>
                  )}
                  <Txt size={12.5} color={c.meta}>
                    {t('ahHadithCount', k.count)}
                    {k.first ? ` · ${k.first}–${k.last}` : ''}
                  </Txt>
                </View>
                <BackIcon color={c.meta} size={18} rtl={isEnglish} />
              </Pressable>
            );
          }}
        />
      )}
      {toTopButton}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1 },
  first: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  last: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  num: { minWidth: 28 },
});
