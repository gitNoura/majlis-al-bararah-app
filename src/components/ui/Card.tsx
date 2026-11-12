// A card: the surface everything on a navigation screen sits on. Since the redesign it is Home's glass (a frosted,
// see-through panel: src/components/home/Glass.tsx), 20 px corners, 16 px of padding and 12 px between its children.
// `quiet` is the lowest visual weight (a flat, softly tinted surface with no glass), for secondary entries. With
// `onPress` the whole card is one button.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Glass } from '@/components/home/Glass';
import { useTheme } from '@/theme/theme';
import { radius, space } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  quiet?: boolean;
  elevated?: boolean; // kept for the screens that ask for it: the glass already carries its own soft shadow
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, quiet, style, accessibilityLabel }: Props) {
  const { c } = useTheme();
  const body = quiet ? (
    <View style={[styles.card, { backgroundColor: c.soft, overflow: 'hidden' }, style]}>{children}</View>
  ) : (
    <Glass radius={radius.card} style={[styles.card, style]}>
      {children}
    </Glass>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space.md, gap: 12 },
  pressed: { opacity: 0.85 },
});
