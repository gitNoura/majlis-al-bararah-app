// The index of the mushaf (the website's index panel): a panel from the side of the page with three
// tabs - the surahs, the 60 ahzab, the 30 ajza - a search field, and the list; the place being read
// is marked (a green star, the row a little darker, a bar on its edge). A row opens its page.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, PlayIcon, SearchIcon, StarBadge } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { current, filterItems, type Item, type Tab } from '@/lib/find';
import { ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

// `onPlay` (the Listen screen) puts a play button in place of each surah's number: the whole surah, played at once
export function QuranIndex({ open, page, onClose, onGo, onPlay }: { open: boolean; page: number; onClose: () => void; onGo: (page: number) => void; onPlay?: (surah: number) => void }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelW = Math.min(width * 0.88, 420);
  const [tab, setTab] = useState<Tab>('surahs');
  const [query, setQuery] = useState('');
  const [slide] = useState(() => new Animated.Value(0));
  const list = useRef<FlatList<Item>>(null);

  useEffect(() => {
    if (open) Animated.timing(slide, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [open, slide]);
  const close = () => Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());

  const shown = useMemo(() => {
    return filterItems(tab, query);
  }, [tab, query]);
  const here = current(tab, page);

  // the place being read in view when the panel opens or the tab changes
  useEffect(() => {
    if (!open || query) return;
    const i = shown.findIndex((it) => it.number === here);
    if (i > 2) setTimeout(() => list.current?.scrollToIndex({ index: i - 2, animated: false }), 0);
  }, [open, tab, here, shown, query]);

  // from the start side: the right in Arabic, the left in English and French
  const from = isEnglish ? -panelW : panelW;
  const tabs: [Tab, string][] = [
    ['surahs', READER.tabSurahs()],
    ['ahzab', READER.tabAhzab()],
    ['ajza', READER.tabAjza()],
  ];

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.dim, opacity: slide }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={READER.close()} />
      </Animated.View>
      <Animated.View
        style={[
          styles.panel,
          {
            width: panelW,
            backgroundColor: c.panel,
            paddingTop: insets.top + 8,
            [isEnglish ? 'left' : 'right']: 0,
            // curved at the top only (both top corners: a phone may swap left and right in Arabic,
            // and the one at the screen's edge is out of sight)
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
          },
        ]}
      >
        <View style={styles.head}>
          <Txt size={22} weight={700} color={c.ink} style={{ flex: 1, textAlign: 'center' }}>
            {READER.index()}
          </Txt>
          <Pressable onPress={close} style={[styles.round, { backgroundColor: c.soft }]} accessibilityLabel={READER.close()}>
            <CloseIcon color={c.ink} size={20} />
          </Pressable>
        </View>

        <View style={[styles.tabs, { backgroundColor: c.soft }]}>
          {tabs.map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => {
                setTab(key);
                setQuery('');
              }}
              style={[styles.tab, tab === key && { backgroundColor: c.on }]}
            >
              <Txt size={15} weight={tab === key ? 700 : 500} center color={tab === key ? c.onInk : c.tabInk}>
                {label}
              </Txt>
            </Pressable>
          ))}
        </View>

        {tab === 'surahs' && (
          <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.line }]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={READER.filter()}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.78)' : c.meta}
              style={[styles.input, { color: c.ink, fontFamily: ui(500), textAlign: isEnglish ? 'left' : 'right' }]}
            />
            <SearchIcon color={c.ink} size={20} />
          </View>
        )}

        <FlatList
          ref={list}
          data={shown}
          keyExtractor={(it) => String(it.number)}
          getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
          onScrollToIndexFailed={() => {}}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Txt size={15} center color={c.meta} style={{ marginTop: 24 }}>
              {t('noResults')}
            </Txt>
          }
          renderItem={({ item }) => {
            const on = item.number === here;
            return (
              <Pressable
                onPress={() => {
                  onGo(item.page);
                  close();
                }}
                style={({ pressed }) => [
                  styles.row,
                  { borderBottomColor: c.divider },
                  on && { backgroundColor: c.soft, borderColor: c.chosenLine },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {on && <View style={[styles.edge, { backgroundColor: c.accent }]} />}
                {onPlay && tab === 'surahs' ? (
                  // Listen: a play button stands where the surah's number is
                  <Pressable
                    onPress={() => {
                      onPlay(item.number);
                      close();
                    }}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`${HIF.lsPlay()}: ${item.title}`}
                    style={[styles.playBtn, { backgroundColor: c.on }]}
                  >
                    <PlayIcon color={c.onInk} size={16} />
                  </Pressable>
                ) : (
                  <View style={styles.num}>
                    <StarBadge fill={on ? c.on : c.surface} stroke={c.gold} />
                    <Txt size={13} weight={700} color={on ? c.onInk : c.ink}>
                      {item.number}
                    </Txt>
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={17} weight={700} color={c.ink} numberOfLines={1}>
                    {item.title}
                  </Txt>
                  {!!(item.other || item.sub) && (
                    <Txt size={12.5} weight={500} color={c.meta} numberOfLines={1}>
                      {item.other || item.sub}
                    </Txt>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Txt size={14} weight={500} color={c.pageNum}>
                    {t('pageShort', item.page)}
                  </Txt>
                  {!!item.type && (
                    <Txt size={12.5} color={c.meta}>
                      {item.type}
                    </Txt>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </Modal>
  );
}

const ROW = 66;

const styles = StyleSheet.create({
  panel: { position: 'absolute', top: 0, bottom: 0, paddingHorizontal: 16, elevation: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12, paddingHorizontal: 16, height: 48, borderRadius: 24, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  row: { height: ROW, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 12 },
  edge: { position: 'absolute', end: 0, top: 10, bottom: 10, width: 3, borderRadius: 2 },
  playBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  num: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
});
