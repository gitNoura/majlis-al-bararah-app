// HOME's page: its own off-white with three large, faint pools of grey and white that stay still while the cards scroll over
// them, so the glass has something to blur and show through. The Home screen puts this inside the BlurTargetView on Android.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

// each pool: its colour, where its centre is (0 to 1 across and down the page) and how strong it is. Home's off-white in
// two deeper greys, plus white for light, and one soft pool of the app's green in the bottom left.
const POOLS = {
  light: [
    { color: '#cfd1cc', x: 0.92, y: 0.12, o: 0.55 },
    { color: '#ffffff', x: 0.08, y: 0.42, o: 0.9 },
    { color: '#d8dad5', x: 0.9, y: 0.78, o: 0.5 },
    { color: '#7fbf9f', x: 0.04, y: 0.97, o: 0.5 }, // the one touch of green, bottom left
  ],
  dark: [
    { color: '#4a4d4a', x: 0.92, y: 0.12, o: 0.4 },
    { color: '#8a8d89', x: 0.08, y: 0.42, o: 0.08 },
    { color: '#3d403d', x: 0.9, y: 0.78, o: 0.3 },
    { color: '#2f8f6e', x: 0.04, y: 0.97, o: 0.38 },
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
