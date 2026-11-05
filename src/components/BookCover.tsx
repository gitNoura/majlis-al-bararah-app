// A book of hadith as it looks on a scholar's shelf (its icon on the Ahadith page): a plain cloth-bound
// hardcover in one quiet colour - green, red, blue - a single thin gold frame, and the book's name in
// gold Arabic in a small panel, as the printed editions are; the spine with two thin gold lines - on the
// right in Arabic (an Arabic book), on the left in English and French. Nothing more: no medallion, no glow.
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { isEnglish, t } from '@/i18n/i18n';
import { serif } from '@/theme/fonts';

const CLOTH: Record<string, { cloth: string; spine: string }> = {
  bukhari: { cloth: '#2f5e4b', spine: '#244b3c' },
  muslim: { cloth: '#8b3d47', spine: '#71303a' },
  nawawi: { cloth: '#3a5482', spine: '#2e446b' },
};
const GOLD = '#d4b46f';

export function BookCover({ book, width = 48 }: { book: string; width?: number }) {
  const k = CLOTH[book] ?? CLOTH.bukhari;
  const height = (width * 80) / 60;
  const id = `bc-${book}`;
  // the name on two lines: «صحيح» / «البخاري»
  const name = t(`ah_${book}_cover`);
  const space = name.indexOf(' ');
  const [line1, line2] = space > 0 ? [name.slice(0, space), name.slice(space + 1)] : [name, ''];
  const u = width / 60; // one unit of the drawing, in points
  // bound as a book of the app's language: on the right in Arabic, on the left in English and French
  const rtl = !isEnglish;
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 60 80">
        <Defs>
          {/* the cloth: one colour, only a breath lighter at the top */}
          <LinearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={k.cloth} stopOpacity={0.92} />
            <Stop offset="0.25" stopColor={k.cloth} />
            <Stop offset="1" stopColor={k.cloth} />
          </LinearGradient>
        </Defs>
        {/* drawn as an Arabic book (the spine on the right); turned round for an English one (on the left) */}
        <G transform={rtl ? undefined : 'translate(56 0) scale(-1 1)'}>
        {/* the cover, the spine */}
        <Rect x={1} y={1} width={54} height={77} rx={2.5} fill={`url(#${id}-c)`} />
        <Rect x={47} y={1} width={8} height={77} rx={2} fill={k.spine} />
        <Path d="M47 1.5 V77.5" stroke="#000000" strokeOpacity={0.18} strokeWidth={0.7} />
        <Path d="M48.5 9 H53.5 M48.5 11 H53.5 M48.5 68 H53.5 M48.5 70 H53.5" stroke={GOLD} strokeWidth={0.6} />
        {/* the thin gold frame */}
        <Rect x={6} y={6} width={36} height={67} rx={1} fill="none" stroke={GOLD} strokeWidth={0.8} />
        {/* the title's panel, and a short rule under it */}
        <Rect x={11} y={20} width={26} height={22} rx={3} fill="none" stroke={GOLD} strokeWidth={0.7} />
        <Path d="M18 50 H30" stroke={GOLD} strokeWidth={0.6} />
        </G>
      </Svg>
      {/* the name in gold, in its panel */}
      <View style={[styles.title, { left: (rtl ? 11 : 19) * u, top: 20 * u, width: 26 * u, height: 22 * u }]} pointerEvents="none">
        <Txt size={7.2 * u} weight={700} center color={GOLD} lineHeight={10.6 * u} style={{ fontFamily: serif(700) }}>
          {line1}
        </Txt>
        {!!line2 && (
          <Txt size={7.2 * u} weight={700} center color={GOLD} lineHeight={10.6 * u} style={{ fontFamily: serif(700) }}>
            {line2}
          </Txt>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
