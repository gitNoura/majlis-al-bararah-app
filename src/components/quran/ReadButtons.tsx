// Read's two buttons at the bottom corners of the page: search and the Quran's settings, each its own round paper button
// (no bar). They float over the paper's empty room under the page. The row follows the layout's direction, so in Arabic
// search is at the right and settings at the left.
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon, SettingsIcon } from '@/components/icons';
import { Tool } from '@/components/quran/QuranHeader';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export function ReadButtons({ onSearch }: { onSearch: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.row, { bottom: insets.bottom + space.sm }]}>
      <Tool size={50} label={QURAN.search()} onPress={onSearch}>
        <SearchIcon color={c.ink} size={23} />
      </Tool>
      <Tool size={50} label={READER.settingsTitle()} onPress={() => router.push('/quran-settings')}>
        <SettingsIcon color={c.ink} size={23} />
      </Tool>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', left: space.md, right: space.md, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
});
