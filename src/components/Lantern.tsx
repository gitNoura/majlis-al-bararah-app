// A lantern (the website's, src/lib/lanterns.ts: the night one in the Quran page's corner, the two of
// the home screen), hanging from the top of the screen with the website's slow, uneven flicker: a warm,
// soft round glow around it, wider and brighter then dimmer, and its glass lit a little more and less.
// The flicker is a few slow waves added together over 7 s, so it never stops and starts; the lantern is
// drawn as lines, sharp at any size. The glow reaches past the lantern, so the lantern comes in a box
// big enough for its glow (lanternBox): nothing of the glow is cut square by the lantern's own edges.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop, SvgXml } from 'react-native-svg';

import { LANTERN_DAY, LANTERN_NIGHT } from '@/lib/lanterns';

export const LANTERN_W = 34;
const RATIO = 150 / 80;
export const LANTERN_H = LANTERN_W * RATIO;
const GLASS = 0.56; // the middle of its glass, down its height
const FLAME = 78 / 150;
const GLOW = 2.5; // the glow's width, in lantern widths

// The lantern's box: its size, and where the lantern is in it (x, y from the box's top-left). To hang
// the lantern at (left, top), put the box at (left - x, top - y).
export function lanternBox(width = LANTERN_W) {
  const height = width * RATIO;
  const glow = width * GLOW;
  const y = Math.max(0, glow / 2 - height * GLASS);
  return { width: glow, height: y + Math.max(height, height * GLASS + glow / 2), x: (glow - width) / 2, y };
}

// the flicker at a point of its 7 s (0 to 1 there): whole waves only, so the end joins the start
const flickerAt = (p: number) => {
  'worklet';
  const t = 2 * Math.PI * p;
  const f = 0.5 + 0.2 * Math.sin(2 * t) + 0.14 * Math.sin(3 * t + 1.1) + 0.1 * Math.sin(5 * t + 2.3) + 0.06 * Math.sin(7 * t + 0.4);
  return (f - 0.11) / 0.7;
};

// `day`: the day lantern (the home screen by day); `offset`: where in its flicker it starts (0 to 1),
// so two lanterns side by side do not flicker together
export function Lantern({ day, width = LANTERN_W, offset = 0 }: { day?: boolean; width?: number; offset?: number }) {
  const height = width * RATIO;
  const box = lanternBox(width);
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.set(withRepeat(withTiming(1, { duration: 7000, easing: Easing.linear }), -1));
  }, [phase]);

  const halo = useAnimatedStyle(() => {
    const f = flickerAt((phase.get() + offset) % 1);
    return { opacity: 0.62 + f * 0.38, transform: [{ scale: 0.92 + f * 0.12 }] };
  });
  const glass = useAnimatedStyle(() => ({ opacity: 0.12 + flickerAt((phase.get() + offset) % 1) * 0.5 }));

  const glow = width * GLOW;
  const light = width * 0.9;
  return (
    <View style={{ width: box.width, height: box.height }} pointerEvents="none">
      {/* the glow around it */}
      <Animated.View style={[{ position: 'absolute', left: 0, top: box.y + height * GLASS - glow / 2, width: glow, height: glow }, halo]}>
        <Svg width={glow} height={glow}>
          <Defs>
            <RadialGradient id="lantern-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#ffd978" stopOpacity={day ? 0.4 : 0.55} />
              <Stop offset="0.32" stopColor="#ffd978" stopOpacity={day ? 0.26 : 0.36} />
              <Stop offset="0.62" stopColor="#ffd978" stopOpacity={day ? 0.08 : 0.12} />
              <Stop offset="1" stopColor="#ffd978" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={glow / 2} cy={glow / 2} r={glow / 2} fill="url(#lantern-glow)" />
        </Svg>
      </Animated.View>

      <View style={{ position: 'absolute', left: box.x, top: box.y }}>
        <SvgXml xml={day ? LANTERN_DAY : LANTERN_NIGHT} width={width} height={height} />
      </View>

      {/* its glass, lit a little more and less */}
      <Animated.View
        style={[{ position: 'absolute', left: box.x + (width - light) / 2, top: box.y + height * FLAME - light / 2, width: light, height: light }, glass]}
      >
        <Svg width={light} height={light}>
          <Defs>
            <RadialGradient id="lantern-flame" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#fff4d6" stopOpacity={0.9} />
              <Stop offset="0.45" stopColor="#ffe4a0" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#ffe4a0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={light / 2} cy={light / 2} r={light / 2} fill="url(#lantern-flame)" />
        </Svg>
      </Animated.View>
    </View>
  );
}
