// The lists behind the Quran's Find sheet (and the older index panel): surahs, ahzab, ajza, each as rows with the page
// they open, and the name filter. Search ignores hamza forms, tashkeel and the "ال" prefix, so "انعام" finds
// "الأنعام"; English names without accents, marks or case, so "fatiha" finds "Al-Fatihah" (as on the website).
import { isEnglish, surahName, surahType, t } from '@/i18n/i18n';
import { AHZAB, AJZA, hizbForPage, juzForPage, surahForPage, SURAHS } from '@/lib/quran';
import { HAFS } from '@/lib/riwaya';

export type Tab = 'surahs' | 'ahzab' | 'ajza';
export type Item = { number: number; title: string; other: string; sub: string; page: number; type?: string };

export const normalize = (text: string) =>
  text
    .replace(/[ً-ْٰ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/(^|\s)ال/g, '$1')
    .trim();

export const latin = (text: string) =>
  text
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

export function items(tab: Tab): Item[] {
  if (tab === 'surahs')
    return SURAHS.map((s: any) =>
      isEnglish
        ? { number: s.number, title: s.latin, other: s.name, sub: '', page: s.page, type: surahType(s) }
        : { number: s.number, title: `سورة ${s.name}`, other: s.english, sub: '', page: s.page, type: s.type },
    );
  if (tab === 'ahzab')
    return AHZAB.map((h: any) => ({
      number: h.number,
      title: t('hizb', h.number),
      other: '',
      sub: HAFS
        ? ''
        : h.ayah === 1
          ? t('hizbStartsSurah', surahName(SURAHS[h.surah - 1]))
          : t('hizbStartsAyah', surahName(SURAHS[h.surah - 1]), h.ayah),
      page: h.page,
    }));
  return AJZA.map((j: any) => ({ number: j.number, title: t('juz', j.number), other: '', sub: '', page: j.page }));
}

// the rows of a tab that match what was typed (everything when nothing was)
export function filterItems(tab: Tab, query: string): Item[] {
  const q = normalize(query);
  const lq = latin(query);
  return items(tab).filter(
    (it) =>
      !q ||
      normalize(it.title).includes(q) ||
      normalize(it.other).includes(q) ||
      String(it.number) === q ||
      (lq && (latin(it.title).includes(lq) || latin(it.other).includes(lq))),
  );
}

// the number of the surah / hizb / juz a page is in
export const current = (tab: Tab, page: number): number =>
  (tab === 'surahs' ? surahForPage(page) : tab === 'ahzab' ? hizbForPage(page) : juzForPage(page)).number;
