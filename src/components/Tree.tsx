// The tree in the corner by day (the website's orange tree on the Quran page, olive, vine...: the same
// drawing, src/lib/tree.js). The breeze rocks it gently from the foot of its limb - a few slow waves
// added together over 7 s, so it never stops and starts; touched, it swings like a held spring, each
// swing smaller, and a leaf (or a blossom) comes off and drifts down the screen as on the website:
// swaying and turning on its way, about half the screen down, fading at the end. The tree takes the
// whole screen below its top (`room`), its drawing in the corner, so a leaf can fall all that way.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { leafXml, treeXml } from '@/lib/tree';

type Kind = 'olive' | 'orange' | 'grape' | 'pomegranate';
type Leaf = { id: number; xml: string; size: number; x: number; y: number; side: number };

const W = 170;
const H = 120;

// the breeze at a point of its 7 s, in degrees (about -0.2 to 1.2, as on the website): whole waves
// only, so the end joins the start
const breezeAt = (p: number) => {
  'worklet';
  const t = 2 * Math.PI * p;
  return 0.3 - 1.05 * (0.5 * Math.sin(t) + 0.3 * Math.sin(2 * t + 0.9) + 0.1 * Math.sin(3 * t + 2));
};

// `mirrored`: in the right corner (the drawing is for the left one); `room`: the screen below the
// tree's top, where it stands and its leaves fall
export function Tree({ kind, mirrored, room }: { kind: Kind; mirrored?: boolean; room: { width: number; height: number } }) {
  const xml = useMemo(() => treeXml(kind), [kind]);
  const left = mirrored ? room.width - W : 0;
  const phase = useSharedValue(0);
  const push = useSharedValue(0);
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    phase.set(withRepeat(withTiming(1, { duration: 7000, easing: Easing.linear }), -1));
  }, [phase]);

  const sway = useAnimatedStyle(() => ({
    transform: [{ rotate: `${breezeAt(phase.get()) + push.get()}deg` }],
  }));

  // touched: a swing (a push, then a soft spring back that swings past and settles), and a leaf off
  const touch = () => {
    push.set(withSpring(0, { velocity: 46, stiffness: 40, damping: 3.4, mass: 1 }));
    const { xml: leaf, size } = leafXml(kind);
    const id = Date.now();
    const x = W * (0.25 + Math.random() * 0.5);
    setLeaves((list) => [
      ...list,
      { id, xml: leaf, size, x: left + (mirrored ? W - x : x), y: H * (0.15 + Math.random() * 0.45), side: Math.random() < 0.5 ? -1 : 1 },
    ]);
  };
  const fallen = (id: number) => setLeaves((list) => list.filter((l) => l.id !== id));

  return (
    <View style={{ width: room.width, height: room.height }} pointerEvents="box-none">
      {/* drawn for the left corner: turned round as a whole for the right one (the sway inside it) */}
      <View style={[{ position: 'absolute', left, top: 0 }, mirrored && styles.mirror]} pointerEvents="none">
        <Animated.View style={[{ width: W, height: H, transformOrigin: `0px ${116}px` }, sway]}>
          <SvgXml xml={xml} width={W} height={H} />
        </Animated.View>
      </View>
      <Pressable
        onPress={touch}
        style={{ position: 'absolute', left, top: H * 0.1, width: W, height: H * 0.9 }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {leaves.map((l) => (
        <FallingLeaf key={l.id} leaf={l} drop={Math.min(room.height * 0.55, 420)} onDone={() => fallen(l.id)} />
      ))}
    </View>
  );
}

// A leaf drifting down, as on the website (its branch.js): out to one side turning, back the other way,
// and on, over 4.2 s gathering speed, fading over its last third
const AT = [0, 0.3, 0.65, 1];
const EASE_IN = Easing.bezier(0.42, 0, 1, 1); // CSS «ease-in»

function FallingLeaf({ leaf, drop, onDone }: { leaf: Leaf; drop: number; onDone: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(80, withTiming(1, { duration: 4200, easing: EASE_IN }, (done) => done && scheduleOnRN(onDone))));
  }, [t, onDone]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    const s = leaf.side;
    return {
      opacity: interpolate(p, [0, 0.65, 1], [1, 0.9, 0]),
      transform: [
        { translateX: interpolate(p, AT, [0, 28 * s, -18 * s, 12 * s]) },
        { translateY: interpolate(p, AT, [0, drop * 0.3, drop * 0.65, drop]) },
        { rotate: `${interpolate(p, AT, [0, 70 * s, -40 * s, 120 * s])}deg` },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: leaf.x - leaf.size / 2, top: leaf.y }, style]}>
      <SvgXml xml={leaf.xml} width={leaf.size} height={leaf.size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mirror: { transform: [{ scaleX: -1 }] },
});
