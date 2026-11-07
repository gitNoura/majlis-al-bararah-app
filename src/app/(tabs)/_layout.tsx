// The app's one navigation bar: three tabs - Home, Hifdh, Settings - drawn by TabBar (src/components/ui).
// The Quran page is a route of this navigator but not a tab: Home opens it, it has no bar, and its own back button
// returns to Home.
// Everything else (adhkar, ahadith, qibla, the account...) opens over the tabs, from the stack in src/app/_layout.tsx.
//
// A screen hides the bar by setting its own option: navigation.setOptions({ tabBarStyle: { display: 'none' } })
// (the Quran page always does).
import { router, Tabs, type Href } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { HifdhIcon, HomeIcon, SettingsIcon } from '@/components/icons';
import { TabBar, type TabItem } from '@/components/ui';
import { HOME } from '@/i18n/home';

// the props the navigator gives a custom bar, taken from Tabs itself
type BarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: () => string; icon: (color: string) => ReactNode; href: Href }> = {
  index: { href: '/', label: () => HOME.tabHome(), icon: (color) => <HomeIcon color={color} /> },
  hifdh: { href: '/hifdh', label: () => HOME.tabMemorize(), icon: (color) => <HifdhIcon color={color} /> },
  settings: { href: '/settings', label: () => HOME.tabSettings(), icon: (color) => <SettingsIcon color={color} /> },
};

function AppTabBar({ state, descriptors }: BarProps) {
  const current = state.routes[state.index];
  const hidden = StyleSheet.flatten(descriptors[current.key]?.options.tabBarStyle)?.display === 'none';
  const tabs: TabItem[] = state.routes
    .filter((route) => route.name in TABS)
    .map((route) => {
      const focused = current.key === route.key;
      return {
        key: route.key,
        label: TABS[route.name].label(),
        icon: TABS[route.name].icon,
        focused,
        // the router switches tabs itself (this version's bar props carry no `navigation`)
        onPress: () => {
          if (!focused) router.navigate(TABS[route.name].href);
        },
      };
    });
  return <TabBar tabs={tabs} hidden={hidden} />;
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quran" />
      <Tabs.Screen name="hifdh" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
