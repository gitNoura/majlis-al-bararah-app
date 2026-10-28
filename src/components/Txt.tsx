// Text in the app's fonts: Tajawal (the interface) or Amiri (serif: titles, Quranic and hadith text),
// at a weight, in the colour of the moment, aligned with the language (start: right in Arabic).
import { Text, type TextProps, type TextStyle } from 'react-native';

import { serif as serifFont, ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

type Props = TextProps & {
  size?: number;
  weight?: 400 | 500 | 600 | 700 | 800;
  serif?: boolean;
  color?: string;
  center?: boolean;
  lineHeight?: number;
};

export function Txt({ size = 15, weight = 400, serif, color, center, lineHeight, style, ...rest }: Props) {
  const { c } = useTheme();
  const base: TextStyle = {
    fontFamily: serif ? serifFont(weight >= 700 ? 700 : 400) : ui(weight),
    fontSize: size,
    lineHeight: lineHeight ?? Math.round(size * (serif ? 1.7 : 1.45)),
    color: color ?? c.text,
    textAlign: center ? 'center' : 'auto',
  };
  return <Text {...rest} style={[base, style]} />;
}
