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

// How far the reader is through their plans, 0..1 (null with no plan): a weekly plan counts this week's units,
// a memorizing plan its days done out of all its days, a revision plan the current round. Averaged over the
// plans running today.
export function planProgress() {
  const day = today();
  const cx = core.ctxOf(state, U);
  const parts = [];
  for (const p of state.plans) {
    if (day < p.start || core.isPaused(p, day)) continue;
    if (p.period === 'week') {
      const r = core.weekRow(p, cx, day);
      if (r && r.quota) parts.push(Math.min(1, r.done / r.quota));
      continue;
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
    if (total) parts.push(done / total);
  }
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
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
