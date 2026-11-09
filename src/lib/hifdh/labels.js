// The words and small formatters of the Hifdh page (from src/hifz/hifz.js of the website): unit names,
// the name of a portion, dates, statuses. Strings are L(ar, en, fr) like the rest of the app.
import { L, LOCALE, surahName } from '../../i18n/i18n.js';
import { SURAHS } from '../quran.js';
import * as core from './core.js';
import * as plan from './plan.js';

export const s = (ar, en, fr = en) => L(ar, en, fr);
export const num = (n) => Number(Number(n).toFixed(2)).toLocaleString(LOCALE);
export const surahOfAyah = (g) => SURAHS[plan.units().surahOf[g]];
export const ayahLabel = (g) => `${surahName(surahOfAyah(g))} ${plan.units().ayahNumber(g)}`;

export const UNIT_NAME = {
  ayah: () => s('آية', 'Ayah', 'Verset'),
  page: () => s('صفحة', 'Page', 'Page'),
  thumun: () => s('ثمن', 'Thumun', 'Thumun'),
  hizb: () => s('حزب', 'Hizb', 'Hizb'),
  juz: () => s('جزء', 'Juz', 'Juz'),
};
export const UNIT_PLURAL = {
  ayah: () => s('آيات', 'ayat', 'versets'),
  page: () => s('صفحات', 'pages', 'pages'),
  thumun: () => s('أثمان', 'thumun', 'thumun'),
  hizb: () => s('أحزاب', 'hizb', 'hizb'),
  juz: () => s('أجزاء', 'juz', 'juz'),
};
export const UNIT_ONE = {
  ayah: () => s('آية', 'ayah', 'verset'),
  page: () => s('صفحة', 'page', 'page'),
  thumun: () => s('ثمن', 'thumun', 'thumun'),
  hizb: () => s('حزب', 'hizb', 'hizb'),
  juz: () => s('جزء', 'juz', 'juz'),
};
// Arabic counts read as Arabic does: «حزب واحد», «حزبان», «٣ أحزاب», «١٢ حزبًا»-style singular after ten, «نصف حزب»
const AR_ONE = { ayah: 'آية واحدة', page: 'صفحة واحدة', thumun: 'ثمن واحد', hizb: 'حزب واحد', juz: 'جزء واحد' };
const AR_TWO = { ayah: 'آيتان', page: 'صفحتان', thumun: 'ثمنان', hizb: 'حزبان', juz: 'جزءان' };
export const unitCount = (unit, n) => {
  if (LOCALE.startsWith('ar')) {
    if (n === 1) return AR_ONE[unit];
    if (n === 2) return AR_TWO[unit];
    if (n === 0.5) return `نصف ${UNIT_ONE[unit]()}`;
    if (n > 10 && Number.isInteger(n)) return `${num(n)} ${UNIT_ONE[unit]()}`;
  }
  return `${num(n)} ${n === 1 ? UNIT_ONE[unit]() : UNIT_PLURAL[unit]()}`;
};

// A thumun is told by its hizb first, then its place in it (1-8), never by its number in the whole Quran:
// { title: 'Hizb 2', sub: 'Thumun 1' }, { title: 'Hizb 1', sub: 'Thumun 3–5' }, and across hizb
// { title: 'Hizb 1 – Hizb 2', sub: 'Thumun 7 – Thumun 2' }. ua and ub are the first and last thumun (from 0).
// A card shows the two lines one under the other; a sentence joins them with « · » (thumunName).
export function thumunLines(ua, ub = ua) {
  const a = core.thumunParts(ua);
  const b = core.thumunParts(ub);
  const hz = (n) => s(`الحزب ${n}`, `Hizb ${n}`, `Hizb ${n}`);
  const th = (n) => s(`الثمن ${n}`, `Thumun ${n}`, `Thumun ${n}`);
  if (ua === ub) return { title: hz(a.hizb), sub: th(a.n) };
  if (a.hizb === b.hizb) return { title: hz(a.hizb), sub: s(`الأثمان ${a.n}–${b.n}`, `Thumun ${a.n}–${b.n}`, `Thumun ${a.n}–${b.n}`) };
  return { title: `${hz(a.hizb)} – ${hz(b.hizb)}`, sub: `${th(a.n)} – ${th(b.n)}` };
}
export function thumunName(ua, ub = ua) {
  const { title, sub } = thumunLines(ua, ub);
  return `${title} · ${sub}`;
}

// The portion's name in the unit it was planned in, as two lines for a card: «Hizb 2» then «Thumun 1» (sub is null
// for the other units): «Pages 22–31», «Al-Baqarah 213–215», «Hizb 5–6», «Juz 3».
export function portionLines(segs, unit) {
  const U = plan.units();
  const ids = core.idsOf(segs);
  if (!ids.length) return { title: '', sub: null };
  const a = ids[0];
  const b = ids[ids.length - 1];
  if (unit === 'ayah') {
    if (ids.length === 1) return { title: ayahLabel(a), sub: null };
    if (U.surahOf[a] === U.surahOf[b]) return { title: `${ayahLabel(a)}–${U.ayahNumber(b)}`, sub: null };
    return { title: `${ayahLabel(a)} – ${ayahLabel(b)}`, sub: null };
  }
  const info = U.unit[unit];
  if (unit === 'thumun') return thumunLines(info.uid[a], info.uid[b]);
  const from = info.label(info.uid[a]);
  const to = info.label(info.uid[b]);
  const one = { page: s('صفحة', 'Page'), hizb: s('الحزب', 'Hizb'), juz: s('الجزء', 'Juz') }[unit];
  const many = { page: s('الصفحات', 'Pages'), hizb: s('الأحزاب', 'Hizb'), juz: s('الأجزاء', 'Juz') }[unit];
  return { title: from === to ? `${one} ${from}` : s(`${many} من ${from} إلى ${to}`, `${many} ${from}–${to}`), sub: null };
}

// The day's range for a card, on two lines: the surah and the ayat («Surah Al-Baqarah, ayah 142 to 150»), and under it the
// portion in the unit the reader planned in (pages 22 to 31, hizb 2 · thumun 1, juz 3); the ayah unit has no second line.
export function rangeLines(segs, unit) {
  const U = plan.units();
  const ids = core.idsOf(segs);
  if (!ids.length) return { title: '', sub: null };
  const a = ids[0];
  const b = ids[ids.length - 1];
  const sa = surahName(surahOfAyah(a));
  const sb = surahName(surahOfAyah(b));
  const na = U.ayahNumber(a);
  const nb = U.ayahNumber(b);
  let title;
  if (a === b) title = s(`سورة ${sa}، الآية ${na}`, `${sa}, ayah ${na}`, `${sa}, verset ${na}`);
  else if (U.surahOf[a] === U.surahOf[b]) title = s(`سورة ${sa}، من الآية ${na} إلى ${nb}`, `${sa}, ayah ${na} to ${nb}`, `${sa}, versets ${na} à ${nb}`);
  else title = s(`من سورة ${sa}، الآية ${na}\nإلى سورة ${sb}، الآية ${nb}`, `${sa} ${na}\nto ${sb} ${nb}`, `${sa} ${na}\nà ${sb} ${nb}`);
  return { title, sub: unit === 'ayah' ? null : portionName(segs, unit) };
}

// The same on one line, for sentences and lists: «Hizb 2 · Thumun 1».
export function portionName(segs, unit) {
  const { title, sub } = portionLines(segs, unit);
  return sub ? `${title} · ${sub}` : title;
}

// «Starts at Al-Baqarah 142 · p. 22–31»: the exact pages the portion touches, worked out from its own ayat (the first
// and the last), not an average.
export const startsAt = (segs) => {
  const g = segs[0][0];
  const U = plan.units();
  const last = core.idsOf(segs).pop();
  const from = U.pageOf[g];
  const to = U.pageOf[last];
  return s(`يبدأ من ${ayahLabel(g)}`, `Starts at ${ayahLabel(g)}`, `Commence à ${ayahLabel(g)}`) + ` · ${s('ص', 'p.', 'p.')} ${from === to ? from : `${from}–${to}`}`;
};

export function rangeLabel(ranges, type) {
  const U = plan.units();
  if (!ranges) return type === 'revise' ? s('كل ما حفظتُه', 'Everything I know', 'Tout ce que je sais') : s('القرآن كله', 'The whole Quran', 'Tout le Coran');
  const norm = core.normRanges(ranges, U.N);
  if (!norm.length) return '—';
  const one = (a, b) => {
    const s0 = U.surahOf[a];
    const s1 = U.surahOf[b - 1];
    const whole = a === U.surahStart[s0] && b === U.surahStart[s1 + 1];
    if (whole) return s0 === s1 ? surahName(SURAHS[s0]) : `${surahName(SURAHS[s0])} – ${surahName(SURAHS[s1])}`;
    if (s0 === s1) return `${surahName(SURAHS[s0])} ${U.ayahNumber(a)}–${U.ayahNumber(b - 1)}`;
    return `${ayahLabel(a)} – ${ayahLabel(b - 1)}`;
  };
  const first = one(...norm[0]);
  return norm.length === 1 ? first : `${first} ${s(`و${norm.length - 1} أخرى`, `+ ${norm.length - 1} more`, `+ ${norm.length - 1}`)}`;
}

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // the week starts on Monday
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const PLAN_UNITS = ['ayah', 'page', 'thumun', 'hizb', 'juz']; // smallest to biggest (the order of core.UNITS)
export const weekdayName = (d, style = 'short') => new Date(2024, 0, 7 + d).toLocaleDateString(LOCALE, { weekday: style }); // 7 Jan 2024 is a Sunday
export const dayText = (day) => core.parseDay(day).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtDate = (day) => core.parseDay(day).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
export const monthName = (m) => new Date(2024, m, 1).toLocaleDateString(LOCALE, { month: 'long' });

export const perWord = (period) => (period === 'week' ? s('أسبوعيًا', 'a week', 'par semaine') : s('يوميًا', 'a day', 'par jour'));

export const paceText = (p) => {
  const v = core.versionAt(p, plan.today());
  const days = p.period === 'week' || v.days.length === 7 ? '' : ` · ${WEEK_ORDER.filter((d) => v.days.includes(d)).map((d) => weekdayName(d)).join(' ')}`;
  // shown as a week's amount, as it was asked (a daily plan's portion times its days)
  const weekly = p.period === 'week' ? v.amount : Math.round(core.weeklyTotal(v) * 100) / 100;
  return `${unitCount(v.unit, weekly)} ${perWord('week')}${days}`;
};

export const kindOf = (type) => (type === 'revise' ? s('مراجعة', 'Revision', 'Révision') : s('حفظ جديد', 'New memorization', 'Nouvelle mémorisation'));

// A portion counts as finished for the day when it is done (or stopped partway); a weekly plan when its quota is met.
export const isDone = (r) => (r.week != null ? Boolean(r.complete) : r.status === 'done' || r.status === 'partial');

export const weekLine = (row) => s(`أنجزتَ ${num(row.done)} من ${num(row.quota)} هذا الأسبوع`, `${num(row.done)} of ${num(row.quota)} this week`, `${num(row.done)} sur ${num(row.quota)} cette semaine`);

export const STATUS = {
  done: () => s('تمّ', 'Done', 'Fait'),
  partial: () => s('وقفتُ في أثنائها', 'Stopped partway', 'Arrêté en cours'),
  notdone: () => s('لم أتمّها', 'Marked not done', 'Marqué non fait'),
  untouched: () => s('لم تُسجَّل', 'Untouched', 'Non touché'),
};

// The last seven days' cycle: which ones had something done (Monday first)
export function weekInfo() {
  const today = plan.today();
  const kept = new Set();
  for (const d of plan.history()) if (d.extras.length || d.rows.some((r) => r.status === 'done' || r.status === 'partial')) kept.add(d.day);
  const off = (core.weekdayOf(today) - WEEK_ORDER[0] + 7) % 7;
  const days = Array.from({ length: 7 }, (_, i) => core.addDays(today, i - off));
  const started = plan.get().plans.map((p) => p.start).sort()[0] ?? null;
  return { days, kept, today, started };
}

// What the next planned days hold, for whoever has finished today's plan and wants to go on.
export function aheadRows() {
  const today = plan.today();
  const ctx = plan.ctx();
  const out = [];
  for (const p of core.activePlans(plan.get(), today)) {
    if (p.period === 'week') continue; // a weekly plan carries on by itself
    for (const r of core.walkDaily(p, ctx)) {
      if (r.day <= today) continue;
      out.push(r);
      if (r.status !== 'done' && r.status !== 'partial') break; // up to the first portion not done yet
    }
  }
  return out;
}

// A row from its key ("planId|day"), as the website's findRow
export function findRow(key) {
  const [id, day] = key.split('|');
  const p = plan.planById(id);
  if (!p) return null;
  const ctx = plan.ctx();
  if (p.period === 'week') return core.weekRow(p, ctx, plan.today());
  for (const r of core.walkDaily(p, ctx)) {
    if (r.day === day) return r;
    if (r.day > day) break;
  }
  return null;
}

export function historyRow(key) {
  const [id, day, entry] = key.split('|');
  return plan.history().find((d) => d.day === day)?.rows.find((r) => r.plan.id === id && (!entry || r.entry?.id === entry));
}
