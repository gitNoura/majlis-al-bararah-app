// A category's or a chapter's painting: the same little landscape as the morning and evening ones
// (src/components/AdhkarScene.tsx) - hills, mist, the mosque on the far ridge - under a sky of its own
// colour (the night's for the night-time ones: sleep...), and in that sky its subject, drawn large in
// fine lines (a bed, the Kaaba, a suitcase, prayer beads...) with a soft light behind it.
import { View } from 'react-native';

import { Art, tone as toneOf, type Tone } from '@/components/AdhkarArt';
import { AdhkarScene } from '@/components/AdhkarScene';

// the skies by day, a colour family each: high up, the middle, at the horizon
const SKIES: Record<Exclude<Tone, 'indigo'>, string[]> = {
  gold: ['#f6dfae', '#fbefd6', '#f7d6a3'],
  clay: ['#f2cdb6', '#f9e6d6', '#f1c6a6'],
  teal: ['#c6e6e1', '#e6f3ee', '#f0ead7'],
  green: ['#d3e8d2', '#edf3e1', '#f2ead0'],
  rose: ['#f1cdd5', '#f9e5e3', '#f2d3c5'],
  slate: ['#d6dce3', '#ebeef0', '#e9e1d3'],
};

// `place`: the subject in the middle (a small round), at the end of the line (a page's head, away
// from its words), or high up at the start (a whole page, above the cards)
export function PaintedScene({
  tint,
  subject,
  width,
  height,
  mirrored,
  tall,
  place = 'center',
}: {
  tint: Tone;
  subject?: string;
  width: number;
  height: number;
  mirrored?: boolean;
  tall?: boolean;
  place?: 'center' | 'end' | 'top';
}) {
  const night = tint === 'indigo';
  const ink = night ? '#f6e7c1' : toneOf(tint, false).ink;
  const size = place === 'center' ? Math.min(width, height) * 0.52 : place === 'top' ? 64 : height * 0.42;
  const left = place === 'center' ? (width - size) / 2 : place === 'end' ? width * 0.72 - size / 2 : 26;
  const top = place === 'center' ? height * 0.36 - size / 2 : place === 'end' ? height * 0.42 - size / 2 : 92;
  // the end of the line, and the start: on the other side in Arabic
  const x = place === 'center' || !mirrored ? left : width - left - size;
  return (
    <View style={{ width, height }}>
      <AdhkarScene evening={night} sky={night ? undefined : SKIES[tint]} plain={!!subject} width={width} height={height} mirrored={mirrored} tall={tall} />
      {subject && (
        <View style={{ position: 'absolute', left: x, top, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          {/* its soft light */}
          <View
            style={{
              position: 'absolute',
              width: size * 1.25,
              height: size * 1.25,
              borderRadius: size,
              backgroundColor: night ? 'rgba(246, 231, 193, 0.12)' : 'rgba(255, 255, 255, 0.5)',
            }}
          />
          <Art name={subject} scene color={ink} size={size * 0.8} width={1.25} />
        </View>
      )}
    </View>
  );
}
