// The eight-pointed rosette of the mushaf, the shape that closes an ayah: a star with a round medallion in its middle. Drawn
// (not a font glyph) so it is the same on every phone. `children` is what sits in the medallion (a number, say); `fill` is
// the colour of the paper it sits on, so the lines of the star do not show through.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

const POINTS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * Math.PI) / 8 - Math.PI / 2;
  const r = i % 2 === 0 ? 15 : 11.4;
  return `${(16 + r * Math.cos(angle)).toFixed(2)},${(16 + r * Math.sin(angle)).toFixed(2)}`;
}).join(' ');

export function Rosette({ size = 32, color, fill = 'none', children }: { size?: number; color: string; fill?: string; children?: ReactNode }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" style={StyleSheet.absoluteFill}>
        <Polygon points={POINTS} fill={fill} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
        <Circle cx={16} cy={16} r={8.6} fill={fill} stroke={color} strokeWidth={1.2} />
      </Svg>
      {children}
    </View>
  );
}
