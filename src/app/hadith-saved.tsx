// The saved hadiths (from the bookmark on the Ahadith shelf), newest first: the book and number, the
// kitab, the start of the matn; a tap opens it in its kitab, the cross removes it.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openHadith, useToast } from '@/components/HadithParts';
import { BookmarkIcon, CloseIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Txt } from '@/components/Txt';
import { t } from '@/i18n/i18n';
import { bookName, loadBooks, toggleSaved, useSaved, type Book } from '@/lib/hadith';
import { serif } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

export default function HadithSaved() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const saved = useSaved();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    loadBooks()
      .then(setBooks)
      .catch(() => {});
  }, []);

  const kitabTitle = (b: string, k: number) => (b === 'nawawi' ? '' : (books?.find((x) => x.id === b)?.kitabs.find((x) => x.n === k)?.title ?? ''));

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={t('ahSaved')} />
      <FlatList
        data={saved}
        keyExtractor={(s) => `${s.b}-${s.n}`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BookmarkIcon color={c.accent} size={34} />
            <Txt size={14.5} center color={c.meta}>
              {t('ahNoSaved')}
            </Txt>
          </View>
        }
        renderItem={({ item: s }) => {
          const kitab = kitabTitle(s.b, s.k);
          return (
            <View style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}>
              <Pressable onPress={() => openHadith(s.b, s.k, s.n)} style={({ pressed }) => [{ flex: 1, gap: 3 }, pressed && { opacity: 0.6 }]}>
                <Txt size={14} weight={700} color={c.ink}>
                  {`${bookName(s.b)} · ${t('ahNumber', s.n)}`}
                </Txt>
                {!!kitab && (
                  <Txt size={13} color={c.meta} style={{ fontFamily: serif(400), writingDirection: 'rtl', textAlign: textSide('right') }}>
                    {kitab}
                  </Txt>
                )}
                {!!s.m && (
                  <Txt size={15} color={c.text} numberOfLines={2} lineHeight={28} style={{ fontFamily: serif(400), writingDirection: 'rtl', textAlign: textSide('right') }}>
                    {`${s.m}…`}
                  </Txt>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  toggleSaved(s.b, s.k, s.n);
                  showToast(t('ahUnsavedToast'));
                }}
                hitSlop={8}
                accessibilityLabel={t('ahUnsave')}
                style={styles.remove}
              >
                <CloseIcon color={c.meta} size={18} />
              </Pressable>
            </View>
          );
        }}
      />
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 18, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 },
  remove: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30, paddingBottom: 80 },
});
