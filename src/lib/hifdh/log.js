// The session log: one quiet record for each Listen or Test, and one for each «I revised this»
// (revision done outside the app: in prayer, at the mosque, with a teacher). It is only a record of
// what happened: nothing here scores, schedules or judges. The reader sees all of it in one place and
// can delete any record.
//
// Kept on this device ('hifdhLog'), oldest first:
//   { id, at: ISO date-time, kind: 'listen' | 'test' | 'revised', from: "2:1", to: "2:5", details }
// details by kind - test: { mistakes: { confirmed: ["2:3:4"], suggested: [] } }, where "2:3:4" is
// ayah 3 of surah 2, word 4. «confirmed» is what the reader marked; «suggested» is reserved for a
// future recitation recogniser and is never mixed into «confirmed».
import { readJSON, writeJSON } from '../storage.js';
import { TOTAL, keyOf, ordOf } from './index.js';

const KEY = 'hifdhLog';
let records = null; // [{ id, at, kind, from, to, details, a, b }] (a, b: positions)

function load() {
  if (records) return records;
  records = [];
  for (const r of readJSON(KEY, [])) {
    if (!r?.id || !r.at || !r.kind || !r.from || !r.to) continue;
    const a = ordOf(r.from);
    const b = ordOf(r.to);
    if (a >= 0 && b < TOTAL && a <= b) records.push({ ...r, a, b });
  }
  return records;
}

function save() {
  writeJSON(
    KEY,
    records.map(({ a, b, ...r }) => r),
  );
}

// Positions a..b (see index.js).
export function addRecord(kind, a, b, details = null) {
  load().push({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    kind,
    from: keyOf(a),
    to: keyOf(b),
    details,
    a,
    b,
  });
  save();
}

// Newest first.
export const allRecords = () => [...load()].reverse();

export function removeRecord(id) {
  records = load().filter((r) => r.id !== id);
  save();
}

export function clearRecords() {
  records = [];
  save();
}

// The latest time (ms) any record touched [a, b], or null.
export function lastWorked(a, b) {
  let latest = null;
  for (const r of load()) {
    if (r.b < a || r.a > b) continue;
    const at = Date.parse(r.at);
    if (latest === null || at > latest) latest = at;
  }
  return latest;
}
