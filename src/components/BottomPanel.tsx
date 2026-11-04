// The panel along a screen's bottom edge, the same on every screen (the home screen's): full width, its
// top corners rounded, of acrylic glass over the screen (put it in the screen's <GlassBackdrop glass>),
// and its buttons side by side - an icon over its name.
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/Glass';
import { Txt } from '@/components/Txt';
import { useTheme } from '@/theme/theme';

// its height above the phone's own bottom edge (the gesture line)
export const PANEL_H = 62;

export function BottomPanel({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Glass acrylic style={[styles.panel, { height: PANEL_H + insets.bottom, paddingBottom: insets.bottom }]}>
      <View style={styles.row}>{children}</View>
    </Glass>
  );
}

// `on`: the screen's own button (its name in bold, nothing to do on a tap)
export function PanelTab({ label, icon, on, onPress }: { label: string; icon: ReactNode; on?: boolean; onPress?: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={on} style={({ pressed }) => [styles.tab, pressed && { opacity: 0.55 }]} accessibilityLabel={label}>
      {icon}
      <Txt size={12} weight={on ? 700 : 500} color={on ? c.ink : c.meta} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 },
  row: { flex: 1, alignSelf: 'stretch', flexDirection: 'row', paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
