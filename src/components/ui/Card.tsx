// A card: the surface everything on a navigation screen sits on. A raised surface, a hairline, 20 px corners,
// 16 px of padding and 12 px between its children. `quiet` is the lowest visual weight (a flat, tinted
// surface with no border), for secondary entries. With `onPress` the whole card is one button.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  quiet?: boolean;
  elevated?: boolean; // lifted off the screen: a soft shadow under it
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, quiet, elevated, style, accessibilityLabel }: Props) {
  const { c } = useTheme();
  const surface: ViewStyle = quiet
    ? { backgroundColor: c.surface2 }
    : { backgroundColor: c.card, borderColor: c.line, borderWidth: StyleSheet.hairlineWidth, ...(elevated ? { boxShadow: `0px 10px 28px ${c.shadow}, 0px 2px 4px ${c.shadow}` } : null) };
  if (!onPress) return <View style={[styles.card, surface, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, surface, style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space.md, gap: 12, overflow: 'hidden' },
  pressed: { opacity: 0.85 },
});
