// The head of a page opened from another (the Quran's settings, search): «back» and the page's name
// in the middle, as in the phone's own apps; `end`: buttons at the other end (e.g. the saved hadiths).
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';

// `ink`: the colour of its words and «back» (over a painted page)
export function ScreenHeader({ title, end, ink }: { title: string; end?: ReactNode; ink?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.head, { paddingTop: insets.top + 6 }]}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.side} accessibilityLabel={READER.back()}>
        <BackIcon color={ink ?? c.ink} rtl={!isEnglish} />
      </Pressable>
      {/* the name in the middle of the screen, whatever is at the ends */}
      <View style={[styles.title, { top: insets.top + 6 }]} pointerEvents="none">
        <Txt size={18} weight={700} center color={ink ?? c.ink} numberOfLines={1}>
          {title}
        </Txt>
      </View>
      <View style={styles.end}>{end}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { position: 'absolute', left: 104, right: 104, height: 44, justifyContent: 'center' },
  end: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 2, minHeight: 44 },
});
