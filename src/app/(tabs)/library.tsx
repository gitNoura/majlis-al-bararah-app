// LIBRARY tab: the two libraries, Adhkar (Hisn al-Muslim, with the misbaha) and Hadith (Bukhari, Muslim, Nawawi's Forty).
// As plain as Home (src/theme/homeSkin.ts, homeType.ts): the neutral page and two panels, each with its name, a line under it and
// the round arrow of the Reading card. Adhkar is white, Hadith the light green of Home's plans card. No pictures, nothing moving.
// Each card opens the whole library (over the tabs, with its own back button).
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ScreenBackground } from '@/components/Stars';
import { Panel } from '@/components/home/Panel';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { LANG } from '@/i18n/i18n';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

// an arrow that points to the end of the line (left in Arabic)
function Arrow({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={LANG === 'ar' ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
    </Svg>
  );
}

function Cover({ title, sub, onPress, soft }: { title: string; sub: string; onPress: () => void; soft?: boolean }) {
  const k = useSkin();
  const go = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };
  return (
    <Pressable onPress={go} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => pressed && { opacity: 0.88 }}>
      <Panel tone={soft ? 'soft' : 'surface'} style={styles.card}>
        <View style={styles.words}>
          <Txt {...T.big} size={22} lineHeight={30} color={k.ink} numberOfLines={1}>
            {title}
          </Txt>
          <Txt {...T.small} color={k.meta} numberOfLines={2}>
            {sub}
          </Txt>
        </View>
        <View style={[styles.go, { backgroundColor: k.goBg }]}>
          <Arrow color={k.goInk} />
        </View>
      </Panel>
    </Pressable>
  );
}

export default function LibraryTab() {
  const k = useSkin();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.md, paddingTop: insets.top + space.lg, paddingBottom: space.lg, gap: space.md }}>
        <Txt {...T.greeting} size={26} lineHeight={34} color={k.ink}>
          {DASH.libraryTitle()}
        </Txt>
        <Cover title={DASH.libAdhkar()} sub={DASH.libAdhkarSub()} onPress={() => router.push('/adhkar')} />
        <Cover soft title={DASH.libAhadith()} sub={DASH.libAhadithSub()} onPress={() => router.push('/ahadith')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: 20, borderCurve: 'continuous', overflow: 'hidden', padding: space.md, minHeight: 92 },
  words: { flex: 1, gap: 2 },
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
