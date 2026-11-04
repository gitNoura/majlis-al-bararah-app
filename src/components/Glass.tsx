// Frosted glass, as the website's round buttons (tokens.css: --glass-bg, --glass-blur, --glass-shadow):
// what is behind blurred, a see-through tint over it - cream at 35 % by day, white at 7 % at night -
// no outline, a soft shadow below. The phone's own blur tints whiten (or blacken) more than the
// website's glass, so the blur is kept light and the website's tint is laid over it; the shadow sits
// outside the round so the round's clipping does not cut it. On Android the phone blurs only what is
// inside a BlurTargetView, so each screen with glass puts its background and pages in <GlassBackdrop>
// and the glass over it reads it from here.
import { BlurTargetView, BlurView } from 'expo-blur';
import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

type Target = RefObject<React.ComponentRef<typeof View> | null>;
const Backdrop = createContext<Target | null>(null);

// What is behind the glass (the screen's background and content); the glass goes after it
export function GlassBackdrop({ children, glass }: { children: ReactNode; glass: ReactNode }) {
  const target = useRef<React.ComponentRef<typeof View>>(null);
  return (
    <Backdrop.Provider value={target}>
      <BlurTargetView ref={target} style={StyleSheet.absoluteFill}>
        {children}
      </BlurTargetView>
      {glass}
    </Backdrop.Provider>
  );
}

// `acrylic`: the floating panels' glass (the Windows 11 «acrylic»): a stronger blur under a veil only
// 10 % opaque - 90 % see-through - and a thin bright rim
export function Glass({ style, children, acrylic }: { style?: StyleProp<ViewStyle>; children?: ReactNode; acrylic?: boolean }) {
  const { isDark } = useTheme();
  const veil = acrylic
    ? isDark
      ? 'rgba(40, 43, 41, 0.1)'
      : 'rgba(255, 252, 245, 0.1)'
    : isDark
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(255, 252, 245, 0.22)';
  const target = useContext(Backdrop);
  // the glass cut to the same corners as its box (all of them, or some: a panel rounded at the top only)
  const flat = StyleSheet.flatten(style) ?? {};
  const corners = {
    borderRadius: flat.borderRadius ?? 0,
    ...(flat.borderTopLeftRadius !== undefined && { borderTopLeftRadius: flat.borderTopLeftRadius }),
    ...(flat.borderTopRightRadius !== undefined && { borderTopRightRadius: flat.borderTopRightRadius }),
    ...(flat.borderBottomLeftRadius !== undefined && { borderBottomLeftRadius: flat.borderBottomLeftRadius }),
    ...(flat.borderBottomRightRadius !== undefined && { borderBottomRightRadius: flat.borderBottomRightRadius }),
  };
  return (
    <View
      style={[
        { boxShadow: isDark ? '0px 8px 24px rgba(0, 0, 0, 0.3)' : '0px 8px 24px rgba(68, 55, 43, 0.07)' },
        acrylic && { borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)' },
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { ...corners, overflow: 'hidden' }]}>
        <BlurView
          intensity={acrylic ? (isDark ? 30 : 45) : isDark ? 9 : 20}
          tint={acrylic && isDark ? 'dark' : 'light'}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={target ?? undefined}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: veil }]} />
      </View>
      {/* (in its own layer, over the glass on every platform) */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
