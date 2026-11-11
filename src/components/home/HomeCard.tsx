// One card of Home's family: the prayer card's shape without its sky - the same radius, padding and soft shadow, a calm green
// gradient (pale at the top, a touch deeper below) and, inside, the same small tinted pills with one dark pill for what is
// current. Reading, Memorization and Activity are all drawn on it, so the page reads as one set.
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

export const CARD_RADIUS = 22; // the prayer card's

export function HomeCard({ onPress, label, style, children }: { onPress?: () => void; label?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const k = useSkin();
  const inner = (
    <>
      <LinearGradient colors={[k.cardTop, k.cardBottom]} style={StyleSheet.absoluteFill} />
      {children}
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.92 }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: CARD_RADIUS, borderCurve: 'continuous', padding: space.cozy, gap: space.sm, overflow: 'hidden', boxShadow: '0px 8px 20px rgba(20, 50, 38, 0.16)' },
});
