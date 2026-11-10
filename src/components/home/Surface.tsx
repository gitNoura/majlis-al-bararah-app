// The surface of every Home card under the prayer card: clean, neutral and modern, a near-white (a deep charcoal in dark mode)
// with a hairline rim and a soft shadow, and the green kept for the marks that matter (a ring, a bar, a button).
// The twist is colour, not shape: the top corner of each card takes a faint wash of the sky of the moment, the same sky the
// prayer card above wears (night's teal, dawn's rose, midday's blue, the afternoon's amber, sunset's mauve), so the cards
// belong to the prayer card and change with it through the day without carrying any pattern. The corners are the prayer card's own.
'use no memo'; // reads saved state (the place, for the sky) when it draws, which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { READING_SKIES, skyPhase } from '@/lib/dashboard';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';

export const RADIUS = 22; // the prayer card's own

// '#rrggbb' at some opacity
const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function Surface({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const h = useHome();
  const sky = READING_SKIES[skyPhase()].grad[0];
  return (
    // the rounded clip is on the OUTER view too, as on the prayer card, so the corners stay round on every phone
    <View style={[styles.card, { borderColor: h.surfaceRim, boxShadow: `0px 10px 28px ${h.surfaceShadow}` }, style]}>
      <LinearGradient colors={[h.surfaceTop, h.surfaceBottom]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      {/* the sky's wash, strongest in the top corner and gone by the middle of the card, so the lower half stays clean */}
      <LinearGradient colors={[alpha(sky, h.skyWash), alpha(sky, 0)]} start={{ x: 0, y: 0 }} end={{ x: 0.65, y: 0.5 }} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderCurve: 'continuous', borderWidth: 1, padding: space.md, gap: space.cozy, overflow: 'hidden' },
});
