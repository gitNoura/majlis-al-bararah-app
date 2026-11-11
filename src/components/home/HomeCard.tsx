// One card of Home's family: the prayer card's shape and the prayer card's sky, quieter. The same radius, padding and soft shadow,
// the same sky of the moment (dawn, midday, afternoon, sunset, night - src/lib/dashboard.ts SKIES) as a gradient, and the same
// words and tinted pills inside, but without its sun, clouds and stars, so it reads as the prayer card's calmer companion at
// every hour. Reading, Memorization and Activity are all drawn on it. The sky is read when the card draws (Home redraws on focus).
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { READING_SKIES, skyPhase, SKIES } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const CARD_RADIUS = 22; // the prayer card's

// The colours of the card family for the sky of the moment: the lower two stops of the prayer card's sky (the calm part),
// its words, its tinted pill, an empty bar, and the one dark pill for what is current (as the next prayer is).
export function useCardSky() {
  const { isDark } = useTheme();
  const k = useSkin();
  const phase = skyPhase();
  const sky = SKIES[phase];
  return {
    // sunset's coral is too light under cream words: the cards take its deeper plum instead (the same hue as the prayer card's foot)
    grad: phase === 'sunset' ? READING_SKIES.sunset.grad : ([sky.sky[1], sky.sky[2]] as const),
    ink: sky.ink,
    soft: sky.soft,
    pill: sky.circle,
    track: `${sky.ink}26`, // the ink at 15%
    hi: isDark ? k.pageButton : sky.next,
    hiInk: isDark ? k.buttonInk : sky.nextIcon,
  };
}

export function HomeCard({ onPress, label, style, children }: { onPress?: () => void; label?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const c = useCardSky();
  const inner = (
    <>
      <LinearGradient colors={c.grad} style={StyleSheet.absoluteFill} />
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
