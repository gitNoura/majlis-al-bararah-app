// A section still to be built: its title under «back», on the ivory screen of the Quran's pages.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { isEnglish } from '@/i18n/i18n';
import { useTheme } from '@/theme/theme';

export function Coming({ title }: { title: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.screen, paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={HOME.back()} style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <BackIcon color={c.ink} rtl={!isEnglish} />
      </Pressable>
      <Txt serif size={28} weight={700} center color={c.ink} style={{ marginTop: 4 }}>
        {title}
      </Txt>
      <Txt size={14} center color={c.meta} style={{ marginTop: 24 }}>
        {HOME.coming()}
      </Txt>
    </View>
  );
}
