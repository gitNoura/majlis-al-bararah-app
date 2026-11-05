// The adhkar (Hisn al-Muslim, the website's «الأذكار»): its chapters in categories, each dhikr with how
// many times it is said and its English. The data comes from the website (/data/adhkar/: index.json and
// one file a chapter, made by its scripts/download_adhkar.py) and is kept on the phone once opened.
//
// Kept on the phone too: the liked adhkar ('adhkarLiked') and the groups ('adhkarGroups') - the
// morning and the evening ones, filled from Hisn al-Muslim at first and changed freely after, and the
// member's own. A dhikr is known by its chapter and its id: { c, id }.
import { useSyncExternalStore } from 'react';

import { CHAPTERS_FR, WORDS_FR } from '@/i18n/adhkar-fr';
import { isEnglish, isFrench, L } from '@/i18n/i18n';
import { EVENING_ONLY, MORNING_ONLY } from '@/lib/adhkar-evening';
import { SITE } from '@/lib/remote';
import { readJSON, writeJSON } from '@/lib/storage';

export type Chapter = { id: number; title: string; count: number; en?: string };
// `audio`: its recording's name (src/lib/adhkarAudio.ts)
export type Dhikr = { id: number; text: string; repeat: number; en?: string; enNote?: string; audio?: string };
export type Ref = { c: number; id: number };

// ---------- loading ----------

const memory = new Map<string, Promise<unknown>>();
function getData<T>(path: string): Promise<T> {
  if (!memory.has(path)) {
    const kept = readJSON(`data:${path}`, null);
    const request = kept
      ? Promise.resolve(kept)
      : fetch(`${SITE}/data/${path}.json`).then(async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          const data = await r.json();
          writeJSON(`data:${path}`, data);
          return data;
        });
    request.catch(() => memory.delete(path));
    memory.set(path, request);
  }
  return memory.get(path) as Promise<T>;
}

export const loadIndex = () => getData<Chapter[]>('adhkar/index');
export const loadChapter = (c: number) => getData<Dhikr[]>(`adhkar/${c}`);

// the adhkar of a list of refs, in its order (those that cannot be found are left out)
export async function loadRefs(refs: Ref[]): Promise<(Dhikr & Ref)[]> {
  const chapters = [...new Set(refs.map((r) => r.c))];
  const files = new Map(await Promise.all(chapters.map(async (c) => [c, await loadChapter(c)] as const)));
  return refs.flatMap((r) => {
    const d = files.get(r.c)?.find((x) => x.id === r.id);
    return d ? [{ ...d, c: r.c }] : [];
  });
}

// ---------- names ----------

const WORDS = WORDS_FR as Record<string, string>;
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function chapterTitle(c: Chapter) {
  if (!isEnglish) return c.title;
  return (isFrench && ((CHAPTERS_FR as Record<number, string>)[c.id] || WORDS[c.en ?? ''])) || capital(c.en || c.title);
}

// The categories (the website's folders): their chapters by id
type Category = { key: string; ar: string; en: string; ids: number[] };
const CATEGORIES: Category[] = [
  { key: 'daily', ar: 'الصباح والمساء', en: 'Morning and evening', ids: [27] },
  { key: 'sleep', ar: 'النوم', en: 'Sleep', ids: [28, 1, 29] },
  { key: 'prayer', ar: 'الصلاة', en: 'Prayer', ids: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 32, 33] },
  { key: 'purif', ar: 'الطهارة', en: 'Purification', ids: [6, 7, 8, 9] },
  { key: 'mosque', ar: 'المسجد', en: 'Mosque', ids: [12, 13, 14] },
  { key: 'home', ar: 'المنزل', en: 'Home', ids: [10, 11] },
  { key: 'clothing', ar: 'اللباس', en: 'Clothing', ids: [2, 3, 4, 5] },
  { key: 'food', ar: 'الطعام', en: 'Food', ids: [69, 70, 71, 72, 76] },
  { key: 'manners', ar: 'السلام والآداب', en: 'Greetings and manners', ids: [108, 77, 84, 85, 87] },
  { key: 'dhikr', ar: 'الذكر والاستغفار', en: 'Remembrance', ids: [129, 130, 131, 107, 132] },
  { key: 'travel', ar: 'السفر', en: 'Travel', ids: [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105] },
  { key: 'hajj', ar: 'الحج والعمرة والأضحية', en: 'Hajj, Umrah and sacrifice', ids: [115, 116, 117, 118, 119, 120, 121, 127] },
  { key: 'illness', ar: 'المرض', en: 'Illness', ids: [49, 50, 51, 124] },
  { key: 'death', ar: 'الموت والعزاء', en: 'Death and condolences', ids: [52, 53, 54, 55, 56, 57, 58, 59, 60] },
  { key: 'weather', ar: 'الطقس والهلال', en: 'Weather and the moon', ids: [61, 62, 63, 64, 65, 66, 67] },
  { key: 'fasting', ar: 'الصيام', en: 'Fasting', ids: [68, 73, 74, 75] },
  { key: 'worry', ar: 'الهم والكرب', en: 'Worry and distress', ids: [34, 35, 41, 43, 46, 82] },
  { key: 'whisper', ar: 'الوسوسة والذنوب', en: 'Whispers and sins', ids: [40, 42, 44, 45] },
  { key: 'fear', ar: 'الخوف والأعداء', en: 'Fear and enemies', ids: [36, 37, 38, 39] },
  { key: 'family', ar: 'الأسرة', en: 'Family', ids: [47, 48, 79, 80, 81] },
  { key: 'protect', ar: 'الحماية والتحصين', en: 'Protection', ids: [30, 31, 88, 92, 94, 110, 111, 125, 126, 128] },
  { key: 'people', ar: 'مع الناس', en: 'With people', ids: [78, 83, 86, 89, 90, 91, 93, 109, 112, 113, 114] },
  { key: 'news', ar: 'الأخبار والفرح', en: 'News and joy', ids: [106, 122, 123] },
];

// the category a chapter is in (its painting)
export const categoryOf = (chapter: number) => CATEGORIES.find((g) => g.ids.includes(chapter))?.key ?? 'other';

export type CategoryView = { key: string; name: string; chapters: Chapter[] };

// the categories with their chapters (and «Other» for the chapters in none)
export function categories(index: Chapter[]): CategoryView[] {
  const byId = new Map(index.map((c) => [c.id, c]));
  const placed = new Set(CATEGORIES.flatMap((g) => g.ids));
  const list = CATEGORIES.map((g) => ({
    key: g.key,
    name: L(g.ar, g.en, WORDS[g.en] ?? g.en),
    chapters: g.ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])),
  }));
  const rest = index.filter((c) => !placed.has(c.id));
  if (rest.length) list.push({ key: 'other', name: L('أخرى', 'Other', 'Autres'), chapters: rest });
  return list.filter((g) => g.chapters.length);
}

// ---------- a dhikr's text ----------

const LETTERS = /[ء-ي]/;
const plainAr = (s: string) =>
  s
    .replace(/[ـً-ٰٟۖ-ۭ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي');

// the Arabic to read; the morning / evening variants ([وإذا أمسى قال: …]) apart, as notes
export function arabicParts(d: Dhikr): { main: string; notes: string[] } {
  const notes: string[] = [];
  const main = d.text
    .replace(/ـ/g, '')
    .replace(/\(\(|\)\)/g, '')
    .replace(/\s*\*\s*/g, ' ۝ ')
    .replace(/\[([^\]]+)\]/g, (all, inner: string) => {
      if (/(اذا).*(امسي|اصبح|مساء|صباح)/.test(plainAr(inner))) {
        notes.push(inner.trim());
        return '';
      }
      return all;
    })
    .replace(/\s+/g, ' ')
    .trim();
  return { main, notes: notes.filter((n) => LETTERS.test(n)) };
}

// how many times: the data's number, or the one the Arabic says («ثلاث مرات»...) when the data says 1
export function repeatOf(d: Dhikr): number {
  if (d.repeat > 1) return d.repeat;
  const m = plainAr(d.text).match(/(?:^|[\s(])(ثلاثا?|اربعا?|سبعا?|عشر|مائة)\s*مر/);
  const n = m ? { ثلاث: 3, ثلاثا: 3, اربع: 4, اربعا: 4, سبع: 7, سبعا: 7, عشر: 10, مائة: 100 }[m[1]] : 0;
  return n || 1;
}

// the English translation, plain: no quote marks round it, «[In the evening:]» on a line of its own;
// `morning`: only the morning's (what is said «in the evening» and the notes about it left out)
export function englishOf(d: Dhikr, morning?: boolean): string {
  if (!d.en) return '';
  const en = morning ? d.en.replace(/\s*[[(](?:In the evening|For the evening|Note: for the evening)[\s\S]*$/i, '') : d.en;
  return en
    .replace(/[‘’]/g, '')
    // the surahs' names on a line of their own («Soorah al-Ikhlaas (112)»), no verse numbers «( 1 )»
    .replace(/\[\s*Soorah ([^\]]+?)\s*\]/gi, '\n$1\n')
    .replace(/\(\s*\d+\s*\)\s*/g, '')
    .replace(/\)\s*\[([^\]]+)\]\s*\(/g, ')\n$1 (')
    .replace(/\n\s*\n+/g, '\n')
    .replace(/^\s*\(|\)\s*$/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// ---------- liked adhkar and groups ----------

export type Group = { id: string; kind: 'morning' | 'evening' | 'own'; name?: string; items: Ref[] };

const CH_DAILY = 27; // «أذكار الصباح والمساء»
const morningDefault = (ids: number[]): Ref[] => ids.filter((id) => !EVENING_ONLY.includes(id)).map((id) => ({ c: CH_DAILY, id }));
const eveningDefault = (ids: number[]): Ref[] => ids.filter((id) => !MORNING_ONLY.includes(id)).map((id) => ({ c: CH_DAILY, id }));

type State = { liked: Ref[]; groups: Group[] };
let state: State = {
  liked: readJSON('adhkarLiked', []),
  groups: readJSON('adhkarGroups', null) ?? [
    { id: 'morning', kind: 'morning', items: [] },
    { id: 'evening', kind: 'evening', items: [] },
  ],
};
const listeners = new Set<() => void>();
function set(next: Partial<State>) {
  state = { ...state, ...next };
  writeJSON('adhkarLiked', state.liked);
  writeJSON('adhkarGroups', state.groups);
  listeners.forEach((fn) => fn());
}

export function useAdhkarStore(): State {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
}

// the morning and evening groups, filled from Hisn al-Muslim the first time (once the chapter is here)
export async function fillDailyGroups() {
  // (the evening adhkar filled before: without the morning-only ones, once)
  if (!readJSON('adhkarEveningFix1', false)) {
    writeJSON('adhkarEveningFix1', true);
    set({ groups: state.groups.map((g) => (g.kind !== 'evening' ? g : { ...g, items: g.items.filter((r) => !(r.c === CH_DAILY && MORNING_ONLY.includes(r.id))) })) });
  }
  if (readJSON('adhkarDailyFilled', false)) return;
  const ids = (await loadChapter(CH_DAILY)).map((d) => d.id);
  set({
    groups: state.groups.map((g) =>
      g.kind === 'morning' && !g.items.length ? { ...g, items: morningDefault(ids) } : g.kind === 'evening' && !g.items.length ? { ...g, items: eveningDefault(ids) } : g,
    ),
  });
  writeJSON('adhkarDailyFilled', true);
}

// back to Hisn al-Muslim's morning or evening adhkar
export async function resetGroup(id: string) {
  const ids = (await loadChapter(CH_DAILY)).map((d) => d.id);
  set({ groups: state.groups.map((g) => (g.id !== id ? g : { ...g, items: g.kind === 'morning' ? morningDefault(ids) : eveningDefault(ids) })) });
}

const same = (a: Ref, b: Ref) => a.c === b.c && a.id === b.id;
export const isLiked = (liked: Ref[], r: Ref) => liked.some((x) => same(x, r));
export const inGroup = (g: Group, r: Ref) => g.items.some((x) => same(x, r));

export function toggleLiked(r: Ref): boolean {
  const on = !isLiked(state.liked, r);
  set({ liked: on ? [...state.liked, r] : state.liked.filter((x) => !same(x, r)) });
  return on;
}

export function toggleInGroup(groupId: string, r: Ref): boolean {
  const g = state.groups.find((x) => x.id === groupId);
  if (!g) return false;
  const on = !inGroup(g, r);
  set({ groups: state.groups.map((x) => (x.id !== groupId ? x : { ...x, items: on ? [...x.items, r] : x.items.filter((y) => !same(y, r)) })) });
  return on;
}

export function removeFromGroup(groupId: string, r: Ref) {
  if (groupId === 'liked') return toggleLiked(r);
  set({ groups: state.groups.map((x) => (x.id !== groupId ? x : { ...x, items: x.items.filter((y) => !same(y, r)) })) });
}

export function createGroup(name: string, first?: Ref): string {
  const id = `g${Date.now().toString(36)}`;
  set({ groups: [...state.groups, { id, kind: 'own', name: name.trim(), items: first ? [first] : [] }] });
  return id;
}

export function renameGroup(id: string, name: string) {
  set({ groups: state.groups.map((g) => (g.id === id ? { ...g, name: name.trim() } : g)) });
}

export function deleteGroup(id: string) {
  set({ groups: state.groups.filter((g) => g.id !== id) });
}

export const groupName = (g: Group) =>
  g.kind === 'morning' ? L('أذكار الصباح', 'Morning adhkar', 'Adhkar du matin') : g.kind === 'evening' ? L('أذكار المساء', 'Evening adhkar', 'Adhkar du soir') : (g.name ?? '');
