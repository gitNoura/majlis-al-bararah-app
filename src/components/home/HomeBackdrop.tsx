// HOME's page: one flat, neutral colour for the cards to sit on. Used by Home, Hifdh and every page without its own background.
import { StyleSheet, View } from 'react-native';

import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

export function HomeBackdrop() {
  const k = useSkin();
  const { isDark } = useTheme();
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? k.wash[1] : '#f4f4f2' }]} />;
}
