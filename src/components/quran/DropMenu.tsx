// A drop-down menu: a small card that opens under a button at the top of the screen, over a transparent backdrop (a
// tap outside closes it). `side` is the physical side of the screen it hangs from. Items may show a chosen mark.
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { FrostBack } from '@/components/home/Glass';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export type DropItem = { key: string; label: string; icon?: ReactNode; chosen?: boolean; onPress: () => void };

type Props = { open: boolean; onClose: () => void; top: number; side: 'left' | 'right'; items: DropItem[] };

export function DropMenu({ open, onClose, top, side, items }: Props) {
  const { c } = useTheme();
  const h = useHome();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* a Modal is its own window: the language's direction is set again inside it */}
      <View style={[StyleSheet.absoluteFill, Platform.OS !== 'web' && { direction: LANG === 'ar' ? 'rtl' : 'ltr' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={items[0]?.label} />
        <View style={[styles.menu, { top, [side]: space.md, borderColor: h.cardLine }]}>
          <FrostBack radius={22} />
          {items.map((item, i) => (
            <Pressable
              key={item.key}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: !!item.chosen }}
              style={({ pressed }) => [styles.item, i < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider }, pressed && { opacity: 0.6 }]}
            >
              {item.icon}
              <Txt size={15.5} weight={item.chosen ? 700 : 500} color={c.ink} style={{ flex: 1 }}>
                {item.label}
              </Txt>
              {item.chosen && <CheckIcon color={h.leaf} size={18} />}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: { position: 'absolute', minWidth: 190, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', boxShadow: '0px 12px 28px rgba(20, 50, 38, 0.18)' },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 4, paddingHorizontal: space.md, minHeight: 48 },
});
