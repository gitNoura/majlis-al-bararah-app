// The icons of Read's bottom bar, drawn like the main bar's (src/components/ui/TabIcons.tsx): one family on a 24 × 24 grid, a fine 1.6
// stroke, round caps and joins, soft corners. The settings icon is the main bar's own (two sliders).
import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

function Frame({ color, size = 24, children }: Props & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

// Bookmarked pages: a ribbon with a soft notch
export const BarBookmarkIcon = (p: Props) => (
  <Frame {...p}>
    <Path d="M7.2 3.9h9.6a1.4 1.4 0 0 1 1.4 1.4v14.4a.5.5 0 0 1-.8.4L12 16.1l-5.4 4a.5.5 0 0 1-.8-.4V5.3a1.4 1.4 0 0 1 1.4-1.4Z" />
  </Frame>
);

// Highlights: a marker laid over its colour
export const BarHighlightIcon = (p: Props) => (
  <Frame {...p}>
    <Path d="m14.6 4.6 4.8 4.8-8.1 8.1H6.5v-4.8Z" />
    <Path d="m12.4 6.8 4.8 4.8M4 20.4h16" />
  </Frame>
);

// Comments: a speech bubble with two lines
export const BarCommentIcon = (p: Props) => (
  <Frame {...p}>
    <Path d="M6.4 4.6h11.2a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2h-5.5L8 20.2v-3.8H6.4a2.2 2.2 0 0 1-2.2-2.2V6.8a2.2 2.2 0 0 1 2.2-2.2Z" />
    <Path d="M8.4 9.3h7.2M8.4 12.3h4.4" />
  </Frame>
);
