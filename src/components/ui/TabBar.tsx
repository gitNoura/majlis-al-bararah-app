// The bottom bar: the app's only navigation bar. Purely presentational: it draws the tabs it is given (an icon over
// a name each, the chosen one in the accent) and calls their `onPress`; the navigator (src/app/(tabs)/_layout.tsx)
// turns its own state into these props. The tabs keep the layout's order, so in Arabic the first is at the right.
// `hidden` removes the bar (the Quran page, when a tap on the page hides everything).
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { useTheme } from '@/theme/theme';

export const TAB_BAR_H = 62; // without the bottom safe area

export type TabItem = {
  key: string;
  label: string;
  icon: (color: string) => ReactNode;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabBar({ tabs, hidden }: { tabs: TabItem[]; hidden?: boolean }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  if (hidden) return null;
  return (
    <View style={[styles.bar, { backgroundColor: c.card, borderTopColor: c.line, height: TAB_BAR_H + insets.bottom, paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const color = tab.focused ? c.accent : c.meta;
        return (
          <Pressable
            key={tab.key}
            onPress={tab.onPress}
            onLongPress={tab.onLongPress}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: tab.focused }}
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.6 }]}
          >
            <View style={[styles.pill, tab.focused && { backgroundColor: c.accentSoft }]}>{tab.icon(color)}</View>
            <Txt size={12} weight={tab.focused ? 700 : 500} color={color} center numberOfLines={1}>
              {tab.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 6 },
  pill: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
