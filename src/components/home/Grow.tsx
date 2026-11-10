// The one moment of motion on Home: the progress marks draw themselves in, once, when the screen opens (the juz beads, the
// plan bars, the week's capsules). Nothing else moves on its own. A phone set to reduce motion gets them already drawn.
//   axis "x": the width grows from the start of the line to `to` (0 to 1) of its parent (so from the right in Arabic)
//   axis "y": the height grows from the bottom to `to` pixels
import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type Props = { axis: 'x' | 'y'; to: number; delay?: number; duration?: number; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function Grow({ axis, to, delay = 0, duration = 650, style, children }: Props) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System })));
  }, [delay, duration, progress]);
  const grow = useAnimatedStyle(() => (axis === 'x' ? { width: `${to * progress.get() * 100}%` as `${number}%` } : { height: to * progress.get() }));
  return <Animated.View style={[style, grow]}>{children}</Animated.View>;
}
