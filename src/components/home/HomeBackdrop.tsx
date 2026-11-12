// HOME's page: a soft beige wash with three large, faint pools of sand and white that stay still while the cards scroll over
// them, so the glass has something to blur and show through. The Home screen puts this inside the BlurTargetView on Android.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

// each pool: its colour, where its centre is (0 to 1 across and down the page) and how strong it is. One hue only (the page's beige) in
// two depths, plus white for light: enough for the glass to show, without a second colour.
const POOLS = {
  light: [
    { color: '#d8c59c', x: 0.92, y: 0.12, o: 0.55 },
    { color: '#ffffff', x: 0.08, y: 0.42, o: 0.9 },
    { color: '#e2d1ab', x: 0.9, y: 0.78, o: 0.5 },
  ],
  dark: [
    { color: '#8f7a52', x: 0.92, y: 0.12, o: 0.32 },
    { color: '#cbb98f', x: 0.08, y: 0.42, o: 0.1 },
    { color: '#7a6840', x: 0.9, y: 0.78, o: 0.26 },
  ],
};

export function HomeBackdrop() {
  const k = useSkin();
  const { isDark } = useTheme();
  const pools = isDark ? POOLS.dark : POOLS.light;
  return (
    <>
      <LinearGradient colors={k.wash} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {pools.map((p, i) => (
            <RadialGradient key={i} id={`pool${i}`} cx={p.x} cy={p.y} r={0.55}>
              <Stop offset="0" stopColor={p.color} stopOpacity={p.o} />
              <Stop offset="1" stopColor={p.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {pools.map((_, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#pool${i})`} />
        ))}
      </Svg>
    </>
  );
}
