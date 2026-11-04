// One kitab, as a chapter of a book (the website's third level): which kitab, its name, how many
// hadiths and babs; each bab a section title (the word «باب» set apart, the rest under it), each hadith a
// card - its number in a star, the sanad smaller and lighter, the matn, «رواه…», and in English and
// French the English under it - with copy, share and save. Opened at a hadith (`n`: from the search,
// the saved ones, «continue reading»), it starts there and lights it a moment. The hadith at the top
// of the screen is the one «continue reading» comes back to.
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Note, ReadLangButton, useToast, useToTop } from '@/components/HadithParts';
import { BookmarkIcon, CopyIcon, ShareIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { t } from '@/i18n/i18n';
import {
  bookName,
  hadithText,
  kitabName,
  loadBooks,
  loadEnglish,
  loadKitab,
  remember,
  toggleSaved,
  useReadLang,
  useSaved,
  type BookId,
  type ReadLang,
  type English,
  type Hadith,
  type Item,
  type Kitab,
} from '@/lib/hadith';
import { serif } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

type Data = { kitab: Kitab; items: Item[]; english: English };
const isHadith = (h: Item): h is Hadith => !h.bab;

export default function HadithKitab() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ b: BookId; k: string; n?: string }>();
  const b = params.b;
  const k = Number(params.k);
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [flash, setFlash] = useState(params.n ?? '');
  const list = useRef<FlatList<Item>>(null);
  // the hadith at the top of the screen, kept when the reader's own scrolling stops
  const top = useRef('');
  const [toast, showToast] = useToast();
  const lang = useReadLang();
  const [onScroll, toTopButton] = useToTop(() => list.current?.scrollToOffset({ offset: 0, animated: true }));

  useEffect(() => {
    Promise.all([loadBooks(), loadKitab(b, k), loadEnglish(b, k)])
      .then(([books, items, english]) => {
        const kitab = books.find((x) => x.id === b)?.kitabs.find((x) => x.n === k);
        if (!kitab) throw new Error('no kitab');
        setData({ kitab, items, english });
        remember({ b, k, n: params.n || items.find(isHadith)?.n || '' });
      })
      .catch(() => setFailed(true));
  }, [b, k, params.n]);

  // opened at a hadith: there, lit a moment
  useEffect(() => {
    if (!data || !params.n) return;
    const at = data.items.findIndex((h) => isHadith(h) && h.n === params.n);
    if (at < 0) return;
    const go = setTimeout(() => list.current?.scrollToIndex({ index: at, viewPosition: 0, animated: false }), 60);
    const off = setTimeout(() => setFlash(''), 1800);
    return () => {
      clearTimeout(go);
      clearTimeout(off);
    };
  }, [data, params.n]);

  // the hadith at the top of the screen: where «continue reading» comes back to
  // (made once: the list does not accept a new one later)
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: { item: Item }[] }) => {
    const first = viewableItems.map((v) => v.item).find(isHadith);
    if (first?.n) top.current = first.n;
  });

  // (a little later, so the list has told which hadith is at the top)
  const keepPlace = () => setTimeout(() => top.current && remember({ b, k, n: top.current }), 250);

  const title = !data ? '' : b === 'nawawi' ? bookName(b) : kitabName(b, data.kitab);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* no name at the top: the kitab's name is the page's own title below */}
      <ScreenHeader
        title=""
        end={
          <>
            <ReadLangButton />
          </>
        }
      />
      {failed ? (
        <Note text={t('ahOffline')} />
      ) : !data ? (
        <ActivityIndicator color={c.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={list}
          data={data.items}
          keyExtractor={(h, i) => (isHadith(h) ? `h-${h.n}-${i}` : `bab-${i}`)}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 40 }}
          onScroll={onScroll}
          scrollEventThrottle={100}
          extraData={lang}
          initialNumToRender={12}
          windowSize={11}
          onViewableItemsChanged={onViewable}
          onMomentumScrollEnd={keepPlace}
          onScrollEndDrag={keepPlace}
          viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            list.current?.scrollToOffset({ offset: index * averageItemLength, animated: false });
            setTimeout(() => list.current?.scrollToIndex({ index, viewPosition: 0, animated: false }), 120);
          }}
          ListHeaderComponent={<Opening b={b} data={data} title={title} />}
          renderItem={({ item }) =>
            isHadith(item) ? (
              <HadithCard b={b} k={k} h={item} english={data.english[item.n]} lang={lang} lit={flash === item.n} onToast={showToast} />
            ) : (
              <Bab text={item.bab ?? ''} />
            )
          }
        />
      )}
      {toTopButton}
      {toast}
    </View>
  );
}

// the kitab opens as a chapter: «Book 2», its name, how many hadiths and babs
function Opening({ b, data, title }: { b: BookId; data: Data; title: string }) {
  const { c } = useTheme();
  const babs = data.items.filter((h) => h.bab).length;
  return (
    <View style={styles.opening}>
      {b !== 'nawawi' && !!data.kitab.n && (
        <Txt size={12.5} weight={700} center color={c.gold}>
          {t('ahKitabN', data.kitab.n)}
        </Txt>
      )}
      <Txt size={24} weight={700} serif center color={c.ink} lineHeight={40}>
        {title}
      </Txt>
      <Txt size={13} center color={c.meta}>
        {t('ahHadithCount', data.kitab.count)}
        {babs ? ` · ${t('ahBabCount', babs)}` : ''}
      </Txt>
    </View>
  );
}

// «باب» set apart in a soft gold pill, the rest of the title under it
function Bab({ text }: { text: string }) {
  const { c } = useTheme();
  const rest = text.replace(/^باب\s*/, '');
  return (
    <View style={styles.bab}>
      {rest !== text && (
        <View style={[styles.babWord, { backgroundColor: 'rgba(197, 161, 90, 0.16)' }]}>
          <Txt size={12.5} weight={700} color={c.pageNum}>
            باب
          </Txt>
        </View>
      )}
      {!!rest && (
        <Txt size={17} weight={700} center color={c.ink} lineHeight={32} style={{ fontFamily: serif(700), writingDirection: 'rtl' }}>
          {rest}
        </Txt>
      )}
      <View style={[styles.babLine, { backgroundColor: c.chosenLine }]} />
    </View>
  );
}

function HadithCard({
  b,
  k,
  h,
  english,
  lang,
  lit,
  onToast,
}: {
  b: BookId;
  k: number;
  h: Hadith;
  english?: string[] | string;
  lang: ReadLang;
  lit: boolean;
  onToast: (text: string) => void;
}) {
  const { c } = useTheme();
  const saved = useSaved();
  const on = saved.some((s) => s.b === b && s.n === h.n);
  const text = () => hadithText(b, h, english, lang);
  // the English alone only when there is one; else the Arabic
  const showArabic = lang !== 'en' || !Array.isArray(english);
  const showEnglish = lang !== 'ar';

  return (
    <View style={[styles.card, { backgroundColor: lit ? c.soft : c.card, borderColor: lit ? c.gold : c.line }]}>
      <View style={styles.cardHead}>
        {/* its number, plain */}
        <Txt size={14} weight={700} color={c.gold}>
          {h.n}
        </Txt>
        <View style={styles.actions}>
          <Act
            label={t('ahCopy')}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(text());
                onToast(t('ahCopied'));
              } catch {
                onToast(t('ahCopyFailed'));
              }
            }}
          >
            <CopyIcon color={c.meta} size={19} />
          </Act>
          <Act label={t('ahShare')} onPress={() => Share.share({ message: text() }).catch(() => {})}>
            <ShareIcon color={c.meta} size={19} />
          </Act>
          {/* the sayings of Muslim's Introduction have no number to save them by */}
          {!!h.n && (
            <Act label={t('ahSave')} onPress={() => onToast(t(toggleSaved(b, k, h.n, h.m) ? 'ahSavedToast' : 'ahUnsavedToast'))}>
              <BookmarkIcon color={on ? c.gold : c.meta} size={19} on={on} />
            </Act>
          )}
        </View>
      </View>
      {showArabic && (
        <>
          {!!h.s && <Arabic size={14.5} color={c.meta} text={h.s} />}
          <Arabic size={20} color={c.ink} text={h.m} />
          {!!h.r && <Arabic size={14.5} color={c.meta} text={h.r} />}
        </>
      )}
      {showEnglish && <EnglishText en={english} alone={!showArabic} />}
    </View>
  );
}

function Act({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityLabel={label} style={({ pressed }) => [styles.act, pressed && { opacity: 0.5 }]}>
      {children}
    </Pressable>
  );
}

// Arabic, right to left and justified - both edges straight, its last line ending on the right - in
// every language: the block has its own right-to-left direction (Android lines a justified text up by
// the block's direction, so in the English layout its last line would go to the left otherwise)
function Arabic({ text, size, color }: { text: string; size: number; color: string }) {
  return (
    <Txt size={size} color={color} lineHeight={size * 1.95} style={{ fontFamily: serif(400), direction: 'rtl', writingDirection: 'rtl', textAlign: 'justify' }}>
      {text}
    </Txt>
  );
}

// the English (English and French interfaces), after a thin line: «Narrated …:» lighter; or a note when
// it is given with another hadith
function EnglishText({ en, alone }: { en?: string[] | string; alone?: boolean }) {
  const { c } = useTheme();
  if (typeof en === 'string')
    return (
      <Txt size={13} color={c.meta} style={{ marginTop: 10, fontStyle: 'italic', writingDirection: 'ltr', textAlign: textSide('left') }}>
        {t('ahEnSee', en)}
      </Txt>
    );
  if (!Array.isArray(en)) return null;
  return (
    <View style={[styles.en, { borderTopColor: c.divider }, alone && styles.enAlone]}>
      {en.map((p, i) => {
        const by = i === 0 && /:$/.test(p);
        // who narrated it, inside the first sentence («It is narrated on the authority of … said:»): in
        // gold as the Arabic sanad, the hadith after it in the text's colour
        const [chain, rest] = i === 0 && !by ? splitChain(p) : ['', p];
        return (
          <Txt key={i} size={by ? 14 : 16} color={by ? c.meta : c.ink} lineHeight={by ? 22 : 27} style={{ direction: 'ltr', writingDirection: 'ltr', textAlign: 'justify' }}>
            {!!chain && <Txt size={16} color={c.meta}>{chain}</Txt>}
            {rest}
          </Txt>
        );
      })}
    </View>
  );
}

// the narrators at the start of a paragraph, up to the first colon (when it is one: «narrated», «on
// the authority of», «reported»), and the rest
function splitChain(p: string): [string, string] {
  const at = p.indexOf(':');
  if (at < 0 || at > 260) return ['', p];
  const chain = p.slice(0, at + 1);
  return /narrat|authority|report/i.test(chain) ? [chain, p.slice(at + 1)] : ['', p];
}

const styles = StyleSheet.create({
  opening: { alignItems: 'center', gap: 2, marginTop: 4, marginBottom: 18, paddingHorizontal: 10 },
  bab: { alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 14, paddingHorizontal: 12 },
  babWord: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 999 },
  babLine: { width: 60, height: 1.5, borderRadius: 1, marginTop: 4 },
  card: { borderRadius: 20, borderWidth: 1, paddingTop: 10, paddingBottom: 16, paddingHorizontal: 15, marginBottom: 12, gap: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  actions: { flexDirection: 'row', gap: 4 },
  act: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  en: { marginTop: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 6 },
  enAlone: { marginTop: 2, paddingTop: 0, borderTopWidth: 0 },
});
