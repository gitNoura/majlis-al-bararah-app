// A panel of Home's, the Library's and the Hifdh page's: now Home's glass (a frosted, see-through box with a soft light along its
// edges), the same for the white (`surface`) and the `soft` tone, so no box is green. `tone` is kept for the callers.
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { GlassBack } from '@/components/home/Glass';

export function Panel({ style, children }: { tone?: 'surface' | 'soft'; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  const radius = StyleSheet.flatten(style)?.borderRadius ?? 20;
  return (
    <View style={style}>
      <GlassBack radius={typeof radius === 'number' ? radius : 20} />
      {children}
    </View>
  );
}
