// The pieces the daily cards share: a section with a title, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
//
// Look of the page (redesign v2): calm and flat. No boxes inside boxes: a section is a heading and its content on the
// page itself, separated from the next by a hairline; rows are separated by hairlines, not drawn as cards. One colour,
// forest green (no yellow anywhere): icons, the chosen state, the ring, the buttons.
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

export type Tone = 'done';

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

// The accent of what can be changed or picked. It used to be a light yellow; it is now the same green as everything
// else, so the page has one colour. `fill` is a quiet tint (a chosen row, a part-picked mark), `ink` the words on it,
// `mark` the solid colour of a mark or a bar.
export function useAccent() {
  const { isDark } = useTheme();
  const h = useHome();
  return { fill: alpha(h.leaf, isDark ? 0.18 : 0.1), ink: isDark ? h.tileInk : h.forest, line: alpha(h.leaf, isDark ? 0.4 : 0.3), mark: h.leaf };
}

// The colour of headings and dates: the deep forest green of the app, not a second colour
export function useHeading() {
  const { isDark } = useTheme();
  return isDark ? '#8fd0b2' : '#173f32';
}

// A value or a kind of plan (no pill, no box: the words in the accent colour)
export function AccentPill({ text, size = 13.5 }: { text: string; size?: number }) {
  const a = useAccent();
  return (
    <Txt size={size} weight={700} color={a.ink} numberOfLines={1}>
      {text}
    </Txt>
  );
}

// A section: its heading (an icon and a title) and its content. By default it is the page's one kind of box: a quiet
// white surface (no border, no shadow) so each part of the page reads as its own thing. `plain` drops the surface and
// separates sections with a hairline instead (the long history list). Nothing is ever written under the title.
export function Section({ title, titleColor, tone, children, style, first, plain }: { title: string; titleColor?: string; tone?: Tone; first?: boolean; plain?: boolean; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const h = useHome();
  const { c } = useTheme();
  const heading = useHeading();
  return (
    <View
      style={[
        styles.section,
        plain
          ? !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider, paddingTop: 20 }
          : tone === 'done'
            ? { backgroundColor: h.mint, borderRadius: 14, padding: 18, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: h.mintLine } // finished: the card turns green
            : { backgroundColor: h.card, borderRadius: 14, padding: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: h.cardLine },
        style,
      ]}
    >
      <View style={styles.head}>
        <Txt size={19} weight={700} color={titleColor ?? heading} style={{ flex: 1 }}>
          {title}
        </Txt>
      </View>
      {children}
    </View>
  );
}

// A heading between the sections («Today's plan», «Progress»), with an optional quiet link at its end
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

export function PrimaryButton({ label, onPress, disabled, square }: { label: string; onPress: () => void; disabled?: boolean; square?: boolean }) {
  const h = useHome();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, square && styles.square, { backgroundColor: h.forest, opacity: disabled ? 0.45 : 1 }]}
    >
      <Txt size={square ? 15.5 : 16} weight={700} color={h.forestInk}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, square }: { label: string; onPress: () => void; disabled?: boolean; square?: boolean }) {
  const h = useHome();
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, square && styles.square, { backgroundColor: 'transparent', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.chosenLine, opacity: disabled ? 0.4 : 1 }]}
    >
      <Txt size={square ? 15.5 : 16} weight={700} color={h.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  square: { minHeight: 48, borderRadius: 12 },
  btn: { minHeight: 50, borderRadius: 25, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
