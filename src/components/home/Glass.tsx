// HOME's cards: a plain surface (white by day, a solid lifted charcoal at night), raised by a layered neutral shadow. No blur, no outline.
//   gradient  the surface runs from a lit top to a slightly deeper bottom: a little dimension. On by default, in both modes, on every
//             card of every page (gradient={false} for a flat one).
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useSkin } from '@/theme/homeSkin';

type Props = { radius?: number; gradient?: boolean; style?: StyleProp<ViewStyle>; children?: React.ReactNode };

export function Glass({ radius = 28, gradient, style, children }: Props) {
  const k = useSkin();
  return (
    <View style={[{ borderRadius: radius, borderCurve: 'continuous', backgroundColor: k.glass, boxShadow: k.cardShadow }, style]}>
      {(gradient ?? true) && <LinearGradient pointerEvents="none" colors={[k.glassTop, k.glassBottom]} style={[StyleSheet.absoluteFill, { borderRadius: radius, borderCurve: 'continuous' }]} />}
      {children}
    </View>
  );
}

// The same surface drawn behind the children of a box that lays itself out (a row, a result, a card with its own padding): put it first
// inside the box, give the box its `borderRadius`, and take the box's own background and border off.
//   topOnly  only the top corners are round (a side panel or a sheet that runs to the screen's edge)
export function GlassBack({ radius = 20, topOnly }: { radius?: number; topOnly?: boolean }) {
  const k = useSkin();
  const corners = topOnly ? { borderTopLeftRadius: radius, borderTopRightRadius: radius } : { borderRadius: radius };
  return (
    <>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, corners, { backgroundColor: k.glass }]} />
      <LinearGradient pointerEvents="none" colors={[k.glassTop, k.glassBottom]} style={[StyleSheet.absoluteFill, corners]} />
    </>
  );
}

// Only the gradient, for a sheet or a box that keeps its own solid colour: put it first inside the box.
export function Sheen({ radius = 24, topOnly }: { radius?: number; topOnly?: boolean }) {
  const k = useSkin();
  const corners = topOnly ? { borderTopLeftRadius: radius, borderTopRightRadius: radius } : { borderRadius: radius };
  return <LinearGradient pointerEvents="none" colors={[k.glassTop, k.glassBottom]} style={[StyleSheet.absoluteFill, corners]} />;
}
