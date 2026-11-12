// HOME's page: a soft mint wash with three large, faint pools of colour (mint, sky, sand) that stay still while the cards scroll over
// them, so the glass has something to blur and show through. The Home screen puts this inside the BlurTargetView on Android.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

// each pool: its colour, where its centre is (0 to 1 across and down the page) and how strong it is
const POOLS = {
  light: [
    { color: '#6fcfa8', x: 0.9, y: 0.1, o: 0.55 },
    { color: '#8fcbe8', x: 0.05, y: 0.46, o: 0.5 },
    { color: '#f0d99c', x: 0.92, y: 0.8, o: 0.5 },
  ],
  dark: [
    { color: '#2f8f6e', x: 0.9, y: 0.1, o: 0.42 },
    { color: '#2f6f8f', x: 0.05, y: 0.46, o: 0.34 },
    { color: '#8f7a3a', x: 0.92, y: 0.8, o: 0.26 },
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
