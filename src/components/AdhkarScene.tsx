// The surfaces of the morning and evening adhkar cards and pages: a geometric pattern (src/components/IslamicPattern.tsx)
// in the colour of the hour - the morning's warm cream with a gold sun in its medallion, the evening's deep blue with a
// crescent. `mirrored` puts the medallion on the other side for the Arabic layout; `tall` is a whole page.
import { View } from 'react-native';

import { dayLook, NIGHT, PatternScene } from '@/components/IslamicPattern';

const MORNING = dayLook('#faefd6', '#a8772a');
const EVENING = NIGHT;

// «Morning and evening» in one picture: the morning, and beyond a slanting line the evening
export function MorningEvening({ width, height, mirrored }: { width: number; height: number; mirrored?: boolean }) {
  return (
    <View style={{ width, height }}>
      <AdhkarScene width={width} height={height} mirrored={mirrored} />
      <View style={{ position: 'absolute', left: 0, top: 0 }}>
        <AdhkarScene evening slashed width={width} height={height} mirrored={mirrored} />
      </View>
    </View>
  );
}

// the colour of the ground at the very bottom, to fill under the picture
export const sceneGround = (evening?: boolean) => (evening ? EVENING.bottom : MORNING.bottom);

export function AdhkarScene({
  evening,
  width,
  height,
  mirrored,
  tall,
  slashed,
}: {
  evening?: boolean;
  width: number;
  height: number;
  mirrored?: boolean;
  tall?: boolean;
  slashed?: boolean;
  sky?: string[]; // (kept for the screens that still pass it)
  plain?: boolean;
}) {
  return (
    <PatternScene
      kind="star"
      look={evening ? EVENING : MORNING}
      width={width}
      height={height}
      mirrored={mirrored}
      tall={tall}
      slashed={slashed}
      place={tall || slashed ? 'none' : 'end'}
      symbol={evening ? 'moon' : 'sun'}
    />
  );
}
