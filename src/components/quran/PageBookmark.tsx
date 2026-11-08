// The page's bookmark: a slim ribbon hanging from the top edge of the page itself, in the paper's own top margin so it
// never covers a word. It sits on the physical left of odd pages and the physical right of even ones, like a ribbon
// in a printed mushaf, whatever the language's direction.
//   not marked   a faint ghost of the ribbon, just enough to find it
//   marked       the ribbon in the accent colour, which slips down into place when it is put on
// A tap puts it on or takes it off. It sits on the page, not in the header, so the header stays clean.
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

export const RIBBON_W = 11;
export const RIBBON_H = 28;
// a ribbon hanging from the top edge: square at the top, a swallow-tail notch at the bottom
const SHAPE = `M0 0H${RIBBON_W}V${RIBBON_H}L${RIBBON_W / 2} ${RIBBON_H - 5.5}L0 ${RIBBON_H}Z`;

type Props = {
  marked: boolean;
  label: string;
  onPress: () => void;
  side: 'left' | 'right'; // the physical side of the screen
  top: number; // where the page's top edge is, in the page's room
  inset: number; // from that side of the page's edge
};

export function PageBookmark({ marked, label, onPress, side, top, inset }: Props) {
  const { c, isDark } = useTheme();
  const drop = useSharedValue(marked ? 1 : 0);
  useEffect(() => {
    drop.set(withSpring(marked ? 1 : 0, { damping: 14, stiffness: 160 }));
  }, [marked, drop]);

  const solid = useAnimatedStyle(() => ({
    opacity: drop.get(),
    transform: [{ translateY: interpolate(drop.get(), [0, 1], [-12, 0]) }],
  }));
  const ghost = useAnimatedStyle(() => ({ opacity: 1 - drop.get() }));

  return (
    // kept left to right so «left» and «right» mean the screen's own sides in Arabic too; the layer lets every touch
    // outside the ribbon through to the page
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 4 }, Platform.OS !== 'web' && { direction: 'ltr' }]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: marked }}
        hitSlop={{ top: 8, bottom: 18, left: 16, right: 16 }}
        style={{ position: 'absolute', top, [side]: inset, width: RIBBON_W, height: RIBBON_H, overflow: 'hidden' }}
      >
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, ghost]}>
          <Svg width={RIBBON_W} height={RIBBON_H}>
            <Path d={SHAPE} fill={isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(58, 51, 38, 0.13)'} />
          </Svg>
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, solid]}>
          <Svg width={RIBBON_W} height={RIBBON_H}>
            <Path d={SHAPE} fill={c.accent} />
          </Svg>
        </Animated.View>
      </Pressable>
    </View>
  );
}
