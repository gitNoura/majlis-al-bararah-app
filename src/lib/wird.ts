// «الورد»: the daily wird, read in the mushaf itself (the website's src/home/wird.js). Kept on the
// phone ('wird', the same shape as on the website):
//   { stop: { page, key } | null, dayStart: { [day]: { page, key } | null }, days: { [day]: { ayat, letters } }, khatmas }
// `key` is the ayah where the reader stopped, saved under its Warsh number ("2:255") in both narrations.
// Holding an ayah while reading the wird marks the stop; the day's reading runs from where the reader
// was when the day began. Reaching the last ayah of an-Nas completes a khatma.
import { L, surahName, t } from '@/i18n/i18n';
import { displayKeys, storedKeys } from '@/lib/ayahmap';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { fetchData } from '@/lib/remote';
import { dayKey, readJSON, writeJSON } from '@/lib/storage';

export type Stop = { page: number; key: string };
type State = { stop: Stop | null; dayStart: Record<string, Stop | null>; days: Record<string, { ayat: number; letters: number }>; khatmas: number };

const KEY = 'wird';
const LAST_AYAH = '114:6'; // an-Nas has 6 ayat in Warsh

const fresh = (): State => ({ stop: null, dayStart: {}, days: {}, khatmas: 0 });
export const loadWird = (): State => ({ ...fresh(), ...(readJSON(KEY, null) ?? {}) });
const save = (s: State) => writeJSON(KEY, s);

const parse = (k: string) => k.split(':').map(Number);
const before = (a: string, b: string) => {
  const [sa, aa] = parse(a);
  const [sb, ab] = parse(b);
  return sa < sb || (sa === sb && aa < ab);
};

// the ayah where the reader stopped, numbered as in the narration read ("2:255"), and its page
export function wirdStop(): { page: number; shown: string } | null {
  const stop = loadWird().stop;
  if (!stop) return null;
  const shown = displayKeys(stop.key).at(-1) ?? stop.key;
  return { page: stop.page, shown };
}

// ---------- counting what was read (kept for the calendar; never shown as a count of deeds) ----------

type Ayah = { ayah: number; text: string };
const letterCount = (text: string) => (text.match(/[ء-يٱ]/g) || []).length;
const surahAyat = (s: number) => fetchData(`surah/${s}`) as Promise<Ayah[]>;

// the ayat after `from` up to and including `to` (both "surah:ayah"), and their letters
async function readBetween(from: string | null, to: string) {
  const [fs, fa] = from ? parse(from) : [1, 0];
  const [ts, ta] = parse(to);
  let ayat = 0;
  let letters = 0;
  for (let s = fs; s <= ts; s++) {
    for (const x of await surahAyat(s)) {
      if ((s === fs && x.ayah <= fa) || (s === ts && x.ayah > ta)) continue;
      ayat++;
      letters += letterCount(x.text);
    }
  }
  return { ayat, letters };
}

export type Done = { khatma: boolean; khatmas: number; progress: number; next: string };

// Holding an ayah (`tapped`: as numbered in the narration read; `firstOnPage`: the page's first ayah, the
// same way) marks where the reader stopped. Returns what the closing card shows.
export async function markStop(tapped: string, page: number, firstOnPage: string | null): Promise<Done | null> {
  const key = storedKeys(tapped).at(-1); // saved under the Warsh key
  if (!key) return null; // the Basmala of al-Fatiha in Hafs has no Warsh ayah
  const state = loadWird();
  const day = dayKey();
  // today's reading starts where the reader was when the day began (the last stop before today)
  if (!(day in state.dayStart)) state.dayStart[day] = state.stop;
  const from = state.dayStart[day];
  let read = { ayat: 0, letters: 0 };
  try {
    if (!from) {
      // a first mark: from the top of the page it is on
      const first = firstOnPage && storedKeys(firstOnPage)[0];
      if (first) {
        const [s, a] = parse(first);
        read = await readBetween(`${s}:${a - 1}`, key);
      }
    } else if (before(from.key, key)) {
      read = await readBetween(from.key, key);
    } else if (from.page > TOTAL_PAGES - 20 && page < 20) {
      // past an-Nas and on again from the beginning (a khatma, if it was not marked at an-Nas)
      const end = await readBetween(from.key, LAST_AYAH);
      const start = await readBetween(null, key);
      read = { ayat: end.ayat + start.ayat, letters: end.letters + start.letters };
      if (from.key !== LAST_AYAH) state.khatmas = (state.khatmas || 0) + 1;
    }
  } catch {
    // offline: the stop is still kept, only the day's count is missing
  }
  // the last ayah of an-Nas: the khatma is complete
  const khatma = key === LAST_AYAH && state.stop?.key !== LAST_AYAH;
  if (khatma) state.khatmas = (state.khatmas || 0) + 1;
  state.stop = { page, key };
  if (read.ayat) state.days[day] = read;
  save(state);

  // tomorrow begins with the next ayah (or the next surah), numbered as in this narration
  const [s, a] = parse(key);
  let count = 0;
  try {
    count = (await surahAyat(s)).length;
  } catch {}
  const nextSurah = count && a < count ? s : (s % 114) + 1;
  const nextAyah = count && a < count ? a + 1 : 1;
  const shown = displayKeys(`${nextSurah}:${nextAyah}`)[0];
  const next = t('wirdNextStep', surahName(SURAHS[nextSurah - 1]), (shown ? parse(shown)[1] : nextAyah).toLocaleString(L('ar', 'en', 'fr')));
  return { khatma, khatmas: state.khatmas, progress: khatma ? 100 : (page / TOTAL_PAGES) * 100, next };
}
