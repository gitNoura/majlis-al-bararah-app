// A placeholder for a tab that is still being rebuilt: its name, a line saying so, and rows that open the existing
// screens, so nothing already built is out of reach meanwhile. Removed as each tab gets its real screen.
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Card, Row } from '@/components/ui';
import { NAV } from '@/i18n/nav';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export type StubLink = { title: string; sub?: string; href: Href };

export function TabStub({ title, links }: { title: string; links: StubLink[] }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.lg, gap: space.md }}>
        <Txt size={32} weight={800} color={c.ink}>
          {title}
        </Txt>
        <Txt size={14} color={c.meta}>
          {NAV.rebuilding()}
        </Txt>
        <Card style={styles.card}>
          {links.map((l, i) => (
            <Row key={String(l.title)} title={l.title} sub={l.sub} chevron onPress={() => router.push(l.href)} last={i === links.length - 1} />
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ card: { paddingVertical: space.xs } });
