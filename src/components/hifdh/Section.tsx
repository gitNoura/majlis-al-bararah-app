// The pieces the daily cards share: a card with a small heading, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

// A card: an optional round icon, the title with its one-line subtitle, then the content. It is the home page's tile;
// `tone="done"` is what a finished card looks like: tinted gold, its icon a gold check.
export function Section({ title, subtitle, icon, tone, children, style }: { title: string; subtitle?: string; icon?: ReactNode; tone?: Tone; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  const done = tone === 'done';
  const tint = done ? (isDark ? 'rgba(197, 161, 90, 0.16)' : 'rgba(197, 161, 90, 0.22)') : null;
  const chip = done ? c.gold : 'rgba(197, 161, 90, 0.2)';
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: done ? 'rgba(184, 145, 58, 0.5)' : c.line }, style]}>
      {tint && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint, borderRadius: 24 }]} />}
      <View style={styles.head}>
        {icon ? <View style={[styles.chip, { backgroundColor: chip }]}>{icon}</View> : null}
        <View style={{ flex: 1 }}>
          <Txt size={18} weight={700} color={c.ink}>
            {title}
          </Txt>
          {subtitle ? (
            <Txt size={13} color={c.meta}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Txt size={13.5} color={c.meta}>
      {children}
    </Txt>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, { backgroundColor: c.on, opacity: disabled ? 0.45 : 1 }]}
    >
      <Txt size={16} weight={700} color={c.onInk}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.btn, { borderWidth: 1.5, borderColor: c.chosenLine, backgroundColor: 'transparent' }]}
    >
      <Txt size={16} weight={700} color={c.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, boxShadow: '0px 10px 26px rgba(68, 55, 43, 0.10)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btn: { minHeight: 48, borderRadius: radius.button, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
