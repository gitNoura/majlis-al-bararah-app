// The adhkar's drawings and colours: a category's icon or a chapter's little scene (thin lines, the
// website's), and the soft colour families they come in - gold, clay, indigo, teal, green, rose and
// slate - each a pale wash for the card and a deeper ink for its lines and words, by day and by night.
import { SvgXml } from 'react-native-svg';

import { FOLDER_ART, SCENE, SCENE_ART, TONES } from '@/lib/adhkar-art';

export type Tone = 'gold' | 'clay' | 'indigo' | 'teal' | 'green' | 'rose' | 'slate';

// [wash, ink] by day; [wash, ink] at night
const PALETTE: Record<Tone, { day: [string, string]; night: [string, string] }> = {
  gold: { day: ['#fbf0d9', '#a8772a'], night: ['rgba(214, 170, 92, 0.14)', '#e2c27f'] },
  clay: { day: ['#f9e7dc', '#a95f3b'], night: ['rgba(214, 138, 98, 0.14)', '#e7a988'] },
  indigo: { day: ['#e8eaf7', '#4b5797'], night: ['rgba(132, 146, 222, 0.15)', '#a9b4ec'] },
  teal: { day: ['#def1ee', '#2c7f78'], night: ['rgba(92, 186, 176, 0.14)', '#8fd3ca'] },
  green: { day: ['#e3efe6', '#2e6a4e'], night: ['rgba(110, 178, 138, 0.14)', '#9fd1b2'] },
  rose: { day: ['#f8e4e8', '#a94f66'], night: ['rgba(222, 128, 152, 0.14)', '#eba6b7'] },
  slate: { day: ['#eaedf0', '#56616c'], night: ['rgba(160, 172, 184, 0.13)', '#b9c3cc'] },
};

export function tone(t: Tone, dark: boolean) {
  const [wash, ink] = dark ? PALETTE[t].night : PALETTE[t].day;
  return { wash, ink };
}

// the categories' colours and icons (the website's folders)
const CATEGORY_TONE: Record<string, Tone> = {
  daily: 'gold', news: 'gold', sleep: 'indigo', travel: 'teal', hajj: 'gold', illness: 'rose', death: 'slate', weather: 'indigo', fasting: 'clay',
  worry: 'indigo', whisper: 'slate', fear: 'clay', family: 'rose', protect: 'green', people: 'teal', prayer: 'green', purif: 'teal', mosque: 'gold',
  home: 'clay', clothing: 'indigo', food: 'clay', manners: 'rose', dhikr: 'slate', other: 'slate',
};
const CATEGORY_ICON: Record<string, string> = { daily: 'waking', other: 'dhikr' };

export const categoryTone = (key: string): Tone => CATEGORY_TONE[key] ?? 'slate';
export const categoryIcon = (key: string) => CATEGORY_ICON[key] ?? key;

// each category's drawing (one of the chapters' scenes, more a picture than an icon)
const CATEGORY_SCENE: Record<string, string> = {
  daily: 'sunrise', sleep: 'bed', prayer: 'rug', purif: 'tap', mosque: 'minaret', home: 'houseIn', clothing: 'shirt', food: 'plate',
  manners: 'hand', dhikr: 'beads', travel: 'suitcase', hajj: 'kaaba', illness: 'heartPulse', death: 'cypress', weather: 'rain',
  fasting: 'lantern', worry: 'tear', whisper: 'whisper', fear: 'tower', family: 'cradle', protect: 'moonShield', people: 'people',
  news: 'sparkles', other: 'scroll',
};
export const categoryScene = (key: string) => CATEGORY_SCENE[key] ?? 'scroll';

const CHAPTER_TONE: Record<string, Tone> = {};
Object.entries(TONES).forEach(([t, ids]) => ids.forEach((id) => (CHAPTER_TONE[String(id)] = t as Tone)));
// a chapter's colour and scene (`key`: its id, or 27:am / 27:pm for the morning and the evening)
export const chapterTone = (key: string | number): Tone => CHAPTER_TONE[String(key)] ?? 'slate';
export const chapterScene = (key: string | number) => {
  const name = SCENE[String(key)];
  return name && name !== 'star8' && SCENE_ART[name] ? name : 'dua';
};

// a drawing: `icon` (a category) or `scene` (a chapter), in thin lines of the colour given
export function Art({ name, scene, color, size = 24, width = 1.4 }: { name: string; scene?: boolean; color: string; size?: number; width?: number }) {
  const inner = (scene ? SCENE_ART : FOLDER_ART)[name];
  if (!inner) return null;
  const xml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${inner.replace(/currentColor/g, color)}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}
