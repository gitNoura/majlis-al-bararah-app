// The bottom bar of Read: search, notes, zoom (in, or back to the whole page when zoomed) and settings.
// It is the only bar on the Quran page (the app's tab bar is not shown there); Listen and Recite put their own
// controls in this same place.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { NotebookIcon, SearchIcon, SettingsIcon, ZoomInIcon, ZoomOutIcon } from '@/components/icons';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Props = { zoomed: boolean; onSearch: () => void; onNotes: () => void; onZoom: () => void; onSettings: () => void };

function Tool({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={[styles.round, { backgroundColor: c.surface2 }]}>
      {children}
    </Pressable>
  );
}

export function ReadBar({ zoomed, onSearch, onNotes, onZoom, onSettings }: Props) {
  const { c } = useTheme();
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Tool label={QURAN.search()} onPress={onSearch}>
          <SearchIcon color={c.ink} size={22} />
        </Tool>
        <Tool label={QURAN.notes()} onPress={onNotes}>
          <NotebookIcon color={c.ink} size={22} />
        </Tool>
        <Tool label={zoomed ? READER.wholePage() : QURAN.zoomIn()} onPress={onZoom}>
          {zoomed ? <ZoomOutIcon color={c.ink} size={22} /> : <ZoomInIcon color={c.ink} size={22} />}
        </Tool>
        <Tool label={READER.settingsTitle()} onPress={onSettings}>
          <SettingsIcon color={c.ink} size={22} />
        </Tool>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: 'center' },
  row: { alignSelf: 'stretch', maxWidth: 420, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
