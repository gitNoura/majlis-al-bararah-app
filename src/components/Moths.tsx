// Moths around a lantern at night (the wird card's): a few small pale moths circling its light on
// uneven loops, their wings fluttering. Each moth's path is a few whole sine waves over one 12 s round
// (as the lantern's flicker), so the end joins the start and they never stop and start again.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

const ROUND_MS = 12000;
const SIZE = 11; // a moth, wings open

// each moth: its loop's sizes (px) and turns per round (whole numbers), where it starts, its flutter
const MOTHS = [
  { rx: 24, ry: 15, f: 2, wx: 7, wy: 6, g: 5, at: 0, flap: 90, scale: 1 },
  { rx: 30, ry: 20, f: -1, wx: 6, wy: 8, g: 4, at: 0.37, flap: 80, scale: 0.85 },
  { rx: 18, ry: 24, f: 3, wx: 5, wy: 5, g: 7, at: 0.71, flap: 100, scale: 0.75 },
];

function Moth({ phase, m, cx, cy }: { phase: SharedValue<number>; m: (typeof MOTHS)[number]; cx: number; cy: number }) {
  const flight = useAnimatedStyle(() => {
    const t = 2 * Math.PI * (phase.get() + m.at);
    const x = cx + m.rx * Math.sin(m.f * t) + m.wx * Math.sin(m.g * t + 1.3);
    const y = cy + m.ry * Math.cos(m.f * t) * 0.8 + m.wy * Math.sin((m.g + 1) * t + 0.4);
    // turned a little the way it flies
    const turn = 25 * Math.cos(m.f * t) * Math.sign(m.f);
    return { transform: [{ translateX: x - SIZE / 2 }, { translateY: y - SIZE / 2 }, { rotate: `${turn}deg` }, { scale: m.scale }] };
  });
  const wings = useAnimatedStyle(() => {
    const beat = Math.abs(Math.sin(Math.PI * m.flap * (phase.get() + m.at)));
    return { transform: [{ scaleX: 0.35 + 0.65 * beat }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE }, flight]}>
      <Animated.View style={[{ width: SIZE, height: SIZE }, wings]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 12 12">
          <Ellipse cx={3.4} cy={5} rx={3.1} ry={2.4} fill="#f4e7c6" opacity={0.85} transform="rotate(-25 3.4 5)" />
          <Ellipse cx={8.6} cy={5} rx={3.1} ry={2.4} fill="#f4e7c6" opacity={0.85} transform="rotate(25 8.6 5)" />
          <Ellipse cx={4.1} cy={8} rx={1.9} ry={1.5} fill="#e9d8ae" opacity={0.8} />
          <Ellipse cx={7.9} cy={8} rx={1.9} ry={1.5} fill="#e9d8ae" opacity={0.8} />
          <Path d="M6 3.2v6.4" stroke="#8a7550" strokeWidth={1.1} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

// the moths, flying around (cx, cy) in a box of the given size
export function Moths({ width, height, cx, cy }: { width: number; height: number; cx: number; cy: number }) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.set(withRepeat(withTiming(1, { duration: ROUND_MS, easing: Easing.linear }), -1));
  }, [phase]);
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      {MOTHS.map((m, i) => (
        <Moth key={i} phase={phase} m={m} cx={cx} cy={cy} />
      ))}
    </View>
  );
}
