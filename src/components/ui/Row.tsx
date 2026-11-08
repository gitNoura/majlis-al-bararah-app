// A row: an optional icon, a title with an optional line under it, and at its end whatever the row needs (a
// switch, a mark, a value, the chevron). With `onPress` the whole row is a button. Rows mirror with the
// layout's direction (the icon and title at the start of the line, the end content at its end).
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { lineStart } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

// The «opens something» arrow: drawn (not a text character), pointing to the end of the line - left in
// Arabic, right in English and French.
export function Chevron({ color, size = 18 }: { color?: string; size?: number }) {
  const { c } = useTheme();
  const d = LANG === 'ar' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? c.meta} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

type Props = {
  title: string;
  sub?: string;
  icon?: ReactNode; // drawn on a round-cornered chip
  end?: ReactNode;
  chevron?: boolean; // the arrow at the end (a row that opens something)
  onPress?: () => void;
  last?: boolean; // no hairline under it
  quiet?: boolean; // a title in the second-line colour
};

// the words line up at the start of the layout's line, in whatever script («English» in the Arabic layout too)
const start = lineStart;

export function Row({ title, sub, icon, end, chevron, onPress, last, quiet }: Props) {
  const { c } = useTheme();
  const line = !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider };
  const inside = (
    <>
      {!!icon && <View style={[styles.icon, { backgroundColor: c.accentSoft }]}>{icon}</View>}
      <View style={styles.text}>
        <Txt size={16} weight={600} color={quiet ? c.meta : c.ink} style={start()}>
          {title}
        </Txt>
        {!!sub && (
          <Txt size={13} color={c.meta} style={start()}>
            {sub}
          </Txt>
        )}
      </View>
      {end}
      {chevron && <Chevron />}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => [styles.row, line, pressed && { opacity: 0.6 }]}>
      {inside}
    </Pressable>
  ) : (
    <View style={[styles.row, line]}>{inside}</View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: space.sm + 4 },
  icon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
