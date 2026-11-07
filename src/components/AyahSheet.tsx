// The chosen ayah (the website's tafsir panel), as a sheet from the bottom: its surah and number, two
// tabs - the tafsir and the translation, each with the sources chosen (src/lib/sources.js) - and the
// texts in the interface's own font (Tajawal), the ayat they quote in the Quran's (Amiri) and their own colour, each
// source's name under its text. Previous (on the left) and next (on the right) go from ayah to ayah.
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CloseIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { L, surahName, t } from '@/i18n/i18n';
import { SURAHS } from '@/lib/quran';
import { tafsirSources } from '@/lib/sources';
import { loadTafsir, withQuotes } from '@/lib/tafsir';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

type Kind = 'tafsir' | 'translation';
type Source = { id: string; name: string; nameEn: string; nameFr?: string; lang: string; kind?: string; perAyah?: boolean };
type Block = { src: Source; paragraphs: string[] | null };

export type Ayah = { s: number; a: number };

export function AyahSheet({ ayah, onClose, onMove }: { ayah: Ayah | null; onClose: () => void; onMove: (step: 1 | -1) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [kind, setKind] = useState<Kind>('tafsir');
  // the texts loaded, for the ayah and tab they belong to (another ayah or tab: loading again)
  const [loaded, setLoaded] = useState<{ key: string; blocks: Block[] } | null>(null);
  const [rise] = useState(() => new Animated.Value(0));
  const key = ayah ? `${ayah.s}:${ayah.a}:${kind}` : '';
  const blocks = loaded?.key === key ? loaded.blocks : null;
  const open = ayah !== null;

  useEffect(() => {
    if (open) Animated.timing(rise, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [open, rise]);
  const close = () => Animated.timing(rise, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());

  // the texts of the tab's sources, for this ayah (a newer ayah or tab replaces them)
  useEffect(() => {
    if (!ayah) return;
    let stale = false;
    const sources = (tafsirSources() as Source[]).filter((src) => (src.kind ?? 'tafsir') === kind);
    Promise.all(sources.map((src) => loadTafsir(src, ayah.s, ayah.a).catch(() => null))).then((texts) => {
      if (!stale) setLoaded({ key: `${ayah.s}:${ayah.a}:${kind}`, blocks: sources.map((src, i) => ({ src, paragraphs: texts[i] })) });
    });
    return () => {
      stale = true;
    };
  }, [ayah, kind]);

  const sheetH = Math.round(height * 0.62);
  const title = ayah ? t('ayahTitle', surahName(SURAHS[ayah.s - 1]), ayah.a) : '';

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.dim, opacity: rise }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={t('ahBack')} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetH,
            backgroundColor: c.panel,
            paddingBottom: insets.bottom + 8,
            transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [sheetH, 0] }) }],
          },
        ]}
      >
        <View style={[styles.grip, { backgroundColor: c.line }]} />
        <View style={styles.head}>
          <Txt size={18} weight={700} color={c.ink} style={{ flex: 1 }} numberOfLines={1}>
            {title}
          </Txt>
          <Pressable onPress={close} style={[styles.round, { backgroundColor: c.soft }]} accessibilityLabel={t('ahBack')}>
            <CloseIcon color={c.ink} size={20} />
          </Pressable>
        </View>

        <View style={[styles.tabs, { backgroundColor: c.soft }]}>
          {(['tafsir', 'translation'] as Kind[]).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={[styles.tab, kind === k && { backgroundColor: c.on }]}>
              <Txt size={15} weight={kind === k ? 700 : 500} center color={kind === k ? c.onInk : c.tabInk}>
                {t(k === 'tafsir' ? 'tafsir' : 'translation')}
              </Txt>
            </Pressable>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, gap: 22 }}>
          {!blocks && <ActivityIndicator color={c.gold} style={{ marginTop: 24 }} />}
          {blocks?.length === 0 && (
            <Txt size={16} center color={c.meta}>
              {t(kind === 'translation' ? 'noTranslation' : 'noTafsir')}
            </Txt>
          )}
          {blocks?.map(({ src, paragraphs }) => {
            const arabic = src.lang === 'ar';
            const size = arabic ? 18 : 16;
            const line = arabic ? 32 : 26;
            return (
              <View key={src.id} style={{ gap: 10 }}>
                {(paragraphs ?? [t('loadFailed')]).map((text, i) => (
                  <Txt key={i} size={size} lineHeight={line} color={c.text} style={{ textAlign: textSide(arabic ? 'right' : 'left'), writingDirection: arabic ? 'rtl' : 'ltr' }}>
                    {withQuotes(text.replace(/^## /, '')).map((part, j) => (
                      <Txt key={j} serif={part.quote} size={part.quote ? size + 2 : size} lineHeight={line} color={part.quote ? c.meta : c.text}>
                        {part.text}
                      </Txt>
                    ))}
                  </Txt>
                ))}
                <Txt size={13} weight={700} color={c.meta}>
                  {t('source', L(src.name, src.nameEn, src.nameFr || src.nameEn))}
                </Txt>
              </View>
            );
          })}
        </ScrollView>

        {/* previous on the left, next on the right, in every language (the row is laid out left to right on purpose) */}
        <View style={[styles.moves, { borderTopColor: c.divider }]}>
          <Pressable onPress={() => onMove(-1)} style={[styles.move, { borderColor: c.line }]}>
            <Chevron left color={c.ink} />
            <Txt size={15} weight={700} color={c.ink}>
              {L('السابقة', 'Previous', 'Précédent')}
            </Txt>
          </Pressable>
          <Pressable onPress={() => onMove(1)} style={[styles.move, { backgroundColor: c.on, borderColor: c.on }]}>
            <Txt size={15} weight={700} color={c.onInk}>
              {L('التالية', 'Next', 'Suivant')}
            </Txt>
            <Chevron color={c.onInk} />
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

function Chevron({ left, color }: { left?: boolean; color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={left ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 6 },
  round: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 11 },
  moves: { flexDirection: 'row', direction: 'ltr', gap: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  move: { flex: 1, flexDirection: 'row', direction: 'ltr', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 24, borderWidth: 1 },
});
