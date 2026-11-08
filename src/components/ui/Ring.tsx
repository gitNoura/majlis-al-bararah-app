// A ring with a label inside it: `value` 0 to 1, drawn from the top, clockwise. The label is what shows in the middle
// (a percentage, say); `a11y` is what a screen reader says.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const R = 40;
const CIRC = 2 * Math.PI * R;

export function Ring({ value, size = 56, children, a11y, color, track }: { value: number; size?: number; children?: ReactNode; a11y?: string; color?: string; track?: string }) {
  const { c } = useTheme();
  const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={a11y}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx={48} cy={48} r={R} stroke={track ?? c.surface3} strokeWidth={10} fill="none" />
        {v > 0 && (
          <Circle
            cx={48}
            cy={48}
            r={R}
            stroke={color ?? c.accent}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - v)}
            transform="rotate(-90 48 48)"
          />
        )}
      </Svg>
      <View style={styles.inside} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ inside: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' } });
