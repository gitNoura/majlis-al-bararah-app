// The memorization plan (الحفظ), kept on the device (localStorage, like the wird and the saved hadiths).
// The arithmetic is in src/hifz/hifz-core.js; the screens are in src/hifz/hifz.js.
//
// One saved value, 'hifz2': { v: 2, ledger, plans, log, settings } - see hifz-core.js for the shapes.
// Nothing leaves the device.
import { readJSON, writeJSON } from '../storage.js';
import UNITS_RAW from '../../../assets/data/hifz-units.json';
import * as core from './core.js';

const KEY = 'hifz2';
export const TOTAL_AYAT = 6214;

let state = null;
let U = null;

const clean = (s) => ({
  ...core.emptyState(),
  ...(s && s.v === 2 ? s : {}),
  settings: { ...(s?.settings || {}), dayStart: 0 }, // the day always starts at midnight
});

// The ayah table (assets/data/hifz-units.json, bundled: 6 KB) and the saved state. Synchronous in the
// app; ready() stays a promise so the page's code reads as on the website.
function init() {
  if (U) return;
  U = core.makeUnits(UNITS_RAW);
  state = clean(readJSON(KEY));
}

export function ready() {
  init();
  return Promise.resolve();
}

export const units = () => U;
export const get = () => state;
const save = () => writeJSON(KEY, state);

// ---------- The day ----------

export const today = () => core.sessionDay(new Date(), 0);

// ---------- The ledger and the ring ----------

export const memorizedCount = () => state.ledger.reduce((n, [a, b]) => n + b - a, 0);

// What the ring shows: memorized ayat out of all ayat. The one place that decides how it is counted.
export const ringPercent = () => Math.round(core.ringFraction(memorizedCount(), U?.N ?? TOTAL_AYAT) * 100);

// How far one plan is through its own run, as { done, total, daily } (null when it has nothing to count: not started yet,
// paused, or nothing to walk). A weekly plan counts this week's units; a memorizing plan its days done out of all its
// days; a revision plan the current round.
function progressOf(p, day, cx) {
  if (day < p.start || core.isPaused(p, day)) return null;
  if (p.period === 'week') {
    const r = core.weekRow(p, cx, day);
    return r && r.quota ? { done: Math.min(r.quota, r.done), total: r.quota, daily: false } : null;
  }
  let total = 0;
  let done = 0;
  if (p.type === 'revise') {
    let cycle = null;
    for (const row of core.walkDaily(p, cx)) {
      if (row.day <= day && row.cycle !== cycle) {
        cycle = row.cycle; // a new round began on or before today: count from its first day
        total = 0;
        done = 0;
      } else if (row.cycle !== cycle) break; // the next round starts after today
      total++;
      if (row.status === 'done' || row.status === 'partial') done++;
    }
  } else {
    for (const row of core.walkDaily(p, cx)) {
      total++;
      if (row.status === 'done' || row.status === 'partial') done++;
    }
  }
  return total ? { done, total, daily: true } : null;
}

// The plans running today (all of them, or only those of one `type`: 'memorize' or 'revise'), each with its progress.
function running(type) {
  const day = today();
  const cx = core.ctxOf(state, U);
  const parts = [];
  for (const p of state.plans) {
    if (type && p.type !== type) continue;
    const x = progressOf(p, day, cx);
    if (x) parts.push(x);
  }
  return parts;
}

// How far the reader is through their plans, 0..1 (null with no plan running), averaged over the plans running today.
// Give a `type` ('memorize' or 'revise') to count only the plans of that kind.
export function planProgress(type) {
  const parts = running(type);
  return parts.length ? parts.reduce((a, x) => a + x.done / x.total, 0) / parts.length : null;
}

// The days done out of all the days, for the plans of one `type` (null unless every one of them is a daily plan: a
// weekly plan counts units, which do not add up to days).
export function planDays(type) {
  const parts = running(type);
  if (!parts.length || parts.some((x) => !x.daily)) return null;
  return { done: parts.reduce((a, x) => a + x.done, 0), total: parts.reduce((a, x) => a + x.total, 0) };
}

// For the profile page, without loading the ayah table: the same figure as a fraction.
export function savedFraction() {
  const s = readJSON(KEY);
  if (!s || s.v !== 2) return 0;
  return core.ringFraction(s.ledger.reduce((n, [a, b]) => n + b - a, 0), TOTAL_AYAT);
}

// ---------- Plans ----------

export const planById = (id) => state.plans.find((p) => p.id === id);

export function savePlan(plan) {
  const i = state.plans.findIndex((p) => p.id === plan.id);
  if (i < 0) state.plans.push(plan);
  else state.plans[i] = plan;
  save();
}

export const newPlanId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function deletePlan(id) {
  state.plans = state.plans.filter((p) => p.id !== id);
  state.log = state.log.filter((e) => e.plan !== id); // its sessions go, what they put in the ledger stays
  save();
}

export function setPaused(id, paused) {
  const p = planById(id);
  if (!p) return;
  p.pauses ||= [];
  if (paused && !core.pausedNow(p)) p.pauses.push({ from: today(), to: null });
  if (!paused) for (const x of p.pauses) if (!x.to) x.to = today();
  save();
}

// ---------- Sessions ----------

export const todayRows = () => core.todayRows(state, U, today());
export const upcomingRows = () => core.upcomingRows(state, U, today());
export const history = () => core.historyDays(state, U, today());

// outcome: 'done' | 'partial' (with options.stop) | 'notdone' | 'untouched'
export function mark(row, outcome, options = {}) {
  core.setOutcome(state, U, row, outcome, options);
  save();
}

export function logExtra(ranges) {
  core.logExtra(state, ranges, today());
  save();
}

export function removeEntry(id) {
  core.removeLogEntry(state, U, id);
  save();
}

// ---------- Pace ----------

export const ctx = () => core.ctxOf(state, U);
export const forecast = (plan) => core.forecast(state, U, plan, today());
