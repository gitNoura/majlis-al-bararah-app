// A chapter's or a group's head: a geometric pattern in the colour family of its page (src/components/IslamicPattern.tsx), with
// its subject's line icon in a medallion at the end of the line (away from the page's words), or in the middle.
import { tone as toneOf, type Tone } from '@/components/AdhkarArt';
import { dayLook, NIGHT, PatternScene } from '@/components/IslamicPattern';

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
  const t = toneOf(tint, false);
  return (
    <PatternScene
      kind={night ? 'circles' : 'star'}
      look={night ? NIGHT : dayLook(t.wash, t.ink)}
      width={width}
      height={height}
      mirrored={mirrored}
      tall={tall}
      place={subject ? (place === 'center' ? 'center' : 'end') : 'none'}
      icon={subject}
    />
  );
}
