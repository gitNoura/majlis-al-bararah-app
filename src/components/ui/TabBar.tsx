// The bottom bar: the app's only navigation bar, a floating pill in the same surface as the Quran's round buttons (src/theme/barLook.ts). Purely presentational: it draws the tabs it is given (an icon
// over a name each; the chosen one on a white pill, in dark ink) and calls their `onPress`; the navigator
// (src/app/(tabs)/_layout.tsx) turns its own state into these props. The tabs keep the layout's order, so in Arabic the first is at
// the right. `hidden` removes the bar (the Quran page, when a tap on the page hides everything).
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { useBarLook } from '@/theme/barLook';
import { useSkin } from '@/theme/homeSkin';

export const TAB_BAR_H = 72; // the pill and the space round it, without the bottom safe area

export type TabItem = {
  key: string;
  label: string;
  icon: (color: string, focused: boolean) => ReactNode;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

// The bar floats over the page (no background strip of its own), so each tab screen pads its bottom by TAB_BAR_H + the safe area.
export function TabBar({ tabs, hidden }: { tabs: TabItem[]; hidden?: boolean }) {
  const k = useSkin();
  const look = useBarLook('0px 8px 22px');
  const insets = useSafeAreaInsets();
  if (hidden) return null;
  return (
    <View style={[styles.wrap, { height: TAB_BAR_H + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
      <View style={[styles.bar, look]}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 8, justifyContent: 'flex-end' }, // floats over the page: no strip behind the pill
  bar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, borderRadius: 32, borderCurve: 'continuous' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'stretch', marginHorizontal: 2, height: 48, borderRadius: 24, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', gap: 1 },
});
