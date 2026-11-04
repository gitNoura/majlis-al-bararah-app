// The head of a page opened from another (the Quran's settings, search): «back» and the page's name
// in the middle, as in the phone's own apps.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';

export function ScreenHeader({ title }: { title: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.side} accessibilityLabel={READER.back()}>
        <BackIcon color={c.ink} rtl={!isEnglish} />
      </Pressable>
      <Txt size={18} weight={700} center color={c.ink} numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </Txt>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
