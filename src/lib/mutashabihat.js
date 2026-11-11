// المتشابهات: the ayat that repeat or resemble the chosen ayah (the website's src/reader/mutashabihat.js, same data).
//
// Data: assets/data/mutashabihat.json, or mutashabihat-hafs.json for the Hafs text and its ayah numbers (made by the
// website's scripts/find_mutashabihat.py [--hafs]). For each ayah "s:a":
//   repeats  the same ayah in other surahs          inSurah  how often it occurs in its own surah
//   same     similar ayat in the same surah          other    similar ayat in other surahs
// A similar ayah comes with where the two agree (start / end / middle) and the indices of its words that differ,
// which are highlighted. The ayat's text is the search text (src/lib/search.js).
import MUTASHABIHAT_HAFS from '../../assets/data/mutashabihat-hafs.json';
import MUTASHABIHAT_WARSH from '../../assets/data/mutashabihat.json';
import { HAFS } from './riwaya.js';
import { forDisplay, loadSearch } from './search.js';

const DATA = HAFS ? MUTASHABIHAT_HAFS : MUTASHABIHAT_WARSH;

let texts = null; // "s:a" -> the voweled text
let loading = null;

// the text of every ayah (the search file, fetched once; tried again next time if it failed)
export function loadTexts() {
  loading ??= loadSearch().then((entries) => {
    texts = new Map(entries.map((e) => [`${e.s}:${e.a}`, HAFS ? e.shown : e.text]));
  });
  loading.catch(() => (loading = null));
  return loading;
}

/** @type {(s: number, a: number) => { repeats?: string[], inSurah?: number, same?: { k: string, at: string, d: number[] }[], other?: { k: string, at: string, d: number[] }[] } | null} */
export const similarOf = (s, a) => DATA[`${s}:${a}`] ?? null;

// How many related ayat (the tab's count)
export function countSimilar(s, a) {
  const e = similarOf(s, a);
  return e ? (e.repeats?.length ?? 0) + (e.same?.length ?? 0) + (e.other?.length ?? 0) : 0;
}

// The ayah's words, the differing ones marked; the ayah number at the end is left out: [{ text, mark }]
/** @type {(key: string, differing?: number[]) => { text: string, mark: boolean }[]} */
export function wordsOf(key, differing = []) {
  const marked = new Set(differing);
  const text = texts?.get(key);
  if (!text) return [];
  return forDisplay(text)
    .split(/\s+/)
    .filter((word) => word && !/^[٠-٩]+$/.test(word))
    .map((word, i) => ({ text: word, mark: marked.has(i) }));
}

export const parseKey = (k) => {
  const [s, a] = k.split(':').map(Number);
  return { s, a };
};
