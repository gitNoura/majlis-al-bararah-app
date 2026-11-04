// What the Ahadith screens share: opening a book or a hadith, a quiet note (loading, offline, no
// results), the short message at the bottom after copying or saving, the button for the language the
// hadiths are read in, and the «back to the top» button of a long page.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, LanguageIcon, ToTopIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HADITH } from '@/i18n/ahadith';
import { isEnglish } from '@/i18n/i18n';
import { setReadLang, useReadLang, type BookId, type ReadLang } from '@/lib/hadith';
import { ltr } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

// a book's kitabs; an-Nawawi has only one, opened at once
export function openBook(b: BookId) {
  if (b === 'nawawi') router.push({ pathname: '/hadith-kitab', params: { b, k: '1' } });
  else router.push({ pathname: '/hadith-book', params: { b } });
}

// a kitab, at the hadith numbered n
export const openHadith = (b: BookId, k: number, n?: string) =>
  router.push({ pathname: '/hadith-kitab', params: n ? { b, k: String(k), n } : { b, k: String(k) } });

export function Note({ text }: { text: string }) {
  const { c } = useTheme();
  return (
    <Txt size={14} center color={c.meta} style={{ marginVertical: 8 }}>
      {text}
    </Txt>
  );
}

// [the message, show(text)]: shown 1.8 s at the bottom
export function useToast() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = (t: string) => {
    setText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(''), 1800);
  };
  const toast = text ? (
    <View pointerEvents="none" style={[styles.toast, { bottom: insets.bottom + 24, backgroundColor: c.on }]}>
      <Txt size={14} weight={500} color={c.onInk}>
        {text}
      </Txt>
    </View>
  ) : null;
  return [toast, show] as const;
}

// The language the hadiths are read in, apart from the app's own: a globe in the top bar; a tap opens
// a small plain menu under it - ع (Arabic), EN (English), ع / EN (both).
export function ReadLangButton() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const lang = useReadLang();
  const [open, setOpen] = useState(false);
  // short marks; «both» in pieces drawn left to right, so ع stays before EN in every layout
  const options: [ReadLang, string[], string][] = [
    ['ar', ['ع'], HADITH.arabic()],
    ['en', ['EN'], HADITH.english()],
    ['both', ['ع', ' / ', 'EN'], HADITH.both()],
  ];
  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={6} accessibilityLabel={HADITH.readIn()} style={styles.langBtn}>
        <LanguageIcon color={c.ink} size={22} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {/* a plain menu just under the button: one row a choice, a tick on the chosen one */}
        <View
          style={[
            styles.menu,
            { top: insets.top + 48, [isEnglish ? 'right' : 'left']: 12, backgroundColor: c.surface, borderColor: c.line, boxShadow: `0px 6px 18px ${c.dim}` },
          ]}
        >
          {options.map(([v, mark, name], i) => {
            const on = v === lang;
            return (
              <Pressable
                key={v}
                onPress={() => {
                  setReadLang(v);
                  setOpen(false);
                }}
                accessibilityLabel={name}
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [
                  styles.option,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider },
                  pressed && { backgroundColor: c.soft },
                ]}
              >
                {/* every row at the start of the line; the pieces inside left to right */}
                <View style={styles.markRow}>
                  <View style={[styles.mark, ltr()]}>
                    {mark.map((piece, k) => (
                      <Txt key={k} size={15} weight={on ? 700 : 500} color={c.ink}>
                        {piece}
                      </Txt>
                    ))}
                  </View>
                </View>
                {on && <CheckIcon color={c.ink} size={18} />}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

// [onScroll for the list, the button]: «back to the top» - a see-through round at the bottom of the
// screen, in the middle, shown once the page has gone more than a screen and a half down; the page
// shows through it, so it hides nothing. `toTop` scrolls the list.
export function useToTop(toTop: () => void) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [shown, setShown] = useState(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const deep = e.nativeEvent.contentOffset.y > height * 1.5;
    if (deep !== shown) setShown(deep);
  };
  const button = shown ? (
    <Pressable
      onPress={toTop}
      hitSlop={8}
      accessibilityLabel={HADITH.toTop()}
      style={({ pressed }) => [
        styles.top,
        {
          bottom: insets.bottom + 16,
          backgroundColor: isDark ? 'rgba(40, 43, 41, 0.45)' : 'rgba(255, 255, 255, 0.5)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <ToTopIcon color={c.ink} size={20} />
    </Pressable>
  ) : null;
  return [onScroll, button] as const;
}

const styles = StyleSheet.create({
  langBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  menu: { position: 'absolute', width: 118, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 12 },
  markRow: { flex: 1, alignItems: 'flex-start' },
  mark: { flexDirection: 'row', alignItems: 'center' },
  top: { position: 'absolute', alignSelf: 'center', width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.25)' },
});
