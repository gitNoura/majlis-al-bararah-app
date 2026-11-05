// The pieces the daily cards share: a card with a title, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

// The page's few accent colours: muted, one per kind of card (forest green for memorizing, slate blue for revising,
// clay for the rest). They colour only small things (an icon chip, a faint wash, a ring), never whole cards or titles.
export type Accent = 'green' | 'blue' | 'clay';
const ACCENTS = {
  light: { green: '#2f6650', blue: '#3b6f8c', clay: '#a0654c' },
  dark: { green: '#7cc3a3', blue: '#8fbfdc', clay: '#dba68e' },
};
export function useAccent(accent: Accent = 'green') {
  const { isDark } = useTheme();
  return ACCENTS[isDark ? 'dark' : 'light'][accent];
}
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// A card, as on the settings page (white, a hairline border, 20 px corners) with the home page's serif title; an
// optional round-square icon chip in the card's accent (`icon` is given the colour to draw with). `tone="done"` is
// a finished card: a soft green wash, its icon a white check on solid green.
export function Section({ title, subtitle, icon, accent = 'green', tone, children, style }: { title: string; subtitle?: string; icon?: (color: string) => ReactNode; accent?: Accent; tone?: Tone; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  const a = useAccent(accent);
  const done = tone === 'done';
  const wash = alpha(a, done ? (isDark ? 0.14 : 0.09) : isDark ? 0.06 : 0.04);
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: done ? alpha(a, 0.45) : c.line }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: wash }]} />
      <View style={styles.head}>
        {icon ? <View style={[styles.chip, { backgroundColor: done ? a : alpha(a, isDark ? 0.22 : 0.13) }]}>{icon(done ? '#ffffff' : a)}</View> : null}
        <View style={{ flex: 1 }}>
          <Txt serif size={18} weight={700} color={c.ink} lineHeight={30}>
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
      <Txt serif size={22} weight={700} color={c.ink} lineHeight={36} style={{ flexShrink: 1 }}>
        {title}
      </Txt>
      {link ? (
        <Pressable onPress={onLink} hitSlop={10} accessibilityRole="button">
          <Txt size={14} color={c.meta}>
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
