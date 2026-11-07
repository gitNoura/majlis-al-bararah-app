// «الورد»: the daily wird, read in the mushaf itself (the website's src/home/wird.js). Kept on the
// phone ('wird', the same shape as on the website):
//   { stop: { page, key } | null, dayStart: { [day]: { page, key } | null }, days: { [day]: { ayat, letters } }, khatmas }
// `key` is the ayah where the reader stopped, saved under its Warsh number ("2:255") in both narrations.
// Holding an ayah while reading the wird marks the stop; the day's reading runs from where the reader
// was when the day began. Reaching the last ayah of an-Nas completes a khatma.
import { L, surahName, t } from '@/i18n/i18n';
import { displayKeys, storedKeys } from '@/lib/ayahmap';
import { ayatOn, pageOf } from '@/lib/boxes';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { fetchData } from '@/lib/remote';
import { dayKey, readJSON, writeJSON } from '@/lib/storage';

export type Stop = { page: number; key: string };
type State = {
  stop: Stop | null; // the exact pin (the ayah the reader marked)
  dayStart: Record<string, Stop | null>; // legacy: used by markStop (the old reader) only
  days: Record<string, { ayat: number; letters: number }>;
  khatmas: number;
  pages?: Record<string, number[]>; // the pages already counted today (turning back must not count twice)
};

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


// tomorrow begins with the next ayah (or the next surah), numbered as in the narration read
async function nextAfter(key: string) {
  const [s, a] = parse(key);
  let count = 0;
  try {
    count = (await surahAyat(s)).length;
  } catch {}
  const nextSurah = count && a < count ? s : (s % 114) + 1;
  const nextAyah = count && a < count ? a + 1 : 1;
  const shown = displayKeys(`${nextSurah}:${nextAyah}`)[0];
  return t('wirdNextStep', surahName(SURAHS[nextSurah - 1]), (shown ? parse(shown)[1] : nextAyah).toLocaleString(L('ar', 'en', 'fr')));
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

  const next = await nextAfter(key);
  return { khatma, khatmas: state.khatmas, progress: khatma ? 100 : (page / TOTAL_PAGES) * 100, next };
}

// ---------- the Quran tab: ONE position marker ('lastPage', src/lib/position.ts) plus an exact pin ----------
// The marker follows every page turn. The pin is an ayah the reader marked («Mark here»); it stays where it was put
// until it is moved. The day's reading is counted from the pages turned (below), not from the pin.

// «Mark here»: the pin goes on this ayah (`tapped`: as numbered in the narration read). Marking the last ayah of an-Nas
// completes a khatma. False when the ayah has no Warsh key (the Basmala of al-Fatiha in Hafs).
export function setPin(tapped: string, page: number): boolean {
  const key = storedKeys(tapped).at(-1); // saved under the Warsh key
  if (!key) return false;
  const state = loadWird();
  if (key === LAST_AYAH && state.stop?.key !== LAST_AYAH) state.khatmas = (state.khatmas || 0) + 1;
  state.stop = { page, key };
  save(state);
  return true;
}

export function clearPin() {
  const state = loadWird();
  state.stop = null;
  save(state);
}

// the ayat that begin on a page (Warsh keys), grouped by surah
function startingOn(page: number) {
  const bySurah = new Map<number, Set<number>>();
  for (const e of ayatOn(page) as { s: number; a: number }[]) {
    if (pageOf(e.s, e.a) !== page) continue; // an ayah that runs over from the page before was counted there
    for (const k of storedKeys(`${e.s}:${e.a}`)) {
      const [s, a] = parse(k);
      bySurah.set(s, (bySurah.get(s) ?? new Set()).add(a));
    }
  }
  return bySurah;
}

let counting: Promise<void> = Promise.resolve(); // one count at a time: two quick turns must not overwrite each other

// A page was read: the reader turned from it to the next one. Counted once a day per page. A jump (the Find sheet)
// never calls this, so skipping ahead does not count as reading.
export function countPage(page: number): Promise<void> {
  counting = counting.then(async () => {
    const day = dayKey();
    const state = loadWird();
    state.pages = { [day]: state.pages?.[day] ?? [] }; // only today's list is kept
    if (state.pages[day].includes(page)) return;
    let ayat = 0;
    let letters = 0;
    try {
      for (const [s, wanted] of startingOn(page)) {
        for (const x of await surahAyat(s)) {
          if (!wanted.has(x.ayah)) continue;
          ayat++;
          letters += letterCount(x.text);
        }
      }
    } catch {
      return; // offline: nothing is counted, and the page may be counted when it is turned again
    }
    // the data may have changed while the surahs loaded
    const fresh = loadWird();
    const done = fresh.pages?.[day] ?? [];
    if (done.includes(page)) return;
    const was = fresh.days[day] ?? { ayat: 0, letters: 0 };
    fresh.days[day] = { ayat: was.ayat + ayat, letters: was.letters + letters };
    fresh.pages = { [day]: [...done, page] };
    save(fresh);
  });
  return counting;
}
