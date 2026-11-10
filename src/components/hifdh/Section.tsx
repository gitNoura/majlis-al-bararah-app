// The pieces the daily cards share: a section with a title, a hint line, and the two button looks
// («hz-primary» and «hz-secondary» of the website).
//
// Look of the page: Home's (src/theme/homeSkin.ts). A section is its title in ink on the neutral page, and under it its content
// in one white panel with a hairline and 20 px corners (no boxes inside boxes: rows inside a panel are separated by hairlines).
// A finished card turns the light green of Home's plans card. Forest is the colour of the filled buttons; the same light green
// is the accent of the small things (the tabs, the round buttons, the empty days, the quiet buttons), never of the words.
// The gold is gone.
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Txt } from '@/components/Txt';
import { Panel } from '@/components/home/Panel';
import { useHome } from '@/theme/home';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

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

// The colour of headings and dates: the page's ink
export function useHeading() {
  return useSkin().ink;
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

// A section: its title, then its content. The title sits outside, above the box; the box is the page's one kind of
// surface, outlined thinly in green (a finished card: the paler green wash). `plain` drops the box and separates sections
// with a hairline instead, the title staying on top of its content (the long history list). Nothing is ever written
// under the title. `compact` is the smaller size of the edit page; `action` is a small control at the end of the title row.
export function Section({ title, titleColor, tone, children, style, first, plain, compact, action }: { title: string; titleColor?: string; tone?: Tone; first?: boolean; plain?: boolean; compact?: boolean; action?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const heading = useHeading();
  const head = (
    <View style={styles.head}>
      <Txt size={compact ? 15 : 17} weight={700} color={titleColor ?? heading} style={{ flex: 1 }}>
        {title}
      </Txt>
      {action}
    </View>
  );
  if (plain) {
    return (
      <View style={[styles.section, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider, paddingTop: 20 }, style]}>
        {head}
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.outer, compact && styles.outerCompact, style]}>
      {head}
      <Panel tone={tone === 'done' ? 'soft' : 'surface'} style={[styles.box, compact && styles.boxCompact]}>
        {children}
      </Panel>
    </View>
  );
}

// A heading between the sections («Today's plan», «Progress»), with an optional quiet link at its end
export function Heading({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  const k = useSkin();
  return (
    <View style={styles.heading}>
      <Txt size={17} weight={700} color={k.ink} style={{ flexShrink: 1 }}>
        {title}
      </Txt>
      {link ? (
        <Pressable onPress={onLink} hitSlop={10} accessibilityRole="button">
          <Txt size={14} weight={700} color={k.meta}>
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
      <Txt size={15} weight={700} color={h.forestInk}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, square }: { label: string; onPress: () => void; disabled?: boolean; square?: boolean }) {
  const k = useSkin();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, square && styles.square, { backgroundColor: k.soft, opacity: disabled ? 0.4 : 1 }]}
    >
      <Txt size={15} weight={700} color={k.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.cozy },
  outer: { gap: space.sm },
  outerCompact: { gap: 6 },
  box: { gap: space.cozy, padding: space.md, borderRadius: 20, borderCurve: 'continuous', overflow: 'hidden' },
  boxCompact: { gap: 10, padding: space.cozy, borderRadius: 16 },
  head:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  square: { minHeight: 44, borderRadius: 22 },
  btn: { minHeight: 46, borderRadius: 23, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
