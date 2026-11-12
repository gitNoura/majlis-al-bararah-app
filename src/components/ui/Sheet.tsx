// A sheet: a panel that rises from the bottom edge over a dimmed screen, with an optional title. It closes on
// a tap outside it, on the phone's back button, and on `onClose`. Its content scrolls when it is taller than
// 88 % of the screen. The bottom safe area is padded.
import { GlassBack } from '@/components/home/Glass';
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

type Props = { open: boolean; onClose: () => void; title?: string; children: ReactNode };

export function Sheet({ open, onClose, title, children }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }, Platform.OS !== 'web' && { direction: LANG === 'ar' ? 'rtl' : 'ltr' }]} onPress={onClose} accessibilityLabel={title}>
        {/* a tap inside the sheet must not reach the backdrop */}
        <Pressable onPress={() => {}} style={[styles.sheet, { paddingBottom: insets.bottom + space.md }]}>
          <GlassBack topOnly strong radius={radius.sheet} />
          <View style={[styles.handle, { backgroundColor: c.surface3 }]} />
          {!!title && (
            <Txt size={18} weight={700} color={c.ink} style={styles.title}>
              {title}
            </Txt>
          )}
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: space.md, paddingTop: space.sm, gap: space.sm },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, marginBottom: space.xs },
  title: { marginBottom: space.xs },
  // lets the list shrink to the sheet's maximum height, so what is taller than it scrolls instead of being cut off
  scroll: { flexShrink: 1 },
});
