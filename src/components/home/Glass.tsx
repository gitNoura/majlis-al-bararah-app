// Frosted glass for Home (the two plans, the Continue button): a pane that blurs and tints what lies behind it, with a light
// hairline round its edge and a soft shadow. On the plain page there is little behind it to show through, so it reads as a faint
// frosted white. expo-blur is loaded defensively: a build without its native module shows a plain see-through tint instead of crashing.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
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

const styles = StyleSheet.create({
  glass: { borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
