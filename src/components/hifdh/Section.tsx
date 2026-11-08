// The pieces the daily cards share: a card with a title, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

// The page is neutral with one accent, forest green: the icon chips, the ring, the kept days, the buttons. One font
// (the app's UI font) for every title. `green` is the fill, its tints are for washes, borders and chips.
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
// (the greens are Home's: src/theme/home.ts)
export function useGreen() {
  const { isDark } = useTheme();
  const h = useHome();
  return { base: h.leaf, chip: h.tile, ink: h.tileInk, line: alpha(h.leaf, isDark ? 0.4 : 0.22), wash: alpha(h.leaf, isDark ? 0.14 : 0.07) };
}

// A card: paper on Home's page, a hairline border and a soft shadow, 24 px corners, the title in the UI font. The icon chip is the
// card's only colour. `tone="done"` is a finished card: a soft green wash and border (the icon stays as it was).
// Nothing is ever written under the title: the card's content goes below the head. Hifdh and Murajaa are identical.
export function Section({ title, icon, tone, children, style }: { title: string; icon?: (color: string) => ReactNode; tone?: Tone; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const h = useHome();
  const g = useGreen();
  const done = tone === 'done';
  return (
    <View style={[styles.card, { backgroundColor: h.card, borderColor: done ? g.line : h.cardLine, boxShadow: `0px 8px 20px ${h.shadow}` }, style]}>
      {done && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: g.wash }]} />}
      <View style={styles.head}>
        {icon ? <View style={[styles.chip, { backgroundColor: g.chip }]}>{icon(g.ink)}</View> : null}
        <Txt size={18} weight={700} color={h.ink} style={{ flex: 1 }}>
          {title}
        </Txt>
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
  const h = useHome();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, { backgroundColor: h.forest, opacity: disabled ? 0.45 : 1 }]}
    >
      <Txt size={16} weight={700} color={h.forestInk}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const h = useHome();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, { borderWidth: 1.5, borderColor: h.forest, backgroundColor: 'transparent', opacity: disabled ? 0.4 : 1 }]}
    >
      <Txt size={16} weight={700} color={h.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  btn: { minHeight: 50, borderRadius: 25, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
