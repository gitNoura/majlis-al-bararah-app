// The head of the Hifdh page and of the screens inside it, in the home page's manner: «back», then the screen's name
// in large type at the start of the line (the plan page adds the date under it, as the home page does under
// its greeting). `onBack` is the page's own step back (a sheet, the plan questions); without it, back leaves the page.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish } from '@/i18n/i18n';
import { HOME } from '@/i18n/home';
import { useTheme } from '@/theme/theme';

export function HifHeader({ title, subtitle, big, onBack }: { title: string; subtitle?: string; big?: boolean; onBack?: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel={HOME.back()}>
        <BackIcon color={c.ink} rtl={!isEnglish} />
      </Pressable>
      <View style={styles.text}>
        <Txt size={big || subtitle ? 32 : 26} weight={800} color={c.ink} lineHeight={big || subtitle ? 46 : 38} numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt size={13.5} weight={500} color={c.meta}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 12, paddingBottom: 10 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  text: { paddingHorizontal: 10 },
});
