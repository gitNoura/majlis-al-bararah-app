// The pieces the daily cards share: a card with a title, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

// The page's colours: four muted hues of one softness, one per kind of card (green = memorizing, blue = revising,
// violet = the week, rose = progress). A card uses only its own hue (wash, border, icon chip, title, and whatever it
// draws: the ring, the kept days) on the neutral page, so the colour reads as a system and not as decoration.
// `base` is the hue for washes and fills, `ink` its deep version for titles and icons.
export type Accent = 'green' | 'blue' | 'violet' | 'rose';
const ACCENTS = {
  light: {
    green: { base: '#3f8a6c', ink: '#1f5a45' },
    blue: { base: '#4a86a8', ink: '#2a5d7a' },
    violet: { base: '#7864b0', ink: '#55448c' },
    rose: { base: '#b5607a', ink: '#8f3f58' },
  },
  dark: {
    green: { base: '#5fb592', ink: '#8fd9bb' },
    blue: { base: '#6aa6c8', ink: '#92cdee' },
    violet: { base: '#9a88d4', ink: '#bdb0ee' },
    rose: { base: '#d4809a', ink: '#eba5bb' },
  },
};
export function useAccent(accent: Accent = 'green') {
  const { isDark } = useTheme();
  return ACCENTS[isDark ? 'dark' : 'light'][accent];
}
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
// the three tints every card is built from, so they all look alike
export function useTints(accent: Accent = 'green') {
  const { isDark } = useTheme();
  const a = useAccent(accent);
  return {
    ...a,
    wash: alpha(a.base, isDark ? 0.14 : 0.1),
    line: alpha(a.base, isDark ? 0.4 : 0.3),
    chip: alpha(a.base, isDark ? 0.26 : 0.18),
  };
}

// A card, as on the settings page (a hairline border, 20 px corners) with the home page's serif title, washed in its
// own hue; an optional round-square icon chip (`icon` is given the colour to draw with). `tone="done"` is a finished
// card: a stronger wash, its icon a white check on the solid hue.
export function Section({ title, subtitle, icon, accent = 'green', tone, children, style }: { title: string; subtitle?: string; icon?: (color: string) => ReactNode; accent?: Accent; tone?: Tone; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  const t = useTints(accent);
  const done = tone === 'done';
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: done ? alpha(t.base, 0.55) : t.line }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: done ? alpha(t.base, isDark ? 0.2 : 0.16) : t.wash }]} />
      <View style={styles.head}>
        {icon ? <View style={[styles.chip, { backgroundColor: done ? t.base : t.chip }]}>{icon(done ? '#ffffff' : t.ink)}</View> : null}
        <View style={{ flex: 1 }}>
          <Txt serif size={18} weight={700} color={t.ink} lineHeight={30}>
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

// A heading between the cards («Today's plan», «Progress»), with an optional quiet link at its end
export function Heading({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.heading}>
      <Txt size={17} weight={700} color={c.meta} style={{ flexShrink: 1 }}>
        {title}
      </Txt>
      {link ? (
        <Pressable onPress={onLink} hitSlop={10} accessibilityRole="button">
          <Txt size={17} weight={700} color={c.meta}>
            {link} ›
          </Txt>
        </Pressable>
      ) : null}
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
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  btn: { minHeight: 48, borderRadius: radius.button, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
