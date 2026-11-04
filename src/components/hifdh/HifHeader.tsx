// The head of the Hifdh page and of the screens inside it: «back» and the screen's name in the middle.
// `onBack` is the page's own step back (a sheet, the plan questions); without it, back leaves the page.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish } from '@/i18n/i18n';
import { HOME } from '@/i18n/home';
import { useTheme } from '@/theme/theme';

export function HifHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={10} style={styles.side} accessibilityRole="button" accessibilityLabel={HOME.back()}>
        <BackIcon color={c.ink} rtl={!isEnglish} />
      </Pressable>
      <Txt serif size={22} weight={700} center color={c.ink} numberOfLines={1} style={styles.title}>
        {title}
      </Txt>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 6 },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
});
