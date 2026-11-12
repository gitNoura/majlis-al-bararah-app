// The search page: fills the screen (it slides in from the top), with one field that takes a name, words of an ayah, or a
// reference like 2:255 (the website's text search, src/lib/search.js). The surahs whose name matches come first, then
// the ayat. A row or a result opens its page; a result also lights its ayah for a moment. (The index of surahs,
// ahzab and ajza is src/components/QuranIndex.tsx.) The list fills the page and is kept above the keyboard.
import { GlassBack } from '@/components/home/Glass';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, SearchIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Card, Row } from '@/components/ui';
import { isEnglish, LANG, surahTitle, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { pageOf } from '@/lib/boxes';
import { filterItems } from '@/lib/find';
import { SURAHS } from '@/lib/quran';
import { loadSearch, pieces, search } from '@/lib/search';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Entry = { s: number; a: number; text: string };
type Match = { entry: Entry; ranges: number[][] };
type Piece = { text: string; mark: boolean };

const SHOWN = 30; // the ayat listed at first, and each time «See more» is pressed (the panel draws them all at once)

type Props = { open: boolean; onClose: () => void; onGo: (page: number, ayah: { s: number; a: number } | null) => void };

export function SearchPanel({ open, onClose, onGo }: Props) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(SHOWN); // how many ayat are listed now
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [keyboard, setKeyboard] = useState(0); // the keyboard's height
  const [slide] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!open) return;
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    loadSearch()
      .then(() => setState('ready'))
      .catch(() => setState('failed'));
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [open, slide]);

  const q = query.trim();
  const rows = q ? filterItems('surahs', q) : [];
  const found = q && state === 'ready' ? search(q) : null;
  const all: Match[] = found && found.kind !== 'help' ? found.matches : [];
  const matches = all.slice(0, limit);

  const go = (target: number, ayah: { s: number; a: number } | null) => {
    onClose();
    onGo(target, ayah);
  };
  const goAyah = (m: Match) => go(pageOf(m.entry.s, m.entry.a) ?? SURAHS[m.entry.s - 1].page, { s: m.entry.s, a: m.entry.a });

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* a Modal is its own window: the language's direction is set again inside it */}
      <View style={[StyleSheet.absoluteFill, Platform.OS !== 'web' && { direction: LANG === 'ar' ? 'rtl' : 'ltr' }]}>
        <Animated.View
          style={[
            styles.panel,
            {
              paddingTop: insets.top + space.sm,
              paddingBottom: Math.max(keyboard, insets.bottom) + space.sm, // the list stops above the keyboard
              opacity: slide,
              transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
            },
          ]}
        >
          <GlassBack strong radius={0} />
          <View style={styles.top}>
            <View style={[styles.field, { backgroundColor: c.surface2, borderColor: c.line }]}>
              <SearchIcon color={c.meta} size={20} />
              <TextInput
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setLimit(SHOWN);
                }}
                placeholder={QURAN.findField()}
                placeholderTextColor={c.meta}
                autoFocus
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => matches[0] && goAyah(matches[0])}
                style={[styles.input, { color: c.ink, fontFamily: ui(500), textAlign: isEnglish && !/[؀-ۿ]/.test(query) ? 'left' : 'right' }]}
              />
              {!!query && (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    setLimit(SHOWN);
                  }}
                  hitSlop={10}
                  accessibilityLabel={QURAN.search()}
                >
                  <CloseIcon color={c.meta} size={18} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={READER.close()} hitSlop={6} style={[styles.round, { backgroundColor: c.surface2 }]}>
              <CloseIcon color={c.ink} size={20} />
            </Pressable>
          </View>

          {!!q && (
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {!!rows.length && (
                <Card style={{ paddingVertical: 4 }}>
                  {rows.map((item, i) => (
                    <Row
                      key={item.number}
                      title={item.title}
                      sub={item.other || item.sub || undefined}
                      end={
                        <Txt size={13} color={c.pageNum}>
                          {t('pageShort', item.page)}
                        </Txt>
                      }
                      onPress={() => go(item.page, null)}
                      last={i === rows.length - 1}
                    />
                  ))}
                </Card>
              )}
              {state === 'loading' && (
                <View style={styles.middle}>
                  <ActivityIndicator color={c.accent} />
                  <Txt size={13} color={c.meta}>
                    {QURAN.loadingSearch()}
                  </Txt>
                </View>
              )}
              {state === 'failed' && (
                <Txt size={13} color={c.meta}>
                  {QURAN.searchOffline()}
                </Txt>
              )}
              {!!matches.length && (
                <Txt size={13} weight={700} color={c.meta} style={{ marginTop: space.sm }}>
                  {QURAN.ayatFound()}
                </Txt>
              )}
              {matches.map((m) => (
                <AyahResult key={`${m.entry.s}:${m.entry.a}`} match={m} dark={isDark} onPress={() => goAyah(m)} />
              ))}
              {all.length > matches.length && (
                <Pressable
                  onPress={() => setLimit((n) => n + SHOWN)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.more, { backgroundColor: c.surface2, borderColor: c.line }, pressed && { opacity: 0.7 }]}
                >
                  <Txt size={14} weight={700} color={c.ink}>
                    {QURAN.seeMore()}
                  </Txt>
                </Pressable>
              )}
              {state === 'ready' && !rows.length && !matches.length && (
                <Txt size={14} center color={c.meta}>
                  {QURAN.noResults()}
                </Txt>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// one ayah found: its surah, number and page, and its text with the words found marked
function AyahResult({ match, dark, onPress }: { match: Match; dark: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const { s, a } = match.entry;
  const at = pageOf(s, a) ?? SURAHS[s - 1].page;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.result, { backgroundColor: c.surface2, borderColor: c.line }, pressed && { opacity: 0.7 }]}>
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
  panel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: space.md, gap: space.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, height: 48, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { gap: space.sm, paddingBottom: space.sm },
  middle: { alignItems: 'center', gap: space.sm, marginVertical: space.md },
  more: { alignSelf: 'center', paddingHorizontal: space.lg, paddingVertical: 12, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth },
  result: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: space.sm },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ayah: { fontSize: 20, lineHeight: 36, writingDirection: 'rtl' },
});
