// Checks the thumun / hizb / juz structure of the Warsh data. Run: node scripts/check-boundaries.mjs
import fs from 'node:fs';
const u = JSON.parse(fs.readFileSync('assets/data/hifz-units.json', 'utf8'));
const q = fs.readFileSync('src/lib/quran.js', 'utf8');
const S = u.surah, PG = u.pg, TH = u.thumun;
const pairs = (name) => [...q.match(new RegExp(name + ' = \\[(.*?)\\];', 's'))[1].matchAll(/\[(\d+),\s*(\d+)\]/g)].map((m) => [+m[1], +m[2]]);
const nums = (name) => [...q.match(new RegExp(name + ' = \\[(.*?)\\];', 's'))[1].matchAll(/\d+/g)].map((m) => +m[0]);
const HS = pairs('HIZB_STARTS'), HP = nums('HIZB_PAGES_WARSH');
const idx = (s, a) => S[s - 1] + a - 1;
// PG[k] = first ayah index of page k + 1
const page = (i) => PG.findIndex((p, k) => p <= i && (PG[k + 1] === undefined || i < PG[k + 1])) + 1;
const errors = [];
const err = (m) => errors.push(m);
if (TH.length !== 481) err(`thumun array has ${TH.length} entries, expected 481 (480 starts + end)`);
if (TH[480] !== S[114]) err('last thumun entry is not the end of the Quran');
for (let i = 1; i < TH.length; i++) if (TH[i] <= TH[i - 1]) err(`thumun ${i} does not start after thumun ${i - 1}`);
if (HS.length !== 60 || HP.length !== 60) err('HIZB_STARTS / HIZB_PAGES_WARSH must have 60 entries');
for (let h = 0; h < 60; h++) {
  if (idx(...HS[h]) !== TH[h * 8]) err(`hizb ${h + 1}: HIZB_STARTS ${HS[h]} is not thumun ${h * 8 + 1}`);
  const p = page(TH[h * 8]);
  if (p !== HP[h]) err(`hizb ${h + 1}: starts on page ${p} by the ayah data but HIZB_PAGES_WARSH says ${HP[h]}`);
}
for (let j = 0; j < 30; j++) if (TH[j * 16] !== TH[(j * 2) * 8]) err(`juz ${j + 1} does not start with hizb ${j * 2 + 1}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('OK: 480 thumun, 60 hizb, 30 juz are consistent.');
