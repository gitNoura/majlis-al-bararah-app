// A panel of Home's, the Library's and the Hifdh page's: Home's glass (a frosted, see-through box with a soft light along its
// edges), the same for the white (`surface`) and the `soft` tone, so no box is green. `tone` is kept for the callers.
//   raised  a solid box with a hairline edge and a soft shadow, so it stands off the page instead of blending into it (the Hifdh page).
//           tone `soft` is Home's light green; tone `done` a slightly deeper one: the work in it is finished.
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { ReactNode } from 'react';

import { LinearGradient } from 'expo-linear-gradient';

import { GlassBack } from '@/components/home/Glass';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

type Props = { tone?: 'surface' | 'soft' | 'done'; raised?: boolean; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function Panel({ tone, raised, style, children }: Props) {
  const k = useSkin();
  const { isDark } = useTheme();
  const radius = StyleSheet.flatten(style)?.borderRadius ?? 20;

  // at night a raised panel is the same lit glass as Home's cards (gradient, layered shadow, no outline)
  if (raised && isDark && tone !== 'done') {
    const r = typeof radius === 'number' ? radius : 20;
    return (
      <View style={[style, { backgroundColor: k.glass, borderCurve: 'continuous', boxShadow: k.cardShadow }]}>
        <LinearGradient pointerEvents="none" colors={[k.glassTop, k.glassBottom]} style={[StyleSheet.absoluteFill, { borderRadius: r, borderCurve: 'continuous' }]} />
        {children}
      </View>
    );
  }

  if (raised) {
    const done = tone === 'done';
    const look = {
      backgroundColor: done ? k.doneBg : tone === 'soft' ? k.soft : k.surface,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: done ? k.doneLine : k.hairline,
      boxShadow: `0px 4px 16px ${k.glassShadow}`,
    } as const;
    // a card that has just been completed fades its green in
    return done ? (
      <Animated.View entering={FadeIn.duration(350)} style={[style, look]}>
        {children}
      </Animated.View>
    ) : (
      <View style={[style, look]}>{children}</View>
    );
  }

  return (
    <View style={style}>
      <GlassBack radius={typeof radius === 'number' ? radius : 20} />
      {children}
    </View>
  );
}
