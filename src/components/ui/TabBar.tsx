// The bottom bar: the app's only navigation bar, a floating glass pill. Purely presentational: it draws the tabs it is given (an icon
// over a name each; the chosen one on a white pill, in the accent) and calls their `onPress`; the navigator
// (src/app/(tabs)/_layout.tsx) turns its own state into these props. The tabs keep the layout's order, so in Arabic the first is at
// the right. `hidden` removes the bar (the Quran page, when a tap on the page hides everything).
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
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
  const { c, isDark } = useTheme();
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
      <View style={[styles.bar, { borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)', boxShadow: `0px 8px 24px ${c.shadow}` }]} accessibilityRole="tablist">
        <View style={[StyleSheet.absoluteFill, styles.glass]} pointerEvents="none">
          <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.glass }]} />
        </View>
        {tabs.map((tab) => {
          const color = tab.focused ? (isDark ? '#ffffff' : c.accent) : c.meta; // dark mode: the chosen tab is white
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
              <View style={[styles.pill, tab.focused && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : c.card, boxShadow: isDark ? undefined : `0px 2px 8px ${c.shadow}` }]}>
                {tab.icon(color, tab.focused)}
                <Txt size={11} weight={tab.focused ? 700 : 500} lineHeight={14} color={color} center numberOfLines={1}>
                  {tab.label}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  under: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 32, borderCurve: 'continuous', borderWidth: 1, paddingHorizontal: 6 },
  glass: { borderRadius: 31, borderCurve: 'continuous', overflow: 'hidden' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'stretch', marginHorizontal: 2, height: 48, borderRadius: 24, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', gap: 1 },
});
