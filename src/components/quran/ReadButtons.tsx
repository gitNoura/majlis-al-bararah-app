// Read's two buttons at the bottom corners of the page: «My marks» and the Quran's settings, each its own round paper
// button (no bar). They float over the empty room under the page, well in from the screen's edges. The row follows the
// layout's direction, so in Arabic My marks is at the right and settings at the left.
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarksIcon, SettingsIcon } from '@/components/icons';
import { Tool } from '@/components/quran/QuranHeader';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export function ReadButtons({ onMarks }: { onMarks: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.row, { bottom: insets.bottom + space.md + space.sm }]}>
      <Tool size={50} label={QURAN.notes()} onPress={onMarks}>
        <MarksIcon color={c.ink} size={25} />
      </Tool>
      <Tool size={50} label={READER.settingsTitle()} onPress={() => router.push('/quran-settings')}>
        <SettingsIcon color={c.ink} size={23} />
      </Tool>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', left: space.lg + space.sm, right: space.lg + space.sm, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
});
