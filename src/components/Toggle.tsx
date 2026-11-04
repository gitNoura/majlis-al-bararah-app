// An on / off switch, as the website's (forest green when on, the knob sliding across): the same on
// every phone, in either language (the phone's own switch changes look from one phone to another).
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

const W = 50;
const H = 30;
const KNOB = 24;

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (on: boolean) => void; label?: string }) {
  const { c } = useTheme();
  const at = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    at.set(withTiming(value ? 1 : 0, { duration: 180 }));
  }, [value, at]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: at.get() * (W - KNOB - 6) }] }));
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      style={[styles.track, { backgroundColor: value ? c.on : c.switchOff }]}
    >
      <Animated.View style={[styles.knob, knob]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, justifyContent: 'center' },
  knob: {
    position: 'absolute',
    left: 3,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#ffffff',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.25)',
  },
});
