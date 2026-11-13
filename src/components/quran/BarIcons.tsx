// The icons of Read's bottom bar, the same family as the main bar's (src/components/ui/TabIcons.tsx): slim solid glyphs on a 24 × 24 grid
// (drawn a little smaller in their box), soft corners, small cut-outs. The settings icon is the main bar's own (the gear).
import type { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

function Frame({ color, size = 24, children }: Props & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="-2.5 -2.5 29 29" fill={color}>
      {children}
    </Svg>
  );
}

// Bookmarked pages: a solid ribbon with a soft notch
export const BarBookmarkIcon = (p: Props) => (
  <Frame {...p}>
    <Path d="M7.2 3.9h9.6a1.4 1.4 0 0 1 1.4 1.4v14.4a.5.5 0 0 1-.8.4L12 16.1l-5.4 4a.5.5 0 0 1-.8-.4V5.3a1.4 1.4 0 0 1 1.4-1.4Z" />
  </Frame>
);

// Highlights: a solid marker over its colour line
export const BarHighlightIcon = (p: Props) => (
  <Frame {...p}>
    <Path d="m14.6 3.6 5.8 5.8-8.9 8.9H5.6v-5.8Z" />
    <Path d="M4.8 19.9h14.4a.8.8 0 0 1 0 1.6H4.8a.8.8 0 0 1 0-1.6Z" />
  </Frame>
);

// Comments: a solid speech bubble with two lines cut out
export const BarCommentIcon = (p: Props) => (
  <Frame {...p}>
    <Path
      fillRule="evenodd"
      d="M6.4 4h11.2a2.6 2.6 0 0 1 2.6 2.6v7.8a2.6 2.6 0 0 1-2.6 2.6h-5.3l-3.6 3.2a.5.5 0 0 1-.8-.4V17H6.4a2.6 2.6 0 0 1-2.6-2.6V6.6A2.6 2.6 0 0 1 6.4 4Z M8.2 8.4h7.6a.8.8 0 0 1 0 1.6H8.2a.8.8 0 0 1 0-1.6Z M8.2 11.6h4.4a.8.8 0 0 1 0 1.6H8.2a.8.8 0 0 1 0-1.6Z"
    />
  </Frame>
);
