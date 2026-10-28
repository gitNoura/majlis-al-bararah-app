// Highlights and comments are saved under Warsh ayah keys ("2:255") for both narrations, so a
// reader who uses both sees the same ones. In Hafs mode keys are converted on the way in and out.
import { HAFS } from './riwaya.js';
import AYAH_MAP from '../../assets/data/ayah-map.json';

const map = AYAH_MAP; // { surah: [[warshAyah, [hafsAyat]], ...] }, only surahs where the numbering differs

const split = (k) => k.split(':').map(Number);

// A saved (Warsh) key -> the ayat that show it in the current narration.
export function displayKeys(k) {
  if (!HAFS) return [k];
  const [s, a] = split(k);
  const rows = map[s];
  if (!rows) return [k];
  const row = rows.find(([w]) => w === a);
  return row ? row[1].map((h) => `${s}:${h}`) : [];
}

// A key tapped in the current narration -> the saved (Warsh) keys that hold it.
// Empty for the Basmala of al-Fatiha in Hafs (1:1), which has no Warsh ayah.
export function storedKeys(k) {
  if (!HAFS) return [k];
  const [s, a] = split(k);
  const rows = map[s];
  if (!rows) return [k];
  return rows.filter(([, hs]) => hs.includes(a)).map(([w]) => `${s}:${w}`);
}