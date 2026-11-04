// What the app takes from the website (majlis-albararah.pages.dev): the mushaf's pages and the big
// data (tafsir, the text of the surahs). Too big to go inside the app's download (the pages of the two
// narrations are about 370 MB); each is fetched the first time it is needed and kept on the phone
// (the pages by expo-image's disk cache, the data here in memory for now).
import { HAFS } from './riwaya.js';

export const SITE = 'https://majlis-albararah.pages.dev';

const pad = (n) => String(n).padStart(3, '0');

// A page's picture (1400 × 2000), in the narration being read
export const pageUrl = (page) => `${SITE}/${HAFS ? 'pages-hafs' : 'pages'}/${pad(page)}.webp`;
export const PAGE_RATIO = 1400 / 2000; // width / height

const cache = new Map();
// A JSON file of the website's /data/ (once per file; tried again if it failed)
export function fetchData(path) {
  if (!cache.has(path)) {
    const request = fetch(`${SITE}/data/${path}.json`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
    request.catch(() => cache.delete(path));
    cache.set(path, request);
  }
  return cache.get(path);
}
