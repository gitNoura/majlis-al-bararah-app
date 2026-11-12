// The sky behind the home screen's prayer box, alive and slow: at night the stars twinkle (two sets, out
// of step) and the whole field drifts a little; by day a few clouds cross from one side to the other
// over a minute or two, and the sun sits where it is - rising at the start of the line, high at
// midday, low at its end by sunset, only its glow at the edge while it is under the horizon. Faint, behind
// the box's words.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { isEnglish } from '@/i18n/i18n';

export type Phase = 'night' | 'dawn' | 'midday' | 'afternoon' | 'sunset';

// x, y (in a 360 × 160 box), size, brightness
const STARS = [
  [28, 26, 1.1, 0.8],
  [70, 58, 0.8, 0.55],
  [118, 20, 1.2, 0.9],
  [166, 44, 0.8, 0.5],
  [214, 16, 1, 0.75],
  [252, 62, 0.7, 0.5],
  [290, 28, 1.1, 0.7],
  [334, 50, 0.9, 0.65],
  [96, 120, 0.7, 0.4],
  [196, 108, 0.8, 0.45],
  [312, 128, 0.7, 0.4],
  [48, 140, 0.8, 0.45],
  [140, 84, 0.6, 0.35],
  [238, 96, 0.6, 0.35],
  [8, 96, 0.7, 0.4],
  [352, 104, 0.6, 0.35],
];
const CLOUD = 'M12 22h38a9 9 0 0 0 0-18 12 12 0 0 0-22-2 9 9 0 0 0-16 7 6.5 6.5 0 0 0 0 13z';
// each cloud: its height in the box, its size, how long it takes to cross, where it starts (0 to 1)
const CLOUDS = [
  { top: 6, width: 74, seconds: 95, start: 0.15 },
  { top: 44, width: 54, seconds: 130, start: 0.62 },
  { top: 96, width: 64, seconds: 110, start: 0.9 },
];

export function PrayerSky({ phase, sun }: { phase: Phase; sun: number }) {
  const [width, setWidth] = useState(0);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {phase === 'night' ? <Stars /> : <Day phase={phase} sun={sun} width={width} />}
    </View>
  );
}

// ---------- the night ----------

function Stars() {
  const twinkle = useSharedValue(0);
  const drift = useSharedValue(0);
  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    twinkle.set(withRepeat(withTiming(1, { duration: 3600, easing: ease }), -1, true));
    drift.set(withRepeat(withTiming(1, { duration: 45000, easing: ease }), -1, true));
  }, [twinkle, drift]);
  const field = useAnimatedStyle(() => ({ transform: [{ translateX: drift.get() * -18 }, { translateY: drift.get() * 4 }] }));
  const setA = useAnimatedStyle(() => ({ opacity: 0.45 + twinkle.get() * 0.55 }));
  const setB = useAnimatedStyle(() => ({ opacity: 1 - twinkle.get() * 0.55 }));
  const layer = (odd: number) => (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice">
      {STARS.filter((_, i) => i % 2 === odd).map(([x, y, r, o], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#f3e9c8" opacity={o} />
      ))}
    </Svg>
  );
  return (
    <Animated.View style={[styles.wide, field]}>
      <Animated.View style={[StyleSheet.absoluteFill, setA]}>{layer(0)}</Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, setB]}>{layer(1)}</Animated.View>
    </Animated.View>
  );
}

// ---------- the day ----------

function Day({ phase, sun, width }: { phase: Phase; sun: number; width: number }) {
  const f = Math.min(1.05, Math.max(-0.05, sun));
  const x = 34 + f * 292;
  const y = 152 - Math.sin(Math.PI * Math.min(1, Math.max(0, f))) * 112;
  const low = f < 0.12 || f > 0.88; // near the horizon: redder and larger
  const up = f > 0 && f < 1;
  const colour = phase === 'sunset' || low ? '#f08a55' : phase === 'midday' ? '#ffe6a3' : '#f6b46f';
  const soft = phase === 'afternoon'; // the warm afternoon: a wide, faint glow instead of a hard orange disc, and warm-white clouds
  const cloud =
    phase === 'sunset' ? 'rgba(255, 214, 196, 0.42)' : phase === 'midday' ? 'rgba(255, 255, 255, 0.7)' : soft ? 'rgba(255, 244, 232, 0.6)' : 'rgba(255, 255, 255, 0.55)';
  return (
    <>
      <Svg style={[StyleSheet.absoluteFill, !isEnglish && styles.mirror]} viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="box-sun-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colour} stopOpacity={0.5} />
            <Stop offset="1" stopColor={colour} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={x} cy={y} r={soft ? 66 : low ? 56 : 46} fill="url(#box-sun-glow)" />
        {up && <Circle cx={x} cy={y} r={low ? 17 : 14} fill={colour} opacity={soft ? 0.2 : 0.4} />}
      </Svg>
      {width > 0 && CLOUDS.map((c, i) => <Cloud key={i} {...c} colour={cloud} room={width} />)}
    </>
  );
}

// one cloud crossing the box, in the direction of reading, and starting again
function Cloud({
  top,
  width,
  seconds,
  start,
  colour,
  room,
}: {
  top: number;
  width: number;
  seconds: number;
  start: number;
  colour: string;
  room: number;
}) {
  const t = useSharedValue(start);
  useEffect(() => {
    t.set(
      withTiming(1, { duration: (1 - start) * seconds * 1000, easing: Easing.linear }, (done) => {
        if (!done) return;
        t.set(0);
        t.set(withRepeat(withTiming(1, { duration: seconds * 1000, easing: Easing.linear }), -1));
      }),
    );
  }, [t, start, seconds]);
  const travel = room + width;
  const move = useAnimatedStyle(() => {
    const at = -width + t.get() * travel;
    return { transform: [{ translateX: isEnglish ? at : room - width - at }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top, width, height: width * 0.4 }, move]}>
      <Svg width={width} height={width * 0.4} viewBox="0 0 60 24">
        <Path d={CLOUD} fill={colour} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mirror: { transform: [{ scaleX: -1 }] },
  // the star field a little wider than the box, so its drift never shows an edge
  wide: { position: 'absolute', top: -6, bottom: -6, left: -20, right: -20 },
});
