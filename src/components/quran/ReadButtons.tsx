// Read's two buttons, «My marks» and the Quran's settings, held together in one slim paper pill centred at the bottom
// (no bar, no buttons out at the corners). It floats over the empty room under the page. The row follows the layout's
// direction, so in Arabic My marks is at the right and settings at the left.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarksIcon, SettingsIcon } from '@/components/icons';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export function ReadButtons({ onMarks }: { onMarks: () => void }) {
  const { c } = useTheme();
  const h = useHome();
  const insets = useSafeAreaInsets();
  const button = (label: string, onPress: () => void, icon: ReactNode) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={styles.button}>
      {icon}
    </Pressable>
  );
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + space.md }]}>
      <View style={[styles.pill, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 4px 12px ${h.shadow}` }]}>
        {button(QURAN.notes(), onMarks, <MarksIcon color={c.ink} size={23} />)}
        <View style={[styles.divider, { backgroundColor: h.cardLine }]} />
        {button(READER.settingsTitle(), () => router.push('/quran-settings'), <SettingsIcon color={c.ink} size={22} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 5 },
  pill: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.xs },
  button: { width: 56, height: 44, alignItems: 'center', justifyContent: 'center' },
  divider: { width: StyleSheet.hairlineWidth, height: 22 },
});
