// Read's bottom bar, in the same pill as Listen's and Recite's: the reader's marks one by one (the pages with a bookmark,
// the highlights, the comments) and the Quran's settings (a long label such as «Quran settings» takes two lines). A mark button opens its own list (MarksSheet.tsx). The row
// follows the layout's direction, so in Arabic it begins at the right.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BarBookmarkIcon, BarCommentIcon, BarHighlightIcon } from '@/components/quran/BarIcons';
import type { Tab } from '@/components/quran/MarksSheet';
import { TabSettingsIcon } from '@/components/ui/TabIcons';
import { Txt } from '@/components/Txt';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useBarLook } from '@/theme/barLook';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';

export const READ_BAR_H = 64;

// The bar wears the same surface as the round buttons at the top of the page and as the main bottom bar, and the same icon family
// as that bar (src/components/ui/TabIcons.tsx): a slim solid glyph over a short name.
export function ReadButtons({ onMarks }: { onMarks: (tab: Tab) => void }) {
  const h = useHome();
  const look = useBarLook('0px 8px 22px');
  const item = (label: string, onPress: () => void, icon: ReactNode) => (
    <Pressable key={label} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
      {icon}
      <Txt size={11} weight={500} lineHeight={14} color={h.meta} center numberOfLines={2}>
        {label}
      </Txt>
    </Pressable>
  );
  return (
    <View style={styles.box}>
      <View style={[styles.pill, look]}>
        {item(QURAN.marksPages(), () => onMarks('pages'), <BarBookmarkIcon color={h.ink} />)}
        {item(QURAN.marksHighlights(), () => onMarks('highlights'), <BarHighlightIcon color={h.ink} />)}
        {item(QURAN.marksComments(), () => onMarks('comments'), <BarCommentIcon color={h.ink} />)}
        {item(READER.settingsTitle(), () => router.push('/quran-settings'), <TabSettingsIcon color={h.ink} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  pill: { alignSelf: 'stretch', maxWidth: 520, height: READ_BAR_H, borderRadius: READ_BAR_H / 2, borderCurve: 'continuous', flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
});
