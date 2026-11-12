// HOME's progress ring: a thin track, the progress arc drawing itself in once, a soft glow under the arc (two wider, fainter strokes
// of the same colour: the same on every platform) and the percentage in the middle.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { useSkin } from '@/theme/homeSkin';

const R = 38;
const CIRC = 2 * Math.PI * R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function HomeRing({ percent, size = 88 }: { percent: number; size?: number }) {
  const k = useSkin();
  const pct = Math.round(percent);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withDelay(300, withTiming(Math.max(pct, 2) / 100, { duration: 900, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System })));
  }, [pct, progress]);
  const arc = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - progress.get()) }));

  const layer = (width: number, opacity: number, key: string) => (
    <AnimatedCircle key={key} cx={48} cy={48} r={R} stroke={k.vivid} strokeOpacity={opacity} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={CIRC} animatedProps={arc} transform="rotate(-90 48 48)" />
  );

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={`${pct}%`}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx={48} cy={48} r={R} stroke={k.glassTrack} strokeWidth={7} fill="none" />
        {pct > 0 && [layer(17, 0.07, 'g2'), layer(12, 0.13, 'g1'), layer(7, 1, 'arc')]}
      </Svg>
      <View style={styles.inside} pointerEvents="none">
        <Txt size={size * 0.2} weight={800} color={k.pageInk}>
          {`${pct}%`}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ inside: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' } });
