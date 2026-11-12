// A frosted-glass surface for Home (the two plans, the Continue button): a see-through white that is brighter at the top and fainter
// below, a hairline of light round its edge and a soft shadow, so it reads as glass lying on the page rather than a painted box.
// In dark mode the same, in a faint white on the dark page.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '@/theme/theme';

export function Glass({ radius = 16, style, children }: { radius?: number; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <View
      style={[
        styles.glass,
        {
          borderRadius: radius,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: isDark ? '0px 6px 16px rgba(0, 0, 0, 0.3)' : '0px 6px 16px rgba(20, 50, 38, 0.1)',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={isDark ? ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.05)'] : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.34)']}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: { borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
