// The pieces the daily cards share: a card with a small heading, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

// Each card has a hue of its own, so the page reads as colourful while the ivory, forest green and gold stay the app's.
// `ink` colours the title and the icon, `tint` washes the card, `chip` is the round icon background.
export type Hue = 'green' | 'blue' | 'rose' | 'violet';
const HUES = {
  light: {
    green: { ink: '#14573f', tint: 'rgba(46, 140, 104, 0.12)', line: 'rgba(46, 140, 104, 0.34)', chip: 'rgba(46, 140, 104, 0.22)' },
    blue: { ink: '#1d5f82', tint: 'rgba(52, 133, 178, 0.12)', line: 'rgba(52, 133, 178, 0.34)', chip: 'rgba(52, 133, 178, 0.22)' },
    rose: { ink: '#9a3f5c', tint: 'rgba(196, 92, 126, 0.11)', line: 'rgba(196, 92, 126, 0.32)', chip: 'rgba(196, 92, 126, 0.2)' },
    violet: { ink: '#5a4698', tint: 'rgba(118, 96, 188, 0.11)', line: 'rgba(118, 96, 188, 0.32)', chip: 'rgba(118, 96, 188, 0.2)' },
  },
  dark: {
    green: { ink: '#8fd9bb', tint: 'rgba(70, 180, 140, 0.16)', line: 'rgba(110, 200, 165, 0.38)', chip: 'rgba(70, 180, 140, 0.28)' },
    blue: { ink: '#92cdee', tint: 'rgba(80, 160, 210, 0.16)', line: 'rgba(120, 180, 225, 0.38)', chip: 'rgba(80, 160, 210, 0.28)' },
    rose: { ink: '#eba5bb', tint: 'rgba(216, 120, 150, 0.16)', line: 'rgba(225, 150, 175, 0.38)', chip: 'rgba(216, 120, 150, 0.28)' },
    violet: { ink: '#bdb0ee', tint: 'rgba(150, 130, 220, 0.16)', line: 'rgba(175, 160, 235, 0.38)', chip: 'rgba(150, 130, 220, 0.28)' },
  },
};
export function useHue(hue?: Hue) {
  const { isDark } = useTheme();
  return hue ? HUES[isDark ? 'dark' : 'light'][hue] : null;
}

// A card: an optional round icon, the title with its one-line subtitle, then the content. It is the home page's tile;
// `tone="done"` is what a finished card looks like: tinted gold, its icon a gold check.
export function Section({ title, subtitle, icon, tone, hue, children, style }: { title: string; subtitle?: string; icon?: ReactNode; tone?: Tone; hue?: Hue; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  const done = tone === 'done';
  const h = useHue(hue);
  const tint = done ? (isDark ? 'rgba(197, 161, 90, 0.16)' : 'rgba(197, 161, 90, 0.22)') : (h?.tint ?? null);
  const chip = done ? c.gold : (h?.chip ?? 'rgba(197, 161, 90, 0.2)');
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: done ? 'rgba(184, 145, 58, 0.5)' : (h?.line ?? c.line) }, style]}>
      {tint && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint, borderRadius: 24 }]} />}
      <View style={styles.head}>
        {icon ? <View style={[styles.chip, { backgroundColor: chip }]}>{icon}</View> : null}
        <View style={{ flex: 1 }}>
          <Txt size={18} weight={700} color={done ? c.ink : (h?.ink ?? c.ink)}>
            {title}
          </Txt>
          {subtitle ? (
            <Txt size={13} color={c.text} style={{ opacity: 0.72 }}>
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
    <Txt size={13.5} color={c.text} style={{ opacity: 0.72 }}>
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
