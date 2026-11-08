// «الورد»: the daily wird, read in the mushaf itself (the website's src/home/wird.js). Kept on the
// phone ('wird', the same shape as on the website):
//   { stop: { page, key } | null, days: { [day]: { ayat, letters } }, khatmas }
// (a saved wird may still carry the website's old `dayStart`: it is kept as it is and not used)
// `key` is the ayah where the reader stopped, saved under its Warsh number ("2:255") in both narrations.
// Holding an ayah marks the stop; the day's reading is counted from the pages turned. Marking the last ayah of
// an-Nas completes a khatma.
import { displayKeys, storedKeys } from '@/lib/ayahmap';
import { ayatOn, pageOf } from '@/lib/boxes';
import { fetchData } from '@/lib/remote';
import { dayKey, readJSON, writeJSON } from '@/lib/storage';

export type Stop = { page: number; key: string };
type State = {
  stop: Stop | null; // the exact pin (the ayah the reader marked)
  days: Record<string, { ayat: number; letters: number }>;
  khatmas: number;
  pages?: Record<string, number[]>; // the pages already counted today (turning back must not count twice)
};

const KEY = 'wird';
const LAST_AYAH = '114:6'; // an-Nas has 6 ayat in Warsh

const fresh = (): State => ({ stop: null, days: {}, khatmas: 0 });
export const loadWird = (): State => ({ ...fresh(), ...(readJSON(KEY, null) ?? {}) });
const save = (s: State) => writeJSON(KEY, s);

const parse = (k: string) => k.split(':').map(Number);

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
