// A short burst of confetti for «Complete» (from the website's confetti.js): pieces fly up from a point,
// fall under gravity and fade, gone after about two seconds. Drawn with Animated on the native driver.
// Nothing is drawn for people who asked their device for less motion.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const COLORS = ['#d9b96a', '#a8873a', '#1b6b53', '#2f8f6f', '#e8d6a3', '#f7f1e3'];
const LIFE = 2200;
const FRAMES = 8; // keypoints per piece along its path (the fall is a curve)

export type BurstOptions = { count?: number; spread?: number };
type Shot = { id: number; x: number; y: number; count: number; spread: number };

type Piece = {
  w: number;
  h: number;
  round: boolean;
  color: string;
  xs: number[];
  ys: number[];
  rot: string[];
};

function makePieces(x: number, y: number, count: number, spread: number): Piece[] {
  return Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
    const speed = 5 + Math.random() * 9;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let px = x;
    let py = y;
    const spin = (Math.random() - 0.5) * 0.4;
    const rot0 = Math.random() * Math.PI;
    const total = LIFE / 16.7; // physics steps (the website steps once per 60 Hz frame)
    const xs = [x];
    const ys = [y];
    const rot = [`${rot0}rad`];
    const per = total / (FRAMES - 1);
    for (let f = 1; f < FRAMES; f++) {
      for (let i = 0; i < per; i++) {
        vy += 0.28; // gravity
        vx *= 0.99;
        px += vx;
        py += vy;
      }
      xs.push(px);
      ys.push(py);
      rot.push(`${rot0 + spin * per * f}rad`);
    }
    return {
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 5,
      round: Math.random() < 0.25,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      xs,
      ys,
      rot,
    };
  });
}

function Burst({ shot, onEnd }: { shot: Shot; onEnd: (id: number) => void }) {
  const [t] = useState(() => new Animated.Value(0));
  const [pieces] = useState(() => makePieces(shot.x, shot.y, shot.count, shot.spread));

  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: LIFE, easing: Easing.linear, useNativeDriver: true }).start(() => onEnd(shot.id));
  }, [t, onEnd, shot.id]);

  const steps = Array.from({ length: FRAMES }, (_, i) => i / (FRAMES - 1));
  const fadeFrom = (LIFE - 700) / LIFE;
  const opacity = t.interpolate({ inputRange: [0, fadeFrom, 1], outputRange: [1, 1, 0] });

  return (
    <>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: -p.w / 2,
            top: -p.h / 2,
            width: p.w,
            height: p.round ? p.h * 1.4 : p.h,
            borderRadius: p.round ? p.h : 0,
            backgroundColor: p.color,
            opacity,
            transform: [
              { translateX: t.interpolate({ inputRange: steps, outputRange: p.xs }) },
              { translateY: t.interpolate({ inputRange: steps, outputRange: p.ys }) },
              { rotate: t.interpolate({ inputRange: steps, outputRange: p.rot }) },
            ],
          }}
        />
      ))}
    </>
  );
}

export function useConfetti() {
  const [shots, setShots] = useState<Shot[]>([]);
  const next = useRef(1);
  const reduced = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduced.current = v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => (reduced.current = v));
    return () => sub.remove();
  }, []);

  const burst = useCallback((x?: number, y?: number, { count = 90, spread = 1 }: BurstOptions = {}) => {
    if (reduced.current) return;
    const { width, height } = Dimensions.get('window');
    setShots((s) => [...s, { id: next.current++, x: x ?? width / 2, y: y ?? height / 2, count, spread }]);
  }, []);

  const end = useCallback((id: number) => setShots((s) => s.filter((b) => b.id !== id)), []);

  const node = shots.length ? (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {shots.map((shot) => (
        <Burst key={shot.id} shot={shot} onEnd={end} />
      ))}
    </View>
  ) : null;

  return { burst, node };
}
