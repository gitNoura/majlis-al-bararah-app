// The bottom bar of Read: settings, search and «My marks».
// It is the only bar on the Quran page (the app's tab bar is not shown there); Listen and Recite put their own
// controls in this same place. Settings come first, so in Arabic (right to left) they sit at the right end of the bar.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MarksIcon, SearchIcon, SettingsIcon } from '@/components/icons';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Props = { onSearch: () => void; onNotes: () => void; onSettings: () => void };

function Tool({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.round, pressed && { backgroundColor: c.surface2 }]}>
      {children}
    </Pressable>
  );
}

export function ReadBar({ onSearch, onNotes, onSettings }: Props) {
  const { c } = useTheme();
  return (
    <View style={styles.box}>
      <View style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}>
        <Tool label={READER.settingsTitle()} onPress={onSettings}>
          <SettingsIcon color={c.ink} size={25} />
        </Tool>
        <Tool label={QURAN.search()} onPress={onSearch}>
          <SearchIcon color={c.ink} size={25} />
        </Tool>
        <Tool label={QURAN.notes()} onPress={onNotes}>
          <MarksIcon color={c.ink} size={25} />
        </Tool>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  row: { alignSelf: 'stretch', maxWidth: 420, height: 64, borderRadius: 32, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.sm, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0px 8px 22px rgba(20, 50, 38, 0.14)' },
  round: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
