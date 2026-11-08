// LIBRARY tab: the two libraries, Adhkar (Hisn al-Muslim, with the misbaha) and Hadith (Bukhari, Muslim, Nawawi's Forty).
// Each card opens the whole library (over the tabs, with its own back button).
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdhkarScene } from '@/components/AdhkarScene';
import { LibraryIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { Card, Chevron } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { isEnglish } from '@/i18n/i18n';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

const BAND = 128;

function Cover({ title, sub, onPress, children }: { title: string; sub: string; onPress: () => void; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Card elevated onPress={onPress} accessibilityLabel={title} style={{ padding: 0, gap: 0 }}>
      <View style={{ height: BAND }}>{children}</View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: space.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={19} weight={800} lineHeight={28} color={c.ink}>
            {title}
          </Txt>
          <Txt size={13.5} color={c.meta}>
            {sub}
          </Txt>
        </View>
        <Chevron />
      </View>
    </Card>
  );
}

export default function LibraryTab() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const evening = new Date().getHours() >= 12; // the morning's scene before noon, the evening's after
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.lg, paddingBottom: space.lg, gap: space.md }}>
        <Txt size={30} weight={800} lineHeight={40} color={c.ink}>
          {DASH.libraryTitle()}
        </Txt>
        <Cover title={DASH.libAdhkar()} sub={DASH.libAdhkarSub()} onPress={() => router.push('/adhkar')}>
          <View style={{ flex: 1 }} onLayout={(e) => setW(e.nativeEvent.layout.width)} pointerEvents="none">
            {w > 0 && <AdhkarScene evening={evening} width={w} height={BAND} mirrored={!isEnglish} />}
          </View>
        </Cover>
        <Cover title={DASH.libAhadith()} sub={DASH.libAhadithSub()} onPress={() => router.push('/ahadith')}>
          <LinearGradient colors={isDark ? ['#2a5a49', '#173f32'] : ['#3c7a62', '#1f5a45']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LibraryIcon size={60} color="rgba(255,255,255,0.88)" />
          </LinearGradient>
        </Cover>
      </ScrollView>
    </View>
  );
}
