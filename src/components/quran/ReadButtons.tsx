// Read's bottom bar, in the same pill as Listen's and Recite's: the reader's marks one by one (the pages with a bookmark,
// the highlights, the comments) and the Quran's settings (a long label such as «Quran settings» takes two lines). A mark button opens its own list (MarksSheet.tsx). The row
// follows the layout's direction, so in Arabic it begins at the right.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SettingsIcon } from '@/components/icons';
import type { Tab } from '@/components/quran/MarksSheet';
import { BookmarkIcon, BubbleIcon, MarkerIcon } from '@/components/quran/MenuIcons';
import { Txt } from '@/components/Txt';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const READ_BAR_H = 64;

export function ReadButtons({ onMarks }: { onMarks: (tab: Tab) => void }) {
  const { c } = useTheme();
  const item = (label: string, onPress: () => void, icon: ReactNode) => (
    <Pressable key={label} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
      {icon}
      <Txt size={11.5} weight={600} color={c.meta} center numberOfLines={2}>
        {label}
      </Txt>
    </Pressable>
  );
  return (
    <View style={styles.box}>
      <View style={[styles.pill, { backgroundColor: c.card, borderColor: c.line }]}>
        {item(QURAN.marksPages(), () => onMarks('pages'), <BookmarkIcon color={c.ink} size={22} />)}
        {item(QURAN.marksHighlights(), () => onMarks('highlights'), <MarkerIcon color={c.ink} size={22} />)}
        {item(QURAN.marksComments(), () => onMarks('comments'), <BubbleIcon color={c.ink} size={22} />)}
        {item(READER.settingsTitle(), () => router.push('/quran-settings'), <SettingsIcon color={c.ink} size={22} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  pill: { alignSelf: 'stretch', maxWidth: 520, height: READ_BAR_H, borderRadius: READ_BAR_H / 2, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, boxShadow: '0px 8px 22px rgba(20, 50, 38, 0.14)' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6 },
});
