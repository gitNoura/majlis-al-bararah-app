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

// iOS 26's native Liquid Glass has no intensity or opacity control (only style, tint and colour scheme), so it can't be calmed down.
// It is off by default (iOS uses the same tunable BlurView glass as the rest); a glass asks for it with `native` (the plan cards do),
// and this flag turns it on for every glass at once.
const USE_LIQUID_GLASS = false;
const CAN_LIQUID = Platform.OS === 'ios' && isLiquidGlassAvailable();

// `tint`: a soft colour inside the glass (two colours: the lit top corner, then clear), drawn over the fill and sheen so the colour shows
// `native`: the system's Liquid Glass on iOS 26+ (the blur glass elsewhere); `interactive`: it reacts to touch (iOS 26+ only)
type Props = { radius?: number; intensity?: number; tint?: readonly [string, string]; native?: boolean; interactive?: boolean; bare?: boolean; style?: StyleProp<ViewStyle>; children?: ReactNode };

export function Glass({ radius = 28, intensity = 60, tint, native, interactive, bare, style, children }: Props) {
  const k = useSkin();
  const { isDark } = useTheme();
  const target = useContext(GlassTarget);
  const shape = { borderRadius: radius, borderCurve: 'continuous' } as const;

  if (CAN_LIQUID && (native ?? USE_LIQUID_GLASS)) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive={interactive} colorScheme={isDark ? 'dark' : 'light'} style={[shape, style]}>
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
    <View style={[shape, { boxShadow: isDark ? `0px 8px 24px ${k.glassShadow}` : `0px 8px 24px ${k.glassShadow}, 0px 1px 3px rgba(0, 0, 0, 0.06), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.05)` }, style]}>
      <View style={[StyleSheet.absoluteFill, shape, { overflow: 'hidden', borderWidth: bare ? 0 : StyleSheet.hairlineWidth * 2, borderColor: k.glassEdge }]} pointerEvents="none">
        {!bare && (
          <>
          <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} blurTarget={target ?? undefined} blurMethod={target ? 'dimezisBlurViewSdk31Plus' : 'none'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: k.glass }]} />
          <LinearGradient colors={[k.glassSheen, 'rgba(255, 255, 255, 0)']} style={styles.sheen} />
          <LinearGradient colors={['rgba(255, 255, 255, 0)', k.glassGlint]} style={styles.glint} />
          {!isDark && <LinearGradient colors={['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.035)']} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
          {!isDark && <View style={[StyleSheet.absoluteFill, shape, { boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 1), inset 0px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 14px rgba(255, 255, 255, 0.6)' }]} />}
          {tint && <LinearGradient colors={tint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
          </>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%' },
  glint: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%' },
});

// Glass drawn behind the children of a box that lays itself out (a row, a result, a card with its own padding): put it first
// inside the box, give the box its `borderRadius`, and take the box's own background and border off.
//   strong   a firmer fill, for panels over the Quran's text (so the Arabic stays easy to read)
//   topOnly  only the top corners are round (a side panel or a sheet that runs to the screen's edge)
export function GlassBack({ radius = 20, strong, topOnly }: { radius?: number; strong?: boolean; topOnly?: boolean }) {
  const { isDark } = useTheme();
  const firm = isDark ? 'rgba(22, 22, 22, 0.62)' : 'rgba(255, 255, 255, 0.62)';
  const clip = topOnly ? { borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' as const } : { borderRadius: radius, overflow: 'hidden' as const };
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, clip]}>
      <Glass radius={topOnly ? 0 : radius} style={[StyleSheet.absoluteFill, topOnly && { bottom: -radius }]} />
      {strong && <View style={[StyleSheet.absoluteFill, { backgroundColor: firm }]} />}
    </View>
  );
}
