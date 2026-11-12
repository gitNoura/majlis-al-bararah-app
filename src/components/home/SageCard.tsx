// The one card under the prayer card: built the way the prayer card is (the same radius, padding, soft shadow, a head row and small
// see-through pills inside it) but in a calm sage green, so the lower half of Home has colour and the two read as a pair. Reading
// and the two plans sit inside it. `useSage()` gives what goes inside: the pills' fill and an empty bar.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const CARD_RADIUS = 22; // the prayer card's

export function useSage() {
  const { isDark } = useTheme();
  return {
    grad: (isDark ? ['#2a4036', '#1c2c24'] : ['#cfe6d8', '#e6f1ea']) as [string, string],
    inset: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.62)', // a pill inside the card
    track: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(23, 63, 50, 0.13)', // an empty bar or ring
  };
}

export function SageCard({ children }: { children?: ReactNode }) {
  const s = useSage();
  return (
    <View style={styles.card}>
      <LinearGradient colors={s.grad} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: CARD_RADIUS, borderCurve: 'continuous', padding: space.cozy, gap: space.cozy, overflow: 'hidden', boxShadow: '0px 8px 20px rgba(20, 50, 38, 0.16)' },
});
