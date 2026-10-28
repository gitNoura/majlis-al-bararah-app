// Which narration the reader reads: warsh (default) or hafs. Saved on the phone.
//
// Changing it (the Quran's settings) restarts the app (as the website reloads), which then opens
// straight on the mushaf - not on the home screen - at the same place in the other narration: the
// page of the ayah the reader was at. Everything that follows the narration (the pages, the tajweed guide, the tafsir and
// translation of each ayah, the mutashabihat, search) comes from the new one.
import { reloadAppAsync } from 'expo';
import AYAH_MAP from '../../assets/data/ayah-map.json';
import BOXES_WARSH from '../../assets/data/ayah-boxes.json';
import BOXES_HAFS from '../../assets/data/ayah-boxes-hafs.json';

let saved = null;
try {
  saved = globalThis.localStorage.getItem('riwaya');
} catch {}

export const HAFS = saved === 'hafs';

// The ayah the reader is at ("2:48"), told by src/main.js.
let here = () => null;
export const trackPlace = (fn) => (here = fn);

// The page of an ayah in the other narration. Warsh and Hafs count some ayat differently:
// assets/data/ayah-map.json lists, for the surahs that differ, the Hafs ayat each Warsh ayah holds.
function pageIn(value, key) {
  const [s, a] = key.split(':').map(Number);
  const rows = AYAH_MAP[s];
  let target = a;
  if (rows && value === 'hafs') target = rows.find(([w]) => w === a)?.[1][0] ?? a;
  if (rows && value !== 'hafs') target = rows.find(([, h]) => h.includes(a))?.[0] ?? a;
  const pages = value === 'hafs' ? BOXES_HAFS : BOXES_WARSH;
  const page = Object.keys(pages).find((p) => pages[p].some((e) => e.s === s && e.a === target));
  return page ? Number(page) : null;
}

export async function setRiwaya(value) {
  const key = here();
  const page = key ? pageIn(value, key) : null;
  try {
    globalThis.localStorage.setItem('riwaya', value);
    globalThis.localStorage.setItem('stayInQuran', JSON.stringify(page ?? true));
  } catch {}
  await reloadAppAsync();
}

// After a change of narration: open on the mushaf, not on the home screen (once): the page to open
// (or true), else false.
export function stayInQuran() {
  try {
    const stay = globalThis.localStorage.getItem('stayInQuran');
    globalThis.localStorage.removeItem('stayInQuran');
    return stay ? JSON.parse(stay) : false;
  } catch {
    return false;
  }
}
