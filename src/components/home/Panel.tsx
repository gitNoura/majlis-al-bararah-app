// A panel of Home's: a white one (`surface`) or the light-green one (`soft`). In light mode each is one flat colour; in dark mode
// each is a soft vertical gradient with a hairline, so the cards have a lit top and a deeper bottom instead of one flat grey.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useSkin } from '@/theme/homeSkin';

export function Panel({ tone = 'surface', style, children }: { tone?: 'surface' | 'soft'; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const k = useSkin();
  const soft = tone === 'soft';
  return (
    <LinearGradient
      colors={soft ? [k.softTop, k.softBottom] : [k.surfaceTop, k.surfaceBottom]}
      style={[style, { borderColor: soft ? k.softLine : k.hairline, borderWidth: StyleSheet.hairlineWidth }]}
    >
      {children}
    </LinearGradient>
  );
}
