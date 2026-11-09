// A date picked by steps (no date-picker package): the date in words between two rows of «−» and «+»
// buttons (1 day, 1 week, 1 month, 1 year). Dates are «YYYY-MM-DD» strings; `min` is the earliest allowed.
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import * as core from '@/lib/hifdh/core';
import { fmtDate, num } from '@/lib/hifdh/labels';
import { useTheme } from '@/theme/theme';

const STEPS = [1, 7, 30, 365];

export function DateStepper({ value, min, onChange, label }: { value: string; min: string; onChange: (day: string) => void; label: string }) {
  const { c } = useTheme();
  const move = (n: number) => {
    const next: string = core.addDays(value, n);
    onChange(next < min ? min : next);
  };
  const btn = (n: number) => (
    <Pressable
      key={n}
      onPress={() => move(n)}
      accessibilityRole="button"
      accessibilityLabel={`${n > 0 ? '+' : '−'}${Math.abs(n)}`}
      style={[styles.btn, { borderColor: c.chosenLine, backgroundColor: c.soft }]}
    >
      <Txt size={13} weight={700} color={c.ink}>
        {n > 0 ? '+' : '−'}
        {num(Math.abs(n))}
      </Txt>
    </Pressable>
  );
  return (
    <View style={styles.wrap} accessible accessibilityRole="adjustable" accessibilityLabel={`${label}: ${fmtDate(value)}`}>
      <Txt size={22} weight={800} center color={c.ink}>
        {fmtDate(value)}
      </Txt>
      <View style={styles.row}>{STEPS.map((n) => btn(-n)).reverse()}</View>
      <View style={styles.row}>{STEPS.map((n) => btn(n))}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  btn: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
