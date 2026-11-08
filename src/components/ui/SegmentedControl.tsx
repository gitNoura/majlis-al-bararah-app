// A segmented control: two to four choices side by side on a track, the chosen one raised. It is not a filled
// accent (a screen has one filled button; see Home). The options keep the layout's order, so in Arabic the first
// is at the right.
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Option<T> = { value: T; label: string };
type Props<T> = { value: T; options: Option<T>[]; onChange: (value: T) => void; compact?: boolean; pill?: boolean }; // pill: Home's look (a rounded track, the chosen one forest green)

export function SegmentedControl<T extends string | number>({ value, options, onChange, compact, pill }: Props<T>) {
  const { c } = useTheme();
  const h = useHome();
  return (
    <View style={[styles.track, { backgroundColor: pill ? h.mint : c.surface2 }, pill && { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: h.mintLine }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segment, compact && styles.compact, pill && { borderRadius: 20, minHeight: 42 }, on && (pill ? { backgroundColor: h.forest } : { backgroundColor: c.card, borderColor: c.line, borderWidth: StyleSheet.hairlineWidth })]}
          >
            <Txt size={compact ? 13.5 : 14.5} weight={on ? 700 : 500} center color={on ? (pill ? h.forestInk : c.ink) : c.meta} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: space.xs, borderRadius: 14, gap: space.xs },
  segment: { flex: 1, minHeight: 40, justifyContent: 'center', borderRadius: 11, paddingHorizontal: space.sm, borderWidth: 0 },
  compact: { minHeight: 34 },
});
