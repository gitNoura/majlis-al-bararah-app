// The bottom bar: the app's only navigation bar, a floating glass pill, the same Glass as Home's cards. Purely presentational: it draws the tabs it is given (an icon
// over a name each; the chosen one on a white pill, in dark ink) and calls their `onPress`; the navigator
// (src/app/(tabs)/_layout.tsx) turns its own state into these props. The tabs keep the layout's order, so in Arabic the first is at
// the right. `hidden` removes the bar (the Quran page, when a tap on the page hides everything).
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/home/Glass';
import { Txt } from '@/components/Txt';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

export const TAB_BAR_H = 72; // the pill and the space round it, without the bottom safe area

export type TabItem = {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => ReactNode;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

// `backdrop`: a page-sized background to show under the bar, from the page's bottom edge up (the Home page's, so the bar sits on it); without
// it the bar sits on the app's page colour.
export function TabBar({ tabs, hidden, backdrop }: { tabs: TabItem[]; hidden?: boolean; backdrop?: ReactNode }) {
  const { c } = useTheme();
  const k = useSkin();
  const insets = useSafeAreaInsets();
  const screenH = useWindowDimensions().height;
  if (hidden) return null;
  return (
    <View style={[styles.wrap, { backgroundColor: backdrop ? undefined : c.screen, height: TAB_BAR_H + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {backdrop && (
        <View style={[styles.under, { height: screenH }]} pointerEvents="none">
          {backdrop}
        </View>
      )}
      <Glass radius={32} style={styles.bar}>
        {tabs.map((tab) => {
          const color = tab.focused ? k.pageInk : k.meta; // the chosen tab: the page's dark ink on the white pill, no colour
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
              <View style={[styles.pill, tab.focused && { backgroundColor: k.glassBtn }]}>
                {tab.icon(color, tab.focused)}
                <Txt size={11} weight={tab.focused ? 700 : 500} lineHeight={14} color={color} center numberOfLines={1}>
                  {tab.label}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  under: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'stretch', marginHorizontal: 2, height: 48, borderRadius: 24, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', gap: 1 },
});
