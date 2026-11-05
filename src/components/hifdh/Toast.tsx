// A short line at the bottom of the screen that goes away by itself (the website's #hz-toast).
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { useTheme } from '@/theme/theme';

export function useToast() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const toast = useCallback((next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(''), 2600);
  }, []);

  const node = text ? (
    <View style={[styles.wrap, { bottom: insets.bottom + 24 }]} pointerEvents="none">
      <View style={[styles.pill, { backgroundColor: c.on }]} accessibilityLiveRegion="polite">
        <Txt size={14} weight={600} center color={c.onInk}>
          {text}
        </Txt>
      </View>
    </View>
  ) : null;

  return { toast, node };
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  pill: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, maxWidth: 420 },
});
