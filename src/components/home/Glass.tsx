// HOME's glass: a frosted, see-through panel. A real blur behind it (iOS and the web; on Android, until a blur target is set up, the
// same translucent fill without the blur), a pale tinted fill, a thin bright edge and a soft shadow. Used by the cards, the
// round profile button and the small pills on Home, so they all read as one material over the page's mint wash.
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

type Props = { radius?: number; intensity?: number; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function Glass({ radius = 28, intensity = 40, style, children }: Props) {
  const k = useSkin();
  const { isDark } = useTheme();
  return (
    <View style={[{ borderRadius: radius, borderCurve: 'continuous', borderWidth: 1, borderColor: k.glassEdge, boxShadow: `0px 8px 24px ${k.glassShadow}` }, style]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius - 1, borderCurve: 'continuous', overflow: 'hidden' }]} pointerEvents="none">
        <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: k.glass }]} />
      </View>
      {children}
    </View>
  );
}
