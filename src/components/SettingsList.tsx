// The parts of a settings page, as in the phone's own apps (the app's settings, the Quran's): groups of
// rows on white cards under their names, a row with an icon, its name and a line under it, and at its
// end a switch, a mark, a tag or an arrow; a row of choices side by side (day / night / device...).
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { lineStart } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

// a row's words line up at the start of the layout's line, in whatever script («English» in the Arabic
// layout too)
const start = lineStart;

// a group of rows under its name (and a short note under the group)
export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.section}>
      <Txt size={13.5} weight={700} color={c.meta} style={styles.sectionTitle}>
        {title}
      </Txt>
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>{children}</View>
      {!!note && (
        <Txt size={12.5} color={c.meta} style={styles.note}>
          {note}
        </Txt>
      )}
    </View>
  );
}

// one row: an icon, its name (and a line under it), and at its end a switch, a mark or a tag
export function Row({
  icon,
  title,
  sub,
  end,
  onPress,
  quiet,
  last,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  end?: ReactNode;
  onPress?: () => void;
  quiet?: boolean;
  last?: boolean;
}) {
  const { c } = useTheme();
  const line = !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider };
  const inside = (
    <>
      {!!icon && <View style={[styles.icon, { backgroundColor: c.soft }]}>{icon}</View>}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={16} weight={600} color={quiet ? c.meta : c.ink} style={start()}>
          {title}
        </Txt>
        {!!sub && (
          <Txt size={12.5} color={c.meta} style={start()}>
            {sub}
          </Txt>
        )}
      </View>
      {end}
    </>
  );
  // a row that does something on a tap (a choice), or one whose switch does
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, line, pressed && { opacity: 0.6 }]}>
      {inside}
    </Pressable>
  ) : (
    <View style={[styles.row, line]}>{inside}</View>
  );
}

// choices side by side in a soft track, the chosen one forest green (the website's .st-segments)
export function Segments<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: c.soft }]}>
      {options.map(([v, label]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} style={[styles.segment, on && { backgroundColor: c.on }]} accessibilityState={{ selected: on }}>
            <Txt size={14} weight={on ? 700 : 500} center color={on ? c.onInk : c.tabInk} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// a small quiet tag at a row's end («soon»)
export function Tag({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: c.soft, borderColor: c.line }]}>
      <Txt size={12} weight={600} color={c.meta}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { marginBottom: 8, marginHorizontal: 6 },
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, overflow: 'hidden' },
  note: { marginTop: 8, marginHorizontal: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, minHeight: 58 },
  icon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  track: { flexDirection: 'row', padding: 4, borderRadius: 14, marginVertical: 12 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 11 },
});
