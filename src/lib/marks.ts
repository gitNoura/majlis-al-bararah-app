// What the reader marks on ayat (the website's src/reader/highlights.js and notes.js): highlights in
// five soft colours, and comments - a few lines of their own on a coloured sticky note. Saved on the
// phone as on the website ('highlights', 'notes'), under Warsh keys ("2:255") for both narrations, so
// a reader who uses both sees the same ones (src/lib/ayahmap.js). useMarks() redraws a screen when
// they change.
import { useSyncExternalStore } from 'react';

import { displayKeys, storedKeys } from './ayahmap';
import { ayatOn, pageOf } from './boxes';
import { fetchData } from './remote';
import { HAFS } from './riwaya';
import { readJSON, writeJSON } from './storage';

export const HL_COLORS = [
  { id: 'yellow', value: 'rgba(255, 213, 0, 0.34)', dot: '#f2c200' },
  { id: 'green', value: 'rgba(56, 176, 106, 0.28)', dot: '#38b06a' },
  { id: 'blue', value: 'rgba(64, 150, 230, 0.28)', dot: '#4096e6' },
  { id: 'pink', value: 'rgba(236, 88, 150, 0.26)', dot: '#ec5896' },
  { id: 'purple', value: 'rgba(140, 90, 210, 0.26)', dot: '#8c5ad2' },
];

// on: the words on the save button, which takes the note's colour (dark on the yellow)
export const NOTE_COLORS = [
  { id: 'yellow', paper: '#fff3b0', dot: '#e3b929', on: '#3b3000' },
  { id: 'orange', paper: '#ffe1c2', dot: '#e8832a', on: '#ffffff' },
  { id: 'green', paper: '#daf2d8', dot: '#45a05c', on: '#ffffff' },
  { id: 'blue', paper: '#d9eafb', dot: '#4a8fd8', on: '#ffffff' },
  { id: 'pink', paper: '#fbdde9', dot: '#dd5f8d', on: '#ffffff' },
  { id: 'purple', paper: '#e9dffa', dot: '#8b62cf', on: '#ffffff' },
];
export const noteColor = (id?: string) => NOTE_COLORS.find((c) => c.id === id) ?? NOTE_COLORS[0];
export const hlColor = (id?: string) => HL_COLORS.find((c) => c.id === id) ?? HL_COLORS[0];

type Highlight = { key: string; color: string; added: number; text: string };
type Note = { html: string; color: string; added: number; updated: number };

let highlights: Highlight[] = readJSON('highlights', []);
let notes: Record<string, Note> = readJSON('notes', {});

// ---------- telling the screens ----------

// A screen reads the marks through useMarks(): a new snapshot each time they change, so whatever it
// works out from them is worked out again (the React Compiler keeps results while their inputs stay)
type Snapshot = { highlightOf: typeof highlightOf; noteOf: typeof noteOf; pageMarked: typeof pageMarked };
const snap = (): Snapshot => ({ highlightOf: (k) => highlightOf(k), noteOf: (k) => noteOf(k), pageMarked: (p) => pageMarked(p) });
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();
function changed() {
  snapshot = snap();
  listeners.forEach((fn) => fn());
}
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const useMarks = () => useSyncExternalStore(subscribe, () => (snapshot ??= snap()));

// ---------- highlights ----------

// k: a key of the narration read
export const highlightOf = (k: string) => {
  const stored = storedKeys(k);
  return highlights.find((h) => stored.includes(h.key)) ?? null;
};

export function setHighlight(k: string, color: string) {
  for (const w of storedKeys(k)) {
    const h = highlights.find((x) => x.key === w);
    if (h) {
      h.color = color;
      continue;
    }
    const fresh: Highlight = { key: w, color, added: Date.now(), text: '' };
    highlights.push(fresh);
    // a few words of the ayah, for the list of highlights (the Warsh text, as on the website)
    const [s, a] = w.split(':').map(Number);
    fetchData(`surah/${s}`)
      .then((surah: { text: string }[]) => {
        fresh.text = surah[a - 1].text.replace(/\s*[٠-٩]+\s*$/, '').split(/\s+/).slice(0, 7).join(' ');
        writeJSON('highlights', highlights);
      })
      .catch(() => {});
  }
  writeJSON('highlights', highlights);
  changed();
}

export function removeHighlight(k: string) {
  const stored = storedKeys(k);
  highlights = highlights.filter((h) => !stored.includes(h.key));
  writeJSON('highlights', highlights);
  changed();
}

// ---------- comments ----------

// the Warsh key a comment is saved under (null for the Basmala of al-Fatiha in Hafs: no Warsh ayah)
const noteKey = (k: string) => {
  const stored: string[] = storedKeys(k);
  return stored.find((w) => notes[w]) ?? stored[0] ?? null;
};

export function noteOf(k: string) {
  const w = noteKey(k);
  return w ? (notes[w] ?? null) : null;
}

// The note's words as plain lines (the website keeps them as a little HTML: bold, lists, lines)
export const noteText = (html: string) =>
  html
    .replace(/<br\s*\/?>|<\/(div|li|p)>/g, '\n')
    .replace(/<li[^>]*>/g, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
const toHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

export function saveNote(k: string, text: string, color: string) {
  const w = noteKey(k);
  if (!w) return;
  if (text.trim()) notes[w] = { html: toHtml(text.trim()), color, added: notes[w]?.added ?? Date.now(), updated: Date.now() };
  else delete notes[w];
  writeJSON('notes', notes);
  changed();
}

export function deleteNote(k: string) {
  const w = noteKey(k);
  if (!w) return;
  delete notes[w];
  writeJSON('notes', notes);
  changed();
}

// the keys (of the narration read) that have a comment
export const notedKeys = () => Object.keys(notes).flatMap((w) => displayKeys(w).slice(0, 1));

// ---------- the ayah's own words (quoted on its note) ----------

export async function ayahWords(s: number, a: number) {
  const surah: { ayah: number; text: string }[] = await fetchData(`${HAFS ? 'surah-hafs' : 'surah'}/${s}`);
  const entry = surah.find((x) => x.ayah === a);
  return entry ? entry.text.replace(/[\s ]*[٠-٩]+$/, '') : '';
}

// ---------- page marks ----------

// A bookmark on a whole page, as many as the reader likes. Each keeps the page's first ayah (under its Warsh key), so it
// stays on the same page's place when the narration changes. Saved on the phone ('pageMarks').
type PageMark = { key: string; added: number };
let pageMarks: PageMark[] = readJSON('pageMarks', []);

const pageOfMark = (m: PageMark) => {
  const shown = displayKeys(m.key)[0];
  if (!shown) return null;
  const [s, a] = shown.split(':').map(Number);
  return pageOf(s, a) as number | null;
};

export function pageMarked(p: number) {
  return pageMarks.some((m) => pageOfMark(m) === p);
}

// Marks the page, or takes its mark off; true when it is marked now
export function togglePageMark(p: number): boolean {
  if (pageMarked(p)) {
    pageMarks = pageMarks.filter((m) => pageOfMark(m) !== p);
    writeJSON('pageMarks', pageMarks);
    changed();
    return false;
  }
  const first = ayatOn(p)[0] as { s: number; a: number } | undefined;
  if (!first) return false;
  const raw = `${first.s}:${first.a}`;
  pageMarks.push({ key: storedKeys(raw)[0] ?? raw, added: Date.now() });
  writeJSON('pageMarks', pageMarks);
  changed();
  return true;
}

// the marked pages, in mushaf order
export const pageMarkList = (): number[] => [...new Set(pageMarks.map(pageOfMark).filter((p): p is number => p != null))].sort((a, b) => a - b);

// ---------- the lists (for «My marks») ----------

export type Listed = { s: number; a: number; page: number | null; text: string; color: string };

function listed(key: string, text: string, color: string): Listed | null {
  const shown = displayKeys(key)[0];
  if (!shown) return null;
  const [s, a] = shown.split(':').map(Number);
  return { s, a, page: pageOf(s, a) as number | null, text, color };
}
const inOrder = (x: Listed, y: Listed) => x.s - y.s || x.a - y.a;

export const highlightList = (): Listed[] =>
  highlights.map((h) => listed(h.key, h.text, h.color)).filter((x): x is Listed => !!x).sort(inOrder);

export const noteList = (): Listed[] =>
  Object.entries(notes).map(([k, n]) => listed(k, noteText(n.html).trim(), n.color)).filter((x): x is Listed => !!x).sort(inOrder);
