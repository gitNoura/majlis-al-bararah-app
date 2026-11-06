// Progress, drawn two ways with the same look:
//   - a continuous bar:  <ProgressStrip value={0.4} />            (value 0 to 1; a thin bar, 6 px by default)
//   - a strip of cells:  <ProgressStrip cells={juzRead} />        (one number 0 to 1 per cell: 30 for the juz;
//                                                                  a cell is filled that far, so a juz half
//                                                                  read is half filled)
// The fill starts at the start of the line, so in Arabic it grows from the right (the first juz is at the
// right). `label` is what a screen reader says.
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type Props = { value?: number; cells?: number[]; height?: number; label?: string };

const clamp = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export function ProgressStrip({ value = 0, cells, height = 6, label }: Props) {
  const { c } = useTheme();
  const total = cells?.length ? cells.reduce((s, n) => s + clamp(n), 0) / cells.length : clamp(value);
  const radius = height / 2;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(total * 100) }}
      style={[styles.row, { height, gap: cells?.length ? 2 : 0 }]}
    >
      {cells?.length ? (
        cells.map((n, i) => (
          <View key={i} style={[styles.cell, { backgroundColor: c.surface3, borderRadius: radius }]}>
            <View style={{ width: `${clamp(n) * 100}%`, height, backgroundColor: c.accent }} />
          </View>
        ))
      ) : (
        <View style={[styles.cell, { backgroundColor: c.surface3, borderRadius: radius }]}>
          <View style={{ width: `${clamp(value) * 100}%`, height, backgroundColor: c.accent }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'stretch' },
  cell: { flex: 1, overflow: 'hidden' },
});
