// The misbaha (tasbih counter): which words are being said, the target (33, 100 or none), and for each
// of the words its own count and rounds - going to other words and back, the count is where it was -
// and how many said today. Kept on the phone ('misbaha').
import { useSyncExternalStore } from 'react';

import { dayKey, readJSON, writeJSON } from '@/lib/storage';

// the words to choose from
export const WORDS = [
  { id: 'subhan', ar: 'سُبْحَانَ اللَّهِ', en: 'Subhan Allah', fr: 'Subhan Allah' },
  { id: 'hamd', ar: 'الْحَمْدُ لِلَّهِ', en: 'Al-hamdu lillah', fr: 'Al-hamdu lillah' },
  { id: 'akbar', ar: 'اللَّهُ أَكْبَرُ', en: 'Allahu akbar', fr: 'Allahu akbar' },
  { id: 'tahlil', ar: 'لَا إِلَهَ إِلَّا اللَّهُ', en: 'La ilaha illa Allah', fr: 'La ilaha illa Allah' },
  { id: 'istighfar', ar: 'أَسْتَغْفِرُ اللَّهَ', en: 'Astaghfiru Allah', fr: 'Astaghfiru Allah' },
  { id: 'salat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', en: 'Allahumma salli ala Muhammad', fr: 'Allahumma salli ala Muhammad' },
] as const;
export type WordId = (typeof WORDS)[number]['id'];

// 0: no limit
export const TARGETS = [33, 100, 0];

type Tally = { count: number; rounds: number };
type State = { word: WordId; target: number; tallies: Partial<Record<WordId, Tally>>; day: string; today: Partial<Record<WordId, number>> };
const fresh = (): State => ({ word: 'subhan', target: 33, tallies: {}, day: dayKey(), today: {} });

const saved = readJSON('misbaha', {}) as Partial<State> & { count?: number; rounds?: number };
let state: State = { ...fresh(), ...saved, tallies: saved.tallies ?? {} };
// (the first version kept one count for all: it goes to the words it was for)
if (!saved.tallies && saved.count) state.tallies[state.word] = { count: saved.count, rounds: saved.rounds ?? 0 };
// a new day: today's totals start again
if (state.day !== dayKey()) state = { ...state, day: dayKey(), today: {} };

const listeners = new Set<() => void>();
function set(next: Partial<State>) {
  state = { ...state, ...next };
  writeJSON('misbaha', state);
  listeners.forEach((fn) => fn());
}

export function useMisbaha(): State & Tally {
  const s = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
  return { ...s, ...(s.tallies[s.word] ?? { count: 0, rounds: 0 }) };
}

const tallyOf = (w: WordId): Tally => state.tallies[w] ?? { count: 0, rounds: 0 };

// one more of the words chosen; true when that finished a round (the target reached)
export function count(): boolean {
  const day = dayKey();
  const today = day === state.day ? state.today : {};
  const t = tallyOf(state.word);
  const n = t.count + 1;
  const done = state.target > 0 && n >= state.target;
  set({
    day,
    today: { ...today, [state.word]: (today[state.word] ?? 0) + 1 },
    tallies: { ...state.tallies, [state.word]: { count: done ? 0 : n, rounds: done ? t.rounds + 1 : t.rounds } },
  });
  return done;
}

// other words: each keeps its own count
export const chooseWord = (word: WordId) => set({ word });
// another target: the words' counts start again
export const chooseTarget = (target: number) => set({ target, tallies: {} });
// this words' count from the start
export const reset = () => set({ tallies: { ...state.tallies, [state.word]: { count: 0, rounds: 0 } } });
