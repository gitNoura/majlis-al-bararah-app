// Engine checks for the plan: juz as a unit, block paces (1 juz a week cut by page), and whole-unit paces.
// Run: node scripts/test-hifdh-plan.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const core = await import(pathToFileURL(resolve('src/lib/hifdh/core.js')).href);
const raw = JSON.parse(readFileSync('assets/data/hifz-units.json', 'utf8'));
const U = core.makeUnits(raw);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };

// ---- units
ok(U.unit.juz.count === 30 && U.unit.hizb.count === 60 && U.unit.thumun.count === 480, 'juz 30, hizb 60, thumun 480');
ok(U.unit.juz.start[0] === 0 && U.unit.juz.size.reduce((a, b) => a + b, 0) === U.N, 'juz units cover every ayah');
ok(U.juzOf(U.unit.juz.start[1]) === 2, 'juzOf agrees with the juz unit');

const mkPlan = (v, extra = {}) => ({ id: 'p1', type: 'memorize', period: 'day', range: null, start: '2026-11-09', target: null, pauses: [], versions: [{ from: '2026-11-09', ...v }], ...extra });
const ctx = (log = []) => ({ U, ledger: new Uint8Array(U.N), log });
const rowsOf = (p, c, n) => { const out = []; for (const r of core.walkDaily(p, c)) { out.push(r); if (out.length >= n) break; } return out; };
const pagesOf = (r) => { const ids = core.idsOf(r.segs); return new Set(ids.map((g) => U.pageOf[g])); };
const ayat = (r) => core.sizeOf(r.segs);

// ---- 2026-11-09 is a Monday. 1 juz a week, every day, divided by page
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [0, 1, 2, 3, 4, 5, 6], divide: 'page' });
  const rows = rowsOf(p, ctx(), 14);
  const week1 = rows.slice(0, 7);
  const juz1pages = new Set(core.idsOf([[U.unit.juz.start[0], U.unit.juz.start[1]]]).map((g) => U.pageOf[g])).size;
  const counts = week1.map((r) => pagesOf(r).size);
  console.log('   juz 1 pages', juz1pages, 'week 1 pages per day', counts.join(','));
  ok(counts.reduce((a, b) => a + b, 0) === juz1pages, 'week 1 covers exactly juz 1');
  ok(Math.max(...counts) - Math.min(...counts) <= 1 && counts.every((x, i) => i === 0 || x <= counts[i - 1]), 'extra pages go to the first days');
  ok(week1.every((r, i) => i === 0 || core.idsOf(r.segs)[0] === core.idsOf(week1[i - 1].segs).pop() + 1), 'days are consecutive with no gap or overlap');
  const w2 = rows.slice(7, 14);
  ok(core.idsOf(w2[0].segs)[0] === U.unit.juz.start[1], 'week 2 starts exactly at juz 2');
  ok(core.idsOf(week1[6].segs).pop() === U.unit.juz.start[1] - 1, 'week 1 ends where juz 1 ends');
  ok(week1.every((r) => core.shownUnit(r.version) === 'page'), 'cards are told in pages');
}

// ---- the reader sets each day's pages: Mon 5, Tue 2, Wed 4 (the last planned day takes the rest of the juz)
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [1, 2, 3], divide: 'page', perDay: { 1: 5, 2: 2, 3: 4 } });
  const rows = rowsOf(p, ctx(), 6);
  const w1 = rows.slice(0, 3).map((r) => pagesOf(r).size);
  console.log('   set pages per day', w1.join(','));
  ok(w1[0] === 5 && w1[1] === 2, 'days take the pages the reader set');
  ok(core.idsOf(rows[2].segs).pop() === U.unit.juz.start[1] - 1, 'the last day takes the rest, so the week ends with the juz');
  ok(core.idsOf(rows[3].segs)[0] === U.unit.juz.start[1], 'next week starts at juz 2');
  const q = mkPlan({ unit: 'juz', amount: 1, days: [1, 2], divide: 'page', perDay: { 1: 30, 2: 5 } });
  const r2 = rowsOf(q, ctx(), 3);
  ok(r2[0].day === '2026-11-09' && core.idsOf(r2[0].segs).pop() === U.unit.juz.start[1] - 1 && r2[1].day === '2026-11-16', 'a day set above what is left takes the juz; later days that week have nothing');
}

// ---- half amounts: 0.5 juz a week; 2.5 pages on a day
{
  const p = mkPlan({ unit: 'juz', amount: 0.5, days: [1, 2, 3, 4, 5], divide: 'page' });
  const rows = rowsOf(p, ctx(), 10);
  const w1 = rows.slice(0, 5).reduce((a, r) => a + ayat(r), 0);
  ok(Math.abs(w1 / U.unit.juz.size[0] - 0.5) < 0.06, `0.5 juz a week gives about half a juz in week 1 (${(w1 / U.unit.juz.size[0]).toFixed(2)})`);
  ok(core.idsOf(rows[5].segs)[0] === core.idsOf(rows[4].segs).pop() + 1, 'week 2 carries on right after week 1');
  const q = mkPlan({ unit: 'juz', amount: 1, days: [1, 2], divide: 'page', perDay: { 1: 2.5, 2: 4 } });
  const r = rowsOf(q, ctx(), 2);
  ok(pagesOf(r[0]).size === 3 && pagesOf(r[1]).size >= 4, 'a day set to 2.5 pages touches 3 pages');
  const e = core.evenSplit(3.5, [1, 2, 3], 0.5);
  ok(e[1] === 1.5 && e[2] === 1 && e[3] === 1, 'evenSplit shares 3.5 as 1.5, 1, 1');
  const h = mkPlan({ unit: 'hizb', amount: 0.5, days: [1, 2, 3, 4, 5, 6, 0] });
  ok(Math.abs(ayat(rowsOf(h, ctx(), 1)[0]) / U.unit.hizb.size[0] - 0.5) < 0.06, '0.5 hizb a day (no division) is half a hizb');
}

// ---- 5 days a week, hizb divided by thumun; plan started on a Wednesday (a short first week)
{
  const p = mkPlan({ unit: 'hizb', amount: 1, days: [1, 2, 3, 4, 5], divide: 'thumun' }, { start: '2026-11-11' });
  p.versions[0].from = '2026-11-11';
  const rows = rowsOf(p, ctx(), 8);
  const wk1 = rows.filter((r) => r.day <= '2026-11-15');
  ok(wk1.length === 3, 'first week has Wed, Thu, Fri');
  ok(wk1.reduce((a, r) => a + ayat(r), 0) === U.unit.hizb.size[0], 'the short first week still covers the whole hizb');
  ok(core.idsOf(rows[3].segs)[0] === U.unit.hizb.start[1], 'next week starts at hizb 2');
}

// ---- fewer pieces than days: 1 hizb a week, divided by hizb, 5 days: the first day takes it, others have nothing
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [1, 2, 3], divide: 'hizb' });
  const rows = rowsOf(p, ctx(), 4);
  ok(rows.length === 4 && rows[0].day === '2026-11-09' && rows[1].day === '2026-11-10' && rows[2].day === '2026-11-16', 'juz by hizb over 3 days: 2 days a week have a row');
}

// ---- a day marked not done hands its portion to the next planned day of the week
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [0, 1, 2, 3, 4, 5, 6], divide: 'page' });
  const base = rowsOf(p, ctx(), 7);
  const log = [{ id: 'e1', ts: 1, day: '2026-11-09', plan: 'p1', outcome: 'notdone', seg: base[0].segs, end: null, added: [] }];
  const rows = rowsOf(p, ctx(log), 7);
  const sum = rows.filter((r) => r.day <= '2026-11-15').reduce((a, r) => a + ayat(r), 0);
  ok(rows[0].status === 'notdone', 'day 1 is marked not done');
  ok(core.idsOf(rows[1].segs)[0] === core.idsOf(base[0].segs)[0], 'its pages move to the next day');
  ok(sum - ayat(rows[0]) === U.unit.juz.size[0], 'the week still ends at the end of juz 1');
}

// ---- done on one day, stopped partway on another: the rest carries on
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [0, 1, 2, 3, 4, 5, 6], divide: 'page' });
  const base = rowsOf(p, ctx(), 7);
  const ids = core.idsOf(base[0].segs);
  const stop = ids[Math.floor(ids.length / 2)];
  const log = [{ id: 'e1', ts: 1, day: '2026-11-09', plan: 'p1', outcome: 'partial', seg: core.segsOf(ids.filter((g) => g <= stop)), end: stop, added: [] }];
  const rows = rowsOf(p, ctx(log), 7);
  ok(core.idsOf(rows[1].segs)[0] === stop + 1, 'the rest of a partial day starts the next day');
}

// ---- revision with a block pace keeps cycling
{
  const p = mkPlan({ unit: 'juz', amount: 1, days: [0, 1, 2, 3, 4, 5, 6], divide: 'page' }, { type: 'revise', range: [[0, U.unit.juz.start[3]]] });
  const rows = rowsOf(p, ctx(), 28);
  ok(rows.length === 28 && new Set(rows.map((r) => r.cycle)).size >= 2, 'revision of 3 juz repeats after 3 weeks');
  ok(rows[0].n > 0, 'revision has a «day k of n» length');
}

// ---- forecast: whole Quran at 1 juz a week = 30 weeks
{
  const st = { ...core.emptyState(), plans: [mkPlan({ unit: 'juz', amount: 1, days: [0, 1, 2, 3, 4, 5, 6], divide: 'page' })] };
  const f = core.forecast(st, U, st.plans[0], '2026-11-09');
  ok(f === core.addDays(core.weekStartOf('2026-11-09'), 7 * 30 - 1), `forecast is the end of week 30 (${f})`);
}

// ---- legacy paces still work (no divide)
{
  const p = mkPlan({ unit: 'thumun', amount: 2, days: [1, 3, 5] });
  const rows = rowsOf(p, ctx(), 3);
  ok(rows.every((r) => core.shownUnit(r.version) === 'thumun') && rows[0].segs[0][0] === 0, 'a plain 2 thumun a day plan is unchanged');
  const q = mkPlan({ unit: 'juz', amount: 1, days: [1, 3, 5] }); // «keep whole»: a juz on each planned day
  const r2 = rowsOf(q, ctx(), 2);
  ok(core.sizeOf(r2[0].segs) === U.unit.juz.size[0] && core.sizeOf(r2[1].segs) === U.unit.juz.size[1], 'a whole juz a day is a real unit now');
  ok(core.isBlock({ unit: 'juz', divide: 'juz' }) === false && core.isBlock({ unit: 'page', divide: 'hizb' }) === false, 'divide must be a smaller unit');
}

// ---- the full-Quran forecast by page edge: every ayah is read once in a pass
{
  const p = mkPlan({ unit: 'juz', amount: 2, days: [1, 2, 3, 4, 5], divide: 'page' });
  const seen = new Uint8Array(U.N);
  let dup = 0, days = 0;
  for (const r of core.walkDaily(p, ctx(), 3000)) { days++; for (const g of core.idsOf(r.segs)) { if (seen[g]) dup++; seen[g] = 1; } }
  ok(dup === 0 && seen.every((x) => x === 1), `2 juz a week by page covers all ${U.N} ayat once (${days} days)`);
}

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
