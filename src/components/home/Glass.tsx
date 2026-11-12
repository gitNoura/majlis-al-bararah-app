// HOME's glass: a frosted, see-through panel, drawn the best way each phone can:
//   iOS 26+   the system's own Liquid Glass (expo-glass-effect's GlassView)
//   Android   a real blur of the page behind it: the BlurView blurs the page's BlurTargetView (HomeBackdrop, set up by the Home screen and
//             passed down through GlassTarget); on Android 11 and older, which blur slowly, just the see-through fill
//   iOS < 26, web   a BlurView blur
// On top of the blur: a pale fill and a soft sheen along the top edge (no outline), and a soft shadow.
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

// the Home screen's BlurTargetView (Android): what the glass blurs. null elsewhere.
export const GlassTarget = createContext<RefObject<View | null> | null>(null);

const LIQUID = Platform.OS === 'ios' && isLiquidGlassAvailable();

// `tint`: a soft colour inside the glass (two colours: the lit top corner, then clear), drawn over the fill and sheen so the colour shows
type Props = { radius?: number; intensity?: number; tint?: readonly [string, string]; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function Glass({ radius = 28, intensity = 60, tint, style, children }: Props) {
  const k = useSkin();
  const { isDark } = useTheme();
  const target = useContext(GlassTarget);
  const shape = { borderRadius: radius, borderCurve: 'continuous' } as const;

  if (LIQUID) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={isDark ? 'dark' : 'light'} style={[shape, style]}>
        {tint && (
          <View style={[StyleSheet.absoluteFill, shape, { overflow: 'hidden' }]} pointerEvents="none">
            <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          </View>
        )}
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[shape, { boxShadow: `0px 8px 24px ${k.glassShadow}` }, style]}>
      <View style={[StyleSheet.absoluteFill, shape, { overflow: 'hidden' }]} pointerEvents="none">
        <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} blurTarget={target ?? undefined} blurMethod={target ? 'dimezisBlurViewSdk31Plus' : 'none'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: k.glass }]} />
        <LinearGradient colors={[k.glassSheen, 'rgba(255, 255, 255, 0)']} style={styles.sheen} />
        {tint && <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '60%' },
});
