// A pattern for each category of adhkar, in its colour family: the same fine geometric lattice as the morning and evening
// cards (src/components/IslamicPattern.tsx), a medallion with the category's own line icon in its middle - a small
// tile (the Adhkar page), a page's head (the medallion at the end of the line, the words at the start), or a whole page
// behind the cards (`tall`: the lattice alone, fading towards the bottom). The night ones (sleep, fasting...) are deep blue.
import { categoryScene, categoryTone, tone } from '@/components/AdhkarArt';
import { dayLook, NIGHT, PatternScene } from '@/components/IslamicPattern';
import type { PatternKind } from '@/lib/pattern';

// one lattice for each, so the tiles side by side are not all the same
const KIND: Record<string, PatternKind> = {
  daily: 'star', news: 'hex', sleep: 'circles', travel: 'hex', hajj: 'star', illness: 'circles', death: 'hex', weather: 'circles', fasting: 'hex',
  worry: 'circles', whisper: 'hex', fear: 'star', family: 'circles', protect: 'star', people: 'hex', prayer: 'star', purif: 'circles', mosque: 'star',
  home: 'hex', clothing: 'circles', food: 'hex', manners: 'circles', dhikr: 'star', misbaha: 'star', other: 'hex',
};

export const hasPainting = (key: string) => key in KIND;

// whether the painting is a night one (its words drawn light over it)
const NIGHT_SET = new Set(['sleep', 'fasting', 'fear', 'protect', 'whisper']);
export const isNightPainting = (key: string) => NIGHT_SET.has(key);

// `tall`: a whole page; `ground`: a wide frame (a page's head); otherwise a small tile with the medallion in its middle
export function CategoryPainting({ name, width, height, mirrored, tall, ground }: { name: string; width: number; height: number; mirrored?: boolean; tall?: boolean; ground?: boolean; focus?: boolean }) {
  const night = isNightPainting(name);
  const t = tone(categoryTone(name), false);
  return (
    <PatternScene
      kind={KIND[name] ?? 'hex'}
      look={night ? NIGHT : dayLook(t.wash, t.ink)}
      width={width}
      height={height}
      mirrored={mirrored}
      tall={tall}
      place={tall ? 'none' : ground ? 'end' : 'center'}
      icon={name === 'misbaha' ? 'beads' : categoryScene(name)}
      fade={tall ? 'bottom' : undefined}
    />
  );
}
