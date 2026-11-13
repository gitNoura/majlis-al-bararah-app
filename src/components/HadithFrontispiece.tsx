// The heading of the Hadith pages, drawn as the first page of an illuminated manuscript: the same fine geometric lattice as the
// Adhkar's (src/components/IslamicPattern.tsx) in the Hadith's green, and over it a pointed panel, framed in two lines, with
// a line in it («Allah's Messenger, peace be upon him, said») - or, on a book's page, the book's name.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { dayLook, PatternScene, type Look } from '@/components/IslamicPattern';
import { Txt } from '@/components/Txt';
import { cartouche } from '@/lib/pattern';
import { useTheme } from '@/theme/theme';

const NIGHT_GREEN: Look = { top: '#1f2623', bottom: '#1a201d', ink: '#e9dfbd', glow: '#232b27', opacity: 0.16 };

export function HadithFrontispiece({ label = 'قال رسول الله ﷺ', compact }: { label?: string; compact?: boolean }) {
  const { c, isDark } = useTheme();
  const [w, setW] = useState(0);
  const h = compact ? 96 : 150;
  const look = isDark ? NIGHT_GREEN : dayLook('#e3efe6', '#2e6a4e');
  const pw = Math.min(w - 36, compact ? 300 : 320);
  const ph = compact ? 54 : 66;
  const line = isDark ? '#e9dfbd' : '#2e6a4e';
  return (
    <View style={[styles.box, { height: h }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <>
          <PatternScene kind="star" look={look} width={w} height={h} place="none" />
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Path d={cartouche(w / 2, h / 2, pw + 12, ph + 12)} fill="none" stroke={line} strokeOpacity={0.45} strokeWidth={0.9} />
            <Path d={cartouche(w / 2, h / 2, pw, ph)} fill={c.surface} stroke={line} strokeWidth={1.4} />
            <Path d={cartouche(w / 2, h / 2, pw - 12, ph - 12)} fill="none" stroke={line} strokeOpacity={0.55} strokeWidth={0.7} />
          </Svg>
          <View style={styles.label} pointerEvents="none">
            <Txt size={compact ? 20 : 24} weight={700} serif center color={c.ink} lineHeight={compact ? 34 : 40} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ maxWidth: pw - 70 }}>
              {label}
            </Txt>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 26, borderCurve: 'continuous', overflow: 'hidden' },
  label: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
