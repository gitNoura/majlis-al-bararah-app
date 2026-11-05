// A small ring with a percentage inside: how far the reader is through their plans (plan.planProgress()).
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

const R = 40;
const CIRC = 2 * Math.PI * R;

export function ProgressRing({ size = 52, inside = true }: { size?: number; inside?: boolean }) {
  const { c } = useTheme();
  const p = plan.planProgress();
  const pct = p == null ? 0 : Math.round(p * 100);
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={`${pct}%`}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx={48} cy={48} r={R} stroke={c.line} strokeWidth={10} fill="none" />
        {pct > 0 && (
          <Circle
            cx={48}
            cy={48}
            r={R}
            stroke={c.on}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            transform="rotate(-90 48 48)"
          />
        )}
      </Svg>
      <View style={styles.pct} pointerEvents="none">
        {(inside || p == null) && (
          <Txt size={size * (inside ? 0.27 : 0.34)} weight={800} color={inside ? c.ink : c.meta}>
            {p == null ? '–' : `${pct}%`}
          </Txt>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ pct: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' } });
