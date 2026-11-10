// Motion for the Home cards. One curve for everything, the one that lands softly: cubic-bezier(0.22, 1, 0.36, 1). Only
// transform and opacity move (never a width or a height). With the phone set to reduce motion, nothing travels: the cards
// and the bars only fade in.
'use no memo'; // drives shared values in effects, which the React Compiler cannot see
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { LANG } from '@/i18n/i18n';

const CURVE = Easing.bezier(0.22, 1, 0.36, 1);

// A card rises 24 and fades in, once, each one 60ms after the one before it (the whole run no longer than 240ms of delay).
export function Reveal({ index = 0, children, style }: { index?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(Math.min(index * 60, 240), withTiming(1, { duration: 600, easing: CURVE }));
  }, [index, p]);
  const anim = useAnimatedStyle(() => ({ opacity: p.value, transform: reduce ? [] : [{ translateY: (1 - p.value) * 24 }] }));
  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}

// A bar that grows from its start (the right in Arabic) or from its bottom, by scaling, not by changing its width or height.
export function Grow({ axis = 'x', delay = 0, style, children }: { axis?: 'x' | 'y'; delay?: number; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 600, easing: CURVE }));
  }, [delay, p]);
  const anim = useAnimatedStyle(() => ({ opacity: reduce ? p.value : 1, transform: reduce ? [] : [axis === 'x' ? { scaleX: p.value } : { scaleY: p.value }] }));
  const origin = (axis === 'y' ? 'bottom' : LANG === 'ar' ? 'right' : 'left') as ViewStyle['transformOrigin'];
  return <Animated.View style={[style, { transformOrigin: origin }, anim]}>{children}</Animated.View>;
}
