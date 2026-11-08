// The icons of the ayah menu and of the page's bookmark: one family, 24 px, a 1.8 line with round ends, so they read
// as one set (tafsir: an open book; comment: a speech bubble with lines; where I stopped: an underlined letter; highlight:
// a marker over its colour; bookmark: a ribbon, filled when the page carries one).
import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number; filled?: boolean };

function Base({ color, size = 20, children }: { color: string; size?: number; children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export const BookIcon = ({ color, size }: Props) => (
  <Base color={color} size={size}>
    <Path d="M12 7.2C10.4 5.9 8.2 5.2 5.5 5.2H3.8v12.6h1.7c2.7 0 4.9.7 6.5 2 1.6-1.3 3.8-2 6.5-2h1.7V5.2h-1.7c-2.7 0-4.9.7-6.5 2zM12 7.2v12.6" />
  </Base>
);

export const BubbleIcon = ({ color, size }: Props) => (
  <Base color={color} size={size}>
    <Path d="M6 4.5h12a2.5 2.5 0 012.5 2.5v7.5a2.5 2.5 0 01-2.5 2.5h-6.2L8 21v-4H6a2.5 2.5 0 01-2.5-2.5V7A2.5 2.5 0 016 4.5zM8 9.2h8M8 12.6h5" />
  </Base>
);

export const UnderlineIcon = ({ color, size }: Props) => (
  <Base color={color} size={size}>
    <Path d="M7 4.5v6.5a5 5 0 0010 0V4.5M5 20h14" />
  </Base>
);

export const MarkerIcon = ({ color, size }: Props) => (
  <Base color={color} size={size}>
    <Path d="M15 4.8l4.2 4.2L9.4 18.8l-4.7.8.8-4.7zM4 21.5h16" />
  </Base>
);

export const BookmarkIcon = ({ color, size, filled }: Props) => (
  <Base color={color} size={size}>
    <Path d="M7 3.8h10a1.2 1.2 0 011.2 1.2v15.4L12 16.2 5.8 20.4V5A1.2 1.2 0 017 3.8z" fill={filled ? color : 'none'} />
  </Base>
);
