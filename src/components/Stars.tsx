// The Quran's background (the website's base.css and topbar.css): ivory fading towards the bottom by
// day, the dark grey at night, with faint eight-pointed stars over it; at night the stars near the
// lantern are lit by it (a brighter copy of them, seen only through a soft round of light at `glow`).
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Mask, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

// the star tile (48 × 48): an eight-pointed star, a smaller one inside, a diamond at each corner
function Tile({ id, colour, opacity }: { id: string; colour: string; opacity: number }) {
  return (
    <Pattern id={id} patternUnits="userSpaceOnUse" width={48} height={48}>
      <G fill="none" stroke={colour} strokeOpacity={opacity} strokeWidth={0.55} strokeLinejoin="round">
        <Path d="M48,24L36.01,28.97L40.97,40.97L28.97,36.01L24,48L19.03,36.01L7.03,40.97L11.99,28.97L0,24L11.99,19.03L7.03,7.03L19.03,11.99L24,0L28.97,11.99L40.97,7.03L36.01,19.03Z" />
        <Path d="M34.16,28.21L28.24,28.24L28.21,34.16L24,30L19.79,34.16L19.76,28.24L13.84,28.21L18,24L13.84,19.79L19.76,19.76L19.79,13.84L24,18L28.21,13.84L28.24,19.76L34.16,19.79L30,24Z" />
        <Path d="M-4 0L0 -4L4 0L0 4ZM44 0L48 -4L52 0L48 4ZM-4 48L0 44L4 48L0 52ZM44 48L48 44L52 48L48 52Z" />
      </G>
    </Pattern>
  );
}

// `faint`: the stars alone (no ivory under them), fainter - barely seen at first (the home screen)
export function Stars({ glow, faint }: { glow?: { x: number; y: number } | null; faint?: boolean }) {
  const { c, isDark } = useTheme();
  const lit = isDark && glow;
  const strength = faint ? 0.6 : 1;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {!faint && <LinearGradient colors={[c.screen, c.screenEnd]} style={StyleSheet.absoluteFill} />}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Tile id="stars" colour={isDark ? '#e4c978' : '#b8923f'} opacity={(isDark ? 0.035 : 0.065) * strength} />
          {lit && (
            <>
              <Tile id="lit" colour="#e4c978" opacity={0.3} />
              <RadialGradient id="glow" cx={glow.x} cy={glow.y} r={120} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff" stopOpacity={1} />
                <Stop offset="0.45" stopColor="#fff" stopOpacity={0.6} />
                <Stop offset="1" stopColor="#fff" stopOpacity={0} />
              </RadialGradient>
              <Mask id="near">
                <Rect width="100%" height="100%" fill="url(#glow)" />
              </Mask>
            </>
          )}
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stars)" />
        {lit && <Rect width="100%" height="100%" fill="url(#lit)" mask="url(#near)" />}
      </Svg>
    </View>
  );
}

// Every screen's background (the home screen's): nearly white by day (a white veil at 90 % over the
// ivory), the plain dark grey at night, and the stars over it, faint - barely seen at first; `glow`: the
// stars lit around the Quran page's lantern at night. Since 2026-11-04 every page is plain, as the home
// screen (no stars): `stars` brings them back on a page.
export function ScreenBackground({ glow, stars }: { glow?: { x: number; y: number } | null; stars?: boolean }) {
  const { c, isDark } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.screen }]} />
      {!isDark && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} />}
      {stars && <Stars faint glow={glow} />}
    </View>
  );
}
