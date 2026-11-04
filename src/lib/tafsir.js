// The tafsir or translation of an ayah (the website's src/reader/ayahs.js, from the same files).
// Hafs mode: the files are made for the Warsh ayat; each Warsh ayah lists the Hafs ayat it holds in
// "hafs" (one, or two where Warsh counts them as one ayah), and a Hafs ayah can also be spread over
// two Warsh ayat.
import { fetchData } from './remote.js';
import { HAFS } from './riwaya.js';

async function warshHolders(s, a) {
  const list = await fetchData(`surah/${s}`);
  return list.filter((e) => e.hafs?.includes(a));
}

// one tafsir for a Warsh ayah: a file per surah (a list per ayah), or a file per ayah (Ibn Kathir)
function loadWarshTafsir(src, s, a) {
  if (src.perAyah) return fetchData(`tafsir/${src.id}/${s}/${a}`);
  return fetchData(`tafsir/${src.id}/${s}`).then((list) => list[a - 1]);
}

// The paragraphs of one source for ayah a of surah s (in the narration being read)
export async function loadTafsir(src, s, a) {
  if (!HAFS) return loadWarshTafsir(src, s, a);
  const holders = await warshHolders(s, a);
  if (!holders.length) return null;
  if (!src.perAyah) {
    const [first] = holders;
    const texts = await loadWarshTafsir(src, s, first.ayah);
    return [texts[first.hafs.indexOf(a)]];
  }
  const parts = await Promise.all(holders.map((e) => loadWarshTafsir(src, s, e.ayah)));
  return [...new Set(parts.flat())];
}

// Its text with the ayat it quotes (written ﴿...﴾) apart, to colour them: [{ text, quote }]
/** @type {(text: string) => { text: string, quote: boolean }[]} */
export const withQuotes = (text) =>
  text
    .split(/(﴿[^﴾]*﴾)/)
    .filter(Boolean)
    .map((part) => ({ text: part, quote: part.startsWith('﴿') }));
