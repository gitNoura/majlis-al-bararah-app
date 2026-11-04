// The books of ahadith (the website's «الأحاديث»): Sahih al-Bukhari, Sahih Muslim and an-Nawawi's
// Forty, in Arabic, with the English (sunnah.com) under it in English and French. The data comes from
// the website (/data/hadith/, built by its scripts/build_hadith.py; /data/hadith-en/): the list of
// books and every kitab opened once are kept on the phone, so they can be read offline; the search
// files (about 5 MB a book) only while the app is open.
//
// Also kept on the phone: the saved hadiths ('hadithSaved') and where the reader was
// ('hadithLast'), the same keys as the website.
import { useSyncExternalStore } from 'react';

import { isFrench, isEnglish, t } from '@/i18n/i18n';
import { KITABS_FR } from '@/i18n/ahadith-fr';
import { SITE } from '@/lib/remote';
import { readJSON, writeJSON } from '@/lib/storage';

export type BookId = 'bukhari' | 'muslim' | 'nawawi';
export const BOOKS: BookId[] = ['bukhari', 'muslim', 'nawawi'];

export type Kitab = { n: number; title: string; en?: string; count: number; first?: string; last?: string };
export type Book = { id: BookId; count: number; kitabs: Kitab[] };
// a bab's title, or a hadith: its number, sanad, matn, and «رواه…» after it
export type Item = { bab: string } | { bab?: undefined; n: string; s?: string; m: string; r?: string };
export type Hadith = Extract<Item, { m: string }>;
// a hadith's English: its paragraphs (the first «Narrated …:»), or the number it is given with
export type English = Record<string, string[] | string>;

const memory = new Map<string, Promise<unknown>>();

// a file of the website's /data/ - from the phone when kept there, else from the website (and kept)
function getData<T>(path: string, keep: boolean): Promise<T> {
  if (!memory.has(path)) {
    const kept = keep ? readJSON(`data:${path}`, null) : null;
    const request = kept
      ? Promise.resolve(kept)
      : fetch(`${SITE}/data/${path}.json`).then(async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          const data = await r.json();
          if (keep) writeJSON(`data:${path}`, data);
          return data;
        });
    request.catch(() => memory.delete(path));
    memory.set(path, request);
  }
  return memory.get(path) as Promise<T>;
}

export const loadBooks = () => getData<Book[]>('hadith/books', true);
export const loadKitab = (b: BookId, k: number) => getData<Item[]>(`hadith/${b}/${k}`, true);
// the English (none for a hadith: the Arabic alone)
export const loadEnglish = (b: BookId, k: number) => getData<English>(`hadith-en/${b}/${k}`, true).catch(() => ({}) as English);

// ---------- the language the hadiths are read in ----------

// Its own choice, apart from the app's language ('hadithLang'): the Arabic alone, the English alone (the
// Arabic where a hadith has no English), or both. Until chosen: the Arabic in the Arabic app, both in
// English and French (as the website).
export type ReadLang = 'ar' | 'en' | 'both';
let readLang: ReadLang = readJSON('hadithLang', null) ?? (isEnglish ? 'both' : 'ar');
const langListeners = new Set<() => void>();

export function useReadLang(): ReadLang {
  return useSyncExternalStore(
    (fn) => {
      langListeners.add(fn);
      return () => {
        langListeners.delete(fn);
      };
    },
    () => readLang,
  );
}

export function setReadLang(lang: ReadLang) {
  readLang = lang;
  writeJSON('hadithLang', lang);
  langListeners.forEach((fn) => fn());
}
const loadSearch = (b: BookId) => getData<[string, number, string][]>(`hadith/${b}/search`, false);

// ---------- names ----------

export const bookName = (b: BookId) => t(`ah_${b}`);

// a kitab's name in the language of the app (its English one in English, French in French), with the
// Arabic under it then
export function kitabName(b: BookId, k: Kitab) {
  if (!isEnglish || !k.en) return k.title;
  return (isFrench && (KITABS_FR as Record<string, Record<number, string>>)[b]?.[k.n]) || k.en;
}

// ---------- search ----------

// As the website's scripts/build_hadith.py plain(): no tashkeel, the forms of alif / ya / ta marbuta made one
export function plain(text: string) {
  return text
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

export type Found = { b: BookId; k: number; n: string; snippet: string };

// every word of the query, in any order, without tashkeel; at most 200
export async function searchHadiths(query: string): Promise<{ found: Found[]; many: boolean }> {
  const words = plain(query)
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return { found: [], many: false };
  const data = await Promise.all(BOOKS.map(loadSearch));
  const found: Found[] = [];
  BOOKS.forEach((b, i) => {
    for (const [n, k, text] of data[i]) {
      if (found.length >= 200) return;
      if (!words.every((w) => text.includes(w))) continue;
      const at = Math.max(0, text.indexOf(words[0]) - 50);
      found.push({ b, k, n, snippet: `${at ? '… ' : ''}${text.slice(at, at + 160)} …` });
    }
  });
  return { found, many: found.length >= 200 };
}

// ---------- saved hadiths, and where the reader was ----------

export type Saved = { b: BookId; k: number; n: string; m: string };

let saved: Saved[] = readJSON('hadithSaved', []);
const listeners = new Set<() => void>();

export function useSaved(): Saved[] {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => saved,
  );
}

// saves or removes; true when now saved
export function toggleSaved(b: BookId, k: number, n: string, matn = ''): boolean {
  const on = !saved.some((s) => s.b === b && s.n === n);
  saved = on ? [{ b, k, n, m: matn.slice(0, 140) }, ...saved] : saved.filter((s) => !(s.b === b && s.n === n));
  writeJSON('hadithSaved', saved);
  listeners.forEach((fn) => fn());
  return on;
}

export type Last = { b: BookId; k: number; n: string };
export const lastRead = (): Last | null => readJSON('hadithLast', null);
export const remember = (last: Last) => writeJSON('hadithLast', last);

// the text copied or shared: the hadith as it is read (Arabic, English or both), then where it is from
export function hadithText(b: BookId, h: Hadith, english: string[] | string | undefined, lang: ReadLang) {
  const where = h.n ? `${bookName(b)}، ${t('ahNumber', h.n)}` : bookName(b);
  const arabic = [h.s, h.m, h.r].filter(Boolean).join(' ');
  const en = Array.isArray(english) && lang !== 'ar' ? english.join('\n') : '';
  const text = lang === 'en' && en ? en : lang === 'both' && en ? `${arabic}\n\n${en}` : arabic;
  return `${text}\n[${where}]`;
}
