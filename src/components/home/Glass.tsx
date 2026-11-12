// Frosted glass for Home (the two plans, the Continue button): a pane that blurs and tints what lies behind it (the soft colour of
// <GlassBackdrop>), with a light hairline round its edge and a soft shadow. Glass is only glass if there is something to see
// through it, so it is always used over the backdrop. expo-blur is loaded defensively: a build without its native module shows a
// plain see-through tint instead of crashing.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ComponentType, ReactNode } from 'react';

import { useTheme } from '@/theme/theme';

type Blur = ComponentType<{ intensity?: number; tint?: string; style?: StyleProp<ViewStyle> }>;
let BlurView: Blur | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded on purpose inside try: a build without the native module must not crash
  BlurView = require('expo-blur').BlurView;
} catch {
  BlurView = null;
}

export function Glass({ radius = 18, style, children }: { radius?: number; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <View
      style={[
        styles.glass,
        {
          borderRadius: radius,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: isDark ? '0px 8px 20px rgba(0, 0, 0, 0.35)' : '0px 8px 20px rgba(20, 50, 38, 0.12)',
        },
        style,
      ]}
    >
      {BlurView && <BlurView intensity={isDark ? 30 : 38} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />}
      <LinearGradient
        colors={isDark ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)'] : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.16)']}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

// The soft colour behind the glass: a few large blurred glows (sage, sky, sand) that the panes blur and tint. Put it as the first
// child of a relatively-positioned view that holds the glass.
export function GlassBackdrop() {
  const { isDark } = useTheme();
  const glows = isDark
    ? [{ id: 'a', c: '#3f8a6a', x: 0.15, y: 0.25, r: 0.5, o: 0.55 }, { id: 'b', c: '#4b7f9a', x: 0.85, y: 0.55, r: 0.55, o: 0.45 }, { id: 'c', c: '#9a8446', x: 0.5, y: 0.95, r: 0.45, o: 0.35 }]
    : [{ id: 'a', c: '#8cc9a8', x: 0.15, y: 0.25, r: 0.5, o: 0.85 }, { id: 'b', c: '#9fcbe0', x: 0.85, y: 0.55, r: 0.55, o: 0.75 }, { id: 'c', c: '#efd9a0', x: 0.5, y: 0.95, r: 0.45, o: 0.7 }];
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        {glows.map((g) => (
          <RadialGradient key={g.id} id={g.id} cx={g.x} cy={g.y} r={g.r} fx={g.x} fy={g.y}>
            <Stop offset="0" stopColor={g.c} stopOpacity={g.o} />
            <Stop offset="1" stopColor={g.c} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {glows.map((g) => (
        <Rect key={g.id} x="0" y="0" width="100%" height="100%" fill={`url(#${g.id})`} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  glass: { borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
