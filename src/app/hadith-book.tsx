// A book's kitabs (كتاب الإيمان، كتاب الصلاة…) as a table of contents: the number in a soft round, the kitab's name (in English or French its name in that language, the Arabic
// under it), how many hadiths and their numbers. A kitab opens its hadiths (/hadith-kitab).
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/Stars';
import { Note, openHadith, useToTop } from '@/components/HadithParts';
import { BackIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
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
        <ActivityIndicator color={c.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={list}
          onScroll={onScroll}
          scrollEventThrottle={100}
          data={book.kitabs}
          keyExtractor={(k) => String(k.n)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            // the book's name in the top bar (as before), how many hadiths under it
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
                // no box: on the page, a thin line between two chapters
                style={({ pressed }) => [styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider }, pressed && { opacity: 0.6 }]}
              >
                {/* its number in a soft round */}
                <View style={[styles.num, { backgroundColor: c.accentSoft }]}>
                  <Txt size={13} weight={700} center color={c.accent}>
                    {k.n || '—'}
                  </Txt>
                </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4 },
  num: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
