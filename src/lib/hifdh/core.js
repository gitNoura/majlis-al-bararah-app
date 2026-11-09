// The memorization plan's arithmetic (الحفظ): the ledger, the units, and the schedule. No screens, no
// storage and no imports here: src/hifz/hifz-plan.js keeps the state on the device and
// src/hifz/hifz.js draws it, so everything below can be tested on its own (scripts/test-hifz.mjs).
//
// PROGRESS IS BY AYAH. The ledger is the set of memorized ayat (ayah 0..6213, in reading order, Warsh
// numbering). Ayah, page, thumun and hizb are only ways of looking at it: the units (makeUnits) cut
// the same 6,214 ayat into portions of that size. Hizb = 8 thumun (60 and 480, the Maghrebi division).
//
// THE SCHEDULE is a function of the calendar, not of what was ticked:
//   - a plan has planned days (its days of the week, or the week for a weekly plan);
//   - walking the planned days in order, each takes the next portion of the plan's pool;
//   - a day nobody touched still counts as planned: its portion stays on its day, nothing shifts and
//     nothing is red. It can be marked done later, and that shifts nothing either;
//   - only a session MARKED «not done» by the reader hands its portion (and so every later one) to
//     the next planned day;
//   - «done» with a stopping ayah finishes only the ayat up to it: the rest carries forward to the
//     next planned day.
// Past days are read from the log (what was really done is kept as it was); the rest is computed.

export const UNITS = ['ayah', 'page', 'thumun', 'hizb'];
const EPS = 1e-9;
export const WEEK_START = 1; // a weekly plan's week begins on this day (0 Sunday ... 1 Monday)
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

// ---------- Ring ----------

// The ring on the home screen: memorized ayat out of all ayat, as a fraction (0 to 1). One function,
// so the way progress is counted can be changed in one place.
export const ringFraction = (memorized, total) => (total ? memorized / total : 0);

// ---------- Units ----------

// raw is public/data/hifz-units.json (scripts/build_hifz_units.mjs): the first ayah of each surah
// (and the total), of each page, and of each thumun.
export function makeUnits(raw) {
  const N = raw.surah[114];
  const surahOf = new Int16Array(N);
  for (let s = 0; s < 114; s++) surahOf.fill(s, raw.surah[s], raw.surah[s + 1]);
  const pageOf = new Int16Array(N);
  for (let p = 1; p <= 604; p++) pageOf.fill(p, raw.pg[p - 1], raw.pg[p]);

  const cut = (bounds, label) => {
    const start = bounds.slice(0, -1); // the first ayah of each unit
    const uid = new Int32Array(N);
    const size = new Int32Array(start.length);
    start.forEach((g, u) => {
      size[u] = bounds[u + 1] - g;
      uid.fill(u, g, bounds[u + 1]);
    });
    return { count: start.length, start, uid, size, label };
  };
  const pageBounds = [...new Set(raw.pg.slice(0, 604))].filter((g) => g < N).concat(N);
  const hizbBounds = raw.thumun.filter((_, i) => i % 8 === 0); // every 8th thumun starts a hizb (60, then the total)

  const unit = {
    ayah: cut(Array.from({ length: N + 1 }, (_, g) => g), (u) => u + 1),
    page: cut(pageBounds, (u) => pageOf[pageBounds[u]]),
    thumun: cut(raw.thumun, (u) => u + 1),
    hizb: cut(hizbBounds, (u) => u + 1),
  };
  return {
    N,
    surahStart: raw.surah,
    surahOf,
    pageOf,
    unit,
    ayahNumber: (g) => g - raw.surah[surahOf[g]] + 1,
    juzOf: (g) => Math.floor(unit.hizb.uid[g] / 2) + 1,
    hizbOf: (g) => unit.hizb.uid[g] + 1,
  };
}

// A thumun is never shown by its number in the whole Quran (33, 77...): only 1-8 inside its hizb, with the hizb
// beside it. u is the thumun's index from 0 (the 9th thumun, u = 8, is «thumun 1, hizb 2»).
export const thumunParts = (u) => ({ n: (u % 8) + 1, hizb: Math.floor(u / 8) + 1 });

// ---------- Sets of ayat: lists of [from, to) ranges, and the same as a flag per ayah ----------

export function rangesToBits(ranges, N) {
  const bits = new Uint8Array(N);
  for (const [a, b] of ranges) bits.fill(1, Math.max(0, a), Math.min(N, b));
  return bits;
}

export function bitsToRanges(bits) {
  const out = [];
  let from = -1;
  for (let g = 0; g <= bits.length; g++) {
    if (g < bits.length && bits[g]) {
      if (from < 0) from = g;
    } else if (from >= 0) {
      out.push([from, g]);
      from = -1;
    }
  }
  return out;
}

export const countBits = (bits) => bits.reduce((n, b) => n + b, 0);

// Merges and sorts ranges.
export const normRanges = (ranges, N = 6214) => bitsToRanges(rangesToBits(ranges, N));

// A list of ayat [3, 4, 5, 9] as ranges [[3, 6], [9, 10]].
export function segsOf(ids) {
  const out = [];
  for (const g of ids) {
    const last = out[out.length - 1];
    if (last && last[1] === g) last[1] = g + 1;
    else out.push([g, g + 1]);
  }
  return out;
}

export const idsOf = (segs) => segs.flatMap(([a, b]) => Array.from({ length: b - a }, (_, i) => a + i));
export const sizeOf = (segs) => segs.reduce((n, [a, b]) => n + b - a, 0);

// ---------- Days ('YYYY-MM-DD', in the reader's own time zone) ----------

const pad = (n) => String(n).padStart(2, '0');
export const dayOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDay = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (day, n) => {
  const [y, m, d] = day.split('-').map(Number);
  return dayOf(new Date(y, m - 1, d + n));
};
export const weekdayOf = (day) => parseDay(day).getDay();
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
export const weekStartOf = (day) => addDays(day, -((weekdayOf(day) - WEEK_START + 7) % 7));

// The day a session counts for: the day starts at dayStart (minutes after midnight, 0 by default), so
// at 01:30 with a 04:00 day start it is still «yesterday».
export const sessionDay = (now = new Date(), dayStart = 0) => dayOf(new Date(now.getTime() - dayStart * 60000));

// ---------- Plans ----------
//
// plan = {
//   id, type: 'memorize' | 'revise', period: 'day' | 'week',
//   range: [[from, to), ...] | null     null: the whole Quran (memorize) or all that is memorized (revise)
//   start: day the plan begins,
//   versions: [{ from: day, unit, amount, days: [0-6], perDay?: { [weekday]: amount } }]    the pace, each
//             effective from its day; `amount` is what each day gives, unless `perDay` sets a day's own
//   target: null | { kind: 'days', n } | { kind: 'date', date }   what the amount was derived from
//   pauses: [{ from, to }]   (to: null while paused)
// }
// log entry = { id, day, plan: id | null (an extra revision), outcome: 'done' | 'partial' | 'notdone',
//               seg: ranges (the ayat), end: last ayah finished, added: ranges put in the ledger }

export const emptyState = () => ({ v: 2, ledger: [], plans: [], log: [], settings: { dayStart: 0 } });

export const versionAt = (plan, day) => {
  let v = plan.versions[0];
  for (const x of plan.versions) if (x.from <= day) v = x;
  return v;
};

// A version's amount on one weekday: its own entry in `perDay` (a reader who wants half a thumun one day and
// two the next), or the even `amount` the other days share.
export const amountOn = (v, weekday) => (v.perDay && v.perDay[weekday] > 0 ? v.perDay[weekday] : v.amount);

// What a version gives in a week: the sum of its planned days' amounts.
export const weeklyTotal = (v) => Math.round(v.days.reduce((n, d) => n + amountOn(v, d), 0) * 10000) / 10000;

export const isPaused = (plan, day) => (plan.pauses || []).some((p) => p.from <= day && (!p.to || day < p.to));
export const pausedNow = (plan) => (plan.pauses || []).some((p) => !p.to);

const plannedOn = (plan, day) => {
  if (day < plan.start || isPaused(plan, day)) return null;
  const v = versionAt(plan, day);
  return v.days.includes(weekdayOf(day)) ? v : null;
};

export const ctxOf = (state, U) => ({ U, ledger: rangesToBits(state.ledger, U.N), log: state.log });

// The ayat a plan draws its portions from, in order.
//   memorize: its range, less what is memorized already - except what this plan's own sessions
//             memorized, which stays in so the plan's days keep their place
//   revise:   its range as it is - what the reader chose to revise needs no entry in the ledger - or, with no
//             range, everything memorized
function pool(plan, ctx) {
  const { U, ledger } = ctx;
  const inRange = plan.range ? rangesToBits(plan.range, U.N) : null;
  const own = new Uint8Array(U.N);
  if (plan.type === 'memorize') {
    for (const e of ctx.log) if (e.plan === plan.id && e.outcome !== 'notdone') for (const [a, b] of e.seg) own.fill(1, a, b);
  }
  const R = [];
  for (let g = 0; g < U.N; g++) {
    if (inRange && !inRange[g]) continue;
    if (plan.type === 'memorize' ? !ledger[g] || own[g] : inRange || ledger[g]) R.push(g);
  }
  return R;
}

// A reader of the pool that remembers which ayat are used up (a cycle, for a revision plan).
function cursor(R, N, cycles) {
  const inR = new Uint8Array(N);
  for (const g of R) inR[g] = 1;
  const used = new Uint8Array(N);
  let left = R.length;
  let at = 0;
  return {
    cycleDay: 0,
    cycle: 0,
    left: () => left,
    // The next portion, at `amount` units. The pool is cut into slots of `amount` units on a fixed grid
    // that starts at the unit of its first ayah; an ayah belongs to the slot its middle falls in
    // (so a half-thumun cuts at the ayah nearest the middle, with no drift from one slot to the next).
    // The portion is the first slot with ayat not used up yet. A slot stopped partway comes back as
    // its remainder, and the grid then carries on as planned.
    peek(amount, info) {
      while (at < R.length && used[R[at]]) at++;
      if (at >= R.length) return [];
      const { uid, size, start } = info;
      const anchor = uid[R[0]];
      const slot = (g) => Math.floor((uid[g] + (g - start[uid[g]] + 0.5) / size[uid[g]] - anchor) / amount + EPS);
      const s = slot(R[at]);
      const out = [];
      for (let k = at; k < R.length && slot(R[k]) === s; k++) if (!used[R[k]]) out.push(R[k]);
      return out;
    },
    // The next portion when the days do not share one amount: `amount` units counted from the first ayah not
    // used up (an ayah belongs to the portion its middle falls in), so a day of 2 thumun after a day of 1
    // still gives 2, not what is left of a fixed grid.
    peekFrom(amount, info) {
      while (at < R.length && used[R[at]]) at++;
      if (at >= R.length) return [];
      const { uid, size, start } = info;
      const g0 = R[at];
      const from = uid[g0] + (g0 - start[uid[g0]]) / size[uid[g0]];
      const out = [];
      for (let k = at; k < R.length; k++) {
        const g = R[k];
        if (used[g]) continue;
        if (out.length && uid[g] + (g - start[uid[g]] + 0.5) / size[uid[g]] >= from + amount - EPS) break;
        out.push(g);
      }
      return out;
    },
    // Uses ayat up. True when the pool has been used up and a revision begins again.
    use(ids) {
      let any = false;
      for (const g of ids) {
  if (inR[g] && !used[g]) {
    used[g] = 1;
    left--;
    any = true;
  }
}
      if (any) this.cycleDay++;
      if (cycles && left === 0 && R.length) {
        for (const g of R) used[g] = 0;
        left = R.length;
        at = 0;
        this.cycle++;
        this.cycleDay = 0;
        return true;
      }
      return false;
    },
  };
}

// How many portions one pass over the pool takes at this amount (the «7» of «Day 2 of 7»).
function cycleLength(R, N, amount, info) {
  const c = cursor(R, N, false);
  let n = 0;
  while (c.left() > 0 && n < 5000) {
    const p = c.peek(amount, info);
    if (!p.length) break;
    c.use(p);
    n++;
  }
  return n;
}

// The same for days with different amounts: the weekly pattern of the version, repeated (an estimate for «day k of n»).
function cycleLengthSeq(R, N, amounts, info) {
  const c = cursor(R, N, false);
  let n = 0;
  while (c.left() > 0 && n < 5000) {
    const p = c.peekFrom(amounts[n % amounts.length], info);
    if (!p.length) break;
    c.use(p);
    n++;
  }
  return n;
}

const entriesOf = (plan, ctx) => ctx.log.filter((e) => e.plan === plan.id).sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.ts - b.ts));

// Walks a daily plan's planned days from its start, one row per day:
//   { day, plan, version, segs, ayat, status: 'untouched' | 'done' | 'partial' | 'notdone', entry,
//     k, n (revision: day k of n), last (this row finishes the pool) }
// It never ends by itself for a revision plan: the caller stops when it has enough.
export function* walkDaily(plan, ctx, limit = 4000) {
  const { U } = ctx;
  const R = pool(plan, ctx);
  if (!R.length) return;
  const revise = plan.type === 'revise';
  const cur = cursor(R, U.N, revise);
  const byDay = new Map();
  for (const e of entriesOf(plan, ctx)) byDay.set(e.day, e);
  const lens = new Map();
  for (let i = 0, day = plan.start; i < limit; i++, day = addDays(day, 1)) {
    const v = plannedOn(plan, day);
    const entry = byDay.get(day);
    if (!v) {
      // something done on a day that was not planned (an early check) still uses its ayat
      if (entry && entry.outcome !== 'notdone') cur.use(idsOf(entry.seg));
      continue;
    }
    const info = U.unit[v.unit];
    const uneven = Boolean(v.perDay) && v.days.some((d) => amountOn(v, d) !== v.amount);
    const amount = amountOn(v, weekdayOf(day));
    let ids = uneven ? cur.peekFrom(amount, info) : cur.peek(amount, info);
    if (!ids.length) return;
    const key = uneven ? `${v.unit}/${v.days.map((d) => amountOn(v, d)).join(',')}` : `${v.unit}/${v.amount}`;
    if (revise && !lens.has(key)) {
      const order = WEEKDAY_ORDER.filter((d) => v.days.includes(d)).map((d) => amountOn(v, d));
      lens.set(key, uneven ? cycleLengthSeq(R, U.N, order, info) : cycleLength(R, U.N, v.amount, info));
    }
    const row = { day, plan, version: v, segs: segsOf(ids), ayat: ids.length, status: 'untouched', entry: null, k: cur.cycleDay + 1, n: lens.get(key) || 0, cycle: cur.cycle };
    if (entry) {
      row.entry = entry;
      row.status = entry.outcome;
      if (entry.outcome !== 'notdone') {
        row.segs = entry.seg;
        ids = idsOf(entry.seg);
      }
    }
    if (row.status !== 'notdone') cur.use(ids);
    row.last = cur.left() === 0 || (revise && cur.cycle > row.cycle);
    yield row;
    if (row.last && !revise) return;
  }
}

// A weekly plan has no daily split: one row for the week of `day`, and any day's work adds to it.
//   { week, plan, version, quota, done (units this week), segs (the next portion), ayat, entries }
export function weekRow(plan, ctx, day) {
  const { U } = ctx;
  const ws = weekStartOf(day);
  const we = addDays(ws, 6);
  const v = versionAt(plan, ws < plan.start ? plan.start : ws);
  if (day < weekStartOf(plan.start) || isPaused(plan, day)) return null;
  const R = pool(plan, ctx);
  if (!R.length) return null;
  const info = U.unit[v.unit];
  const cur = cursor(R, U.N, plan.type === 'revise');
  let done = 0;
  const entries = [];
  for (const e of entriesOf(plan, ctx)) {
    if (e.day > we || e.outcome === 'notdone') continue;
    cur.use(idsOf(e.seg));
    if (e.day >= ws) {
      entries.push(e);
      for (const [a, b] of e.seg) for (let g = a; g < b; g++) done += 1 / info.size[info.uid[g]];
    }
  }
  const left = v.amount - done;
  const ids = left > EPS ? cur.peek(Math.min(1, left), info) : [];
  return { week: ws, plan, version: v, quota: v.amount, done, segs: segsOf(ids), ayat: ids.length, entries, complete: left <= EPS };
}

// The row of one plan on one day (a daily plan: its planned day; a weekly plan: its week), or null.
export function rowFor(plan, ctx, day) {
  if (plan.period === 'week') return weekRow(plan, ctx, day);
  for (const row of walkDaily(plan, ctx)) {
    if (row.day === day) return row;
    if (row.day > day) return null;
  }
  return null;
}

export const activePlans = (state, day) => state.plans.filter((p) => !isPaused(p, day) && day >= p.start);

// ---------- Today ----------

// The rows of the day, one per plan that has something on it. A daily plan with nothing planned
// today has no row; its next planned day is `next`.
export function todayRows(state, U, day) {
  const ctx = ctxOf(state, U);
  const rows = [];
  for (const plan of activePlans(state, day)) {
    const row = rowFor(plan, ctx, day);
    if (row) rows.push(row);
  }
  return rows;
}

// The next planned day after `day` for each daily plan, with its portion - what can be checked early.
export function upcomingRows(state, U, day) {
  const ctx = ctxOf(state, U);
  const rows = [];
  for (const plan of activePlans(state, day)) {
    if (plan.period === 'week') continue;
    for (const row of walkDaily(plan, ctx)) {
      if (row.day > day) {
        rows.push(row);
        break;
      }
    }
  }
  return rows;
}

// ---------- History ----------

// Every day up to `day`, newest first: [{ day, rows: [...], extras: [entries] }]. A weekly plan's
// work shows on the days it was done.
export function historyDays(state, U, day) {
  const ctx = ctxOf(state, U);
  const days = new Map();
  const at = (d) => {
    if (!days.has(d)) days.set(d, { day: d, rows: [], extras: [] });
    return days.get(d);
  };
  for (const plan of state.plans) {
    if (plan.period === 'week') {
      for (const e of entriesOf(plan, ctx)) if (e.day <= day) at(e.day).rows.push({ day: e.day, plan, entry: e, status: e.outcome, segs: e.seg, weekly: true });
      continue;
    }
    for (const row of walkDaily(plan, ctx)) {
      if (row.day > day) break;
      at(row.day).rows.push(row);
    }
  }
  for (const e of state.log) if (!e.plan && e.day <= day) at(e.day).extras.push(e);
  return [...days.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

// ---------- Changing the log (and with it the ledger) ----------

let counter = 0;
const newId = (p) => `${p}${Date.now().toString(36)}${(counter++).toString(36)}`;

// Takes an entry out of the log, and what it added out of the ledger.
function removeEntry(state, U, entry) {
  state.log = state.log.filter((e) => e !== entry);
  if (entry.added?.length) {
    const bits = rangesToBits(state.ledger, U.N);
    for (const [a, b] of entry.added) bits.fill(0, a, b);
    state.ledger = bitsToRanges(bits);
  }
}

function addToLedger(state, U, ranges) {
  const bits = rangesToBits(state.ledger, U.N);
  const added = [];
  for (const [a, b] of ranges) {
    let from = -1;
    for (let g = a; g <= b; g++) {
      if (g < b && !bits[g]) {
        if (from < 0) from = g;
      } else if (from >= 0) {
        added.push([from, g]);
        from = -1;
      }
    }
    bits.fill(1, a, b);
  }
  state.ledger = bitsToRanges(bits);
  return added;
}

// Sets how a planned session went (a row from todayRows / historyDays / upcomingRows):
//   'done'     the whole portion;   'partial' up to the ayah `stop`;
//   'notdone'  marked not done: its portion and all later ones go to the next planned day;
//   'untouched' clears the mark (what it added to the ledger goes too).
// A weekly plan's row has no day of its own: its work is added on `day` (today).
export function setOutcome(state, U, row, outcome, { stop = null, day = row.day, ts = Date.now() } = {}) {
  const plan = row.plan;
  if (row.entry) removeEntry(state, U, row.entry); // the new mark replaces the old one
  if (outcome === 'untouched') return;
  let seg = row.segs;
  if (outcome === 'partial') seg = segsOf(idsOf(seg).filter((g) => g <= stop));
  if (outcome === 'partial' && !sizeOf(seg)) return;
  const entry = { id: newId('e'), ts, day, plan: plan.id, outcome, seg, end: outcome === 'notdone' ? null : idsOf(seg).pop(), added: [] };
  if (plan.type === 'memorize' && outcome !== 'notdone') entry.added = addToLedger(state, U, seg);
  state.log.push(entry);
}

// An extra revision session outside any plan.
export function logExtra(state, ranges, day, ts = Date.now()) {
  state.log.push({ id: newId('e'), ts, day, plan: null, outcome: 'done', seg: normRanges(ranges), end: null, added: [] });
}

export function removeLogEntry(state, U, id) {
  const e = state.log.find((x) => x.id === id);
  if (e) removeEntry(state, U, e);
}

// ---------- The ledger from the picker ----------

export function setLedger(state, U, ranges, on) {
  if (on) return addToLedger(state, U, ranges);
  const bits = rangesToBits(state.ledger, U.N);
  for (const [a, b] of ranges) bits.fill(0, a, b);
  state.ledger = bitsToRanges(bits);
  return [];
}

// ---------- Pace: the amount from a target, and the forecast ----------

// The units in the plan's pool (what is left to memorize, or what is memorized to revise).
export function poolUnits(plan, ctx, unit) {
  const info = ctx.U.unit[unit];
  let w = 0;
  for (const g of pool({ ...plan, id: '__draft' }, ctx)) w += 1 / info.size[info.uid[g]];
  return w;
}

// Rounded up so the target is met: always a whole number (no «0.5 thumun» on a day's card).
export const roundUp = (x) => Math.max(1, Math.ceil(x - EPS));

// A week's whole total shared over days as whole numbers: the days (in the order given) each get the even share,
// and the first few one more when it does not divide. { [weekday]: amount }, a day with 0 is left out.
export function wholeSplit(total, days) {
  const n = days.length;
  const out = {};
  if (!n) return out;
  const base = Math.floor(total / n + EPS);
  const extra = Math.max(0, Math.round(total) - base * n);
  days.forEach((d, i) => {
    const a = base + (i < extra ? 1 : 0);
    if (a > 0) out[d] = a;
  });
  return out;
}

// The weekly figures of a plan version as a daily pace of whole thumun: a hizb is 8 thumun and a juz 16. Returns
// { unit: 'thumun', amount, days, perDay? } or null when the version is already in whole numbers.
export function wholeVersion(v) {
  if (v.unit !== 'hizb') return null;
  const total = Math.max(1, Math.round(weeklyTotal(v) * 8));
  const split = wholeSplit(total, [1, 2, 3, 4, 5, 6, 0].filter((d) => v.days.includes(d)));
  const days = Object.keys(split).map(Number).sort((a, b) => a - b);
  const vals = days.map((d) => split[d]);
  const even = vals.every((x) => x === vals[0]);
  const { perDay: _old, ...rest } = v;
  return { ...rest, unit: 'thumun', amount: even ? vals[0] : Math.round(total / days.length), days, ...(even ? {} : { perDay: split }) };
}

// The amount that finishes the pool by the target, for a draft { type, range, period, unit, days, target }.
export function deriveAmount(draft, ctx, today, raw = false) {
  const total = poolUnits(draft, ctx, draft.unit);
  const span = draft.target.kind === 'days' ? draft.target.n : daysBetween(today, draft.target.date) + 1;
  if (draft.period === 'week') return raw ? total / Math.max(1, Math.ceil(span / 7)) : roundUp(total / Math.max(1, Math.ceil(span / 7)));
  let planned = 0;
  for (let i = 0; i < Math.max(1, span); i++) if (draft.days.includes(weekdayOf(addDays(today, i)))) planned++;
  return raw ? total / Math.max(1, planned) : roundUp(total / Math.max(1, planned));
}

// A plan as it would start today, for the forecast line and for editing.
export function draftPlan(d, today) {
  return {
    id: '__draft',
    type: d.type,
    period: d.period,
    range: d.range || null,
    start: today,
    versions: [{ from: today, unit: d.unit, amount: d.amount, days: d.days, ...(d.perDay ? { perDay: d.perDay } : {}) }],
    pauses: [],
  };
}

// When the plan, started today at its pace, finishes: the last planned day (memorize) or the end of the
// first full revision. A day ('YYYY-MM-DD') or null when there is nothing to do.
export function forecast(state, U, plan, today) {
  const draft = { ...plan, start: today, versions: [{ ...versionAt(plan, today), from: today }], pauses: [], id: '__draft' };
  const ctx = { U, ledger: rangesToBits(state.ledger, U.N), log: [] };
  if (plan.period === 'week') {
    const R = pool(draft, ctx);
    if (!R.length) return null;
    const v = draft.versions[0];
    const info = U.unit[v.unit];
    let w = 0;
    for (const g of R) w += 1 / info.size[info.uid[g]];
    return addDays(weekStartOf(today), 7 * Math.max(1, Math.ceil(w / v.amount - EPS)) - 1);
  }
  for (const row of walkDaily(draft, ctx, 20000)) if (row.last) return row.day;
  return null;
}
