// A section title of Home's (Reading, the two plans, Activity): the prayer card's cream-yellow words. That yellow cannot be read on
// the light page by itself, so in light mode each letter gets a thin forest outline (the same word drawn eight times a hair away
// in forest, the yellow one on top; React Native has no text stroke). In dark mode the yellow reads as it is, so there is no outline.
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

const W = 0.8; // the outline's thickness
const AROUND = [
  [-W, 0], [W, 0], [0, -W], [0, W],
  [-W, -W], [W, -W], [-W, W], [W, W],
] as const;

export function Title({ children, size = 13 }: { children: string; size?: number }) {
  const k = useSkin();
  const { isDark } = useTheme();
  const text = { size, weight: 800 as const, numberOfLines: 1 };
  return (
    <View>
      {!isDark &&
        AROUND.map(([dx, dy]) => (
          <View key={`${dx},${dy}`} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { left: dx, right: -dx, top: dy, bottom: -dy }]}>
            <Txt {...text} color="#173f32">
              {children}
            </Txt>
          </View>
        ))}
      <Txt {...text} color={k.gold}>
        {children}
      </Txt>
    </View>
  );
}
