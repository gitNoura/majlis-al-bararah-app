// The days the member came to the app, and what they did: the marks and the streak on the
// calendar.
//
// Kinds: 'quran' (the mushaf, the wird, memorization), 'ahadith', 'adhkar', 'majlis'. Any of them
// counts the day in the streak; the calendar marks quran (gold dot), adhkar (green dot) and
// majlis (a small group). Kept on this device ('activeDays': { 'YYYY-MM-DD': ['quran', ...] }).
import { dayKey, readJSON, writeJSON } from './storage.js';

const KEY = 'activeDays';

function load() {
  const saved = readJSON(KEY, {});
  // the first version kept only the days, as a list
  if (Array.isArray(saved)) return Object.fromEntries(saved.map((d) => [d, ['quran']]));
  return saved;
}

// Today counts, for this kind (called when a section opens)
export function markToday(kind = 'quran') {
  const days = load();
  const today = dayKey(new Date());
  const kinds = new Set(days[today] ?? []);
  if (kinds.has(kind)) return;
  kinds.add(kind);
  days[today] = [...kinds];
  const keep = Object.keys(days).sort().slice(-400);
  writeJSON(KEY, Object.fromEntries(keep.map((d) => [d, days[d]])));
}

// Every day with its kinds (a Map day -> Set): the sections opened, and the wird's days
export function activeDays() {
  const map = new Map(Object.entries(load()).map(([d, k]) => [d, new Set(k)]));
  for (const day of Object.keys(readJSON('wird')?.days ?? {})) {
    map.set(day, new Set([...(map.get(day) ?? []), 'quran']));
  }
  return map;
}

// Days in a row until today (or until yesterday, while today is still to come)
export function streak(days = activeDays()) {
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
