// The options of an ayah, in a small box beside the finger when an ayah is tapped (the website's
// #ayah-menu): its name, its tafsir and translation, a comment of one's own («add a comment», or «your
// comment» when there is one), five highlight colours (the one chosen ringed in gold), and «remove the
// highlight» when it has one. Frosted glass with a thin light rim and a soft shadow, as the website's;
// it opens with a small rise. A tap anywhere else closes it.
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { CloseIcon } from '@/components/icons';
import { BookIcon, BubbleIcon, MarkerIcon } from '@/components/quran/MenuIcons';
import { Txt } from '@/components/Txt';
import { surahTitle, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { HL_COLORS, removeHighlight, setHighlight, useMarks } from '@/lib/marks';
import { SURAHS } from '@/lib/quran';
import { serif } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

export type MenuAt = { s: number; a: number; x: number; y: number };

const W = 268;

export function AyahMenu({ at, onClose, onTafsir, onNote }: { at: MenuAt | null; onClose: () => void; onTafsir: () => void; onNote: () => void }) {
  const { c, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const [h, setH] = useState(0); // the box's height, once laid out
  const marked = useMarks();
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.set(0);
    if (at) rise.set(withTiming(1, { duration: 170, easing: Easing.out(Easing.cubic) }));
  }, [at, rise]);
  const shown = useAnimatedStyle(() => ({
    opacity: h ? rise.get() : 0,
    transform: [{ translateY: (1 - rise.get()) * 6 }, { scale: 0.97 + rise.get() * 0.03 }],
  }));

  if (!at) return null;
  const key = `${at.s}:${at.a}`;
  const lit = marked.highlightOf(key);
  const name = surahTitle(SURAHS[at.s - 1]).replace(/^سورة /, '');
  // beside the finger, inside the screen: under it if there is room, else over it
  const left = Math.min(Math.max(12, at.x - W / 2), width - W - 12);
  const top = at.y + 18 + h < height - 12 ? at.y + 18 : Math.max(12, at.y - h - 18);

  const choose = (color: string) => {
    onClose();
    setHighlight(key, color);
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={READER.close()} />
      <Animated.View
        onLayout={(e) => setH(e.nativeEvent.layout.height)}
        style={[
          styles.box,
          {
            left,
            top,
            backgroundColor: isDark ? 'rgba(44, 47, 45, 0.97)' : 'rgba(252, 250, 245, 0.98)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            boxShadow: isDark
              ? '0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 18px 44px rgba(0, 0, 0, 0.45)'
              : '0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 18px 44px rgba(0, 0, 0, 0.18)',
          },
          shown,
        ]}
      >
        <Txt size={15} weight={700} color={c.goldStrong} style={[styles.title, { fontFamily: serif(700), borderBottomColor: c.divider }]} numberOfLines={1}>
          {t('ayahTitle', name, at.a)}
        </Txt>

        <Item icon={<BookIcon color={c.ink} />} label={READER.tafsirRow()} onPress={onTafsir} />
        <Item icon={<BubbleIcon color={c.ink} />} label={t(marked.noteOf(key) ? 'noteEdit' : 'noteAdd')} onPress={onNote} />

        {/* the highlight colours */}
        <View style={styles.row}>
          <MarkerIcon color={c.ink} />
          <View style={styles.dots}>
            {HL_COLORS.map((col) => {
              const on = lit?.color === col.id;
              return (
                <Pressable
                  key={col.id}
                  onPress={() => choose(col.id)}
                  hitSlop={4}
                  accessibilityLabel={t('highlight')}
                  style={[
                    styles.dot,
                    { backgroundColor: col.dot, borderColor: isDark ? '#2c2f2d' : '#ffffff' },
                    { boxShadow: on ? `0px 0px 0px 2px ${c.goldStrong}` : `0px 0px 0px 1px ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}` },
                    on && { transform: [{ scale: 1.08 }] },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {lit && (
          <Item
            icon={<CloseIcon color="#a3243b" size={18} />}
            label={t('removeHighlight')}
            color="#a3243b"
            onPress={() => {
              onClose();
              removeHighlight(key);
            }}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

function Item({ icon, label, onPress, color }: { icon: ReactNode; label: string; onPress: () => void; color?: string }) {
  const { c, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)' }]}
    >
      {icon}
      <Txt size={15} weight={700} color={color ?? c.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', width: W, padding: 8, borderRadius: 18, borderWidth: 1 },
  title: { marginHorizontal: 8, marginTop: 2, marginBottom: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 11, borderRadius: 11 },
  dots: { flexDirection: 'row', gap: 8, marginStart: 'auto' },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
});
