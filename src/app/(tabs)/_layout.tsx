// The app's one navigation bar: five tabs - Home, Quran, Hifdh, Library, Settings - drawn by TabBar (src/components/ui).
// The Quran page is a tab, but once open it hides the bar and has its own back button, which returns to Home.
// Everything else (adhkar, ahadith, qibla, the account...) opens over the tabs, from the stack in src/app/_layout.tsx.
//
// A screen hides the bar by setting its own option: navigation.setOptions({ tabBarStyle: { display: 'none' } })
// (the Quran page always does).
import { router, Tabs, type Href } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { TabBar, type TabItem, TabHifdhIcon, TabHomeIcon, TabLibraryIcon, TabQuranIcon, TabSettingsIcon } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';

// the props the navigator gives a custom bar, taken from Tabs itself
type BarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: () => string; icon: (color: string, active: boolean) => ReactNode; href: Href }> = {
  index: { href: '/', label: () => HOME.tabHome(), icon: (color, active) => <TabHomeIcon color={color} active={active} /> },
  quran: { href: '/quran', label: () => HOME.tabQuran(), icon: (color, active) => <TabQuranIcon color={color} active={active} /> },
  hifdh: { href: '/hifdh', label: () => HOME.tabMemorize(), icon: (color, active) => <TabHifdhIcon color={color} active={active} /> },
  library: { href: '/library', label: () => DASH.tabLibrary(), icon: (color, active) => <TabLibraryIcon color={color} active={active} /> },
  settings: { href: '/settings', label: () => HOME.tabSettings(), icon: (color, active) => <TabSettingsIcon color={color} active={active} /> },
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
  return <TabBar tabs={tabs} hidden={hidden} backdrop={current.name === 'index' ? <HomeBackdrop /> : undefined} />; // on Home the bar sits on Home's own page
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quran" />
      <Tabs.Screen name="hifdh" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
