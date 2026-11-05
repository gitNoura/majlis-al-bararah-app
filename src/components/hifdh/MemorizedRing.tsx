// The memorized ring: the share of the Quran the reader knows, as a small ring with its percentage,
// beside «Memorized / Edit what I’ve memorized». Pressing it opens the memorized picker (3c) when
// `onPress` is given.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish } from '@/i18n/i18n';
import * as plan from '@/lib/hifdh/plan';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const SIZE = 64;
const R = 40;
const CIRC = 2 * Math.PI * R;

export function MemorizedRing({ onPress }: { onPress?: () => void }) {
  const { c } = useTheme();
  const count = plan.memorizedCount();
  const pct = plan.ringPercent();
  const label = HIF.memorizedRing();
  const hint = HIF.editMemorized();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${hint}`}
      style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}
    >
      <View style={styles.ring} accessible accessibilityRole="image" accessibilityLabel={`${pct}%`}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 96 96">
          <Circle cx={48} cy={48} r={R} stroke={c.soft} strokeWidth={9} fill="none" />
          <Circle
            cx={48}
            cy={48}
            r={R}
            stroke={c.on}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            transform="rotate(-90 48 48)"
          />
        </Svg>
        <View style={styles.pct} pointerEvents="none">
          <Txt size={count && pct === 0 ? 13 : 15} weight={800} color={c.ink}>
            {count && pct === 0 ? '<1%' : `${pct}%`}
          </Txt>
        </View>
      </View>
      <View style={styles.text}>
        <Txt size={17} weight={700} color={c.ink}>
          {label}
        </Txt>
        <Txt size={13} color={c.meta}>
          {hint}
        </Txt>
      </View>
      {onPress && (
        <Txt size={22} color={c.meta} style={isEnglish ? undefined : styles.flip}>
          ›
        </Txt>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  pct: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  flip: { transform: [{ scaleX: -1 }] },
});
