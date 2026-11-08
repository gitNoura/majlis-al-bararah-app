// Text search over the text of every ayah of the narration read (the website's src/reader/search.js:
// its /data/search.json for Warsh, /data/search-hafs.json for Hafs, fetched on first use).
//
// People type without tashkeel and in ordinary spelling, while the mushaf text is fully voweled Warsh
// spelling (يُومِنُونَ, بِيسَ, ءَامَنُواْ, اَ۬لصَّلَوٰةَ). So both the text and the query are reduced the
// same way, in levels from strict to loose; results of stricter levels come first.
//   1. letters only: no tashkeel or Quranic marks; أ إ آ ٱ are written ا and ء is dropped.
//      Every other letter stays itself: ى/ي, ة/ه, ؤ/و, ئ/ي (the Warsh final ے is a ي).
// For queries of 3+ letters, looser levels add what Warsh spells differently:
//   2. hamza seats as plain letters (ؤ = و, ئ = ي): يؤمنون finds يُومِنُونَ, بئس finds بِيسَ
//   3. the same without alif: the dagger alif of العَٰلَمِينَ and a written alif compare equal
//   4. consonants only (no alif, waw, ya), when 4+ remain and nothing else was found:
//      الصلاة finds اَ۬لصَّلَوٰةَ
// Typing "48:11" goes straight to an ayah.
import { HAFS } from './riwaya.js';
import { fetchData } from './remote.js';

export const MAX_SHOWN = 100;

// Marks that are not letters: tashkeel, dagger alif, Quranic annotation signs, tatweel, digits
// (written as codes: combining marks typed as themselves can be reordered by an editor)
const MARK = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿـ٠-٩]/;
const LETTER_FORMS = { 'ٱ': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ے': 'ي', 'ۓ': 'ئ', 'ک': 'ك', 'ی': 'ي' };
// Some keyboards type ئ as ي + a hamza mark (and ؤ as و + hamza): join them into one letter.
const WITH_HAMZA = { 'ي': 'ئ', 'ى': 'ئ', 'ی': 'ئ', 'و': 'ؤ', 'ا': 'أ' };
const SEATS = { 'ؤ': 'و', 'ئ': 'ي' };
const LEVELS = [
  { seats: false, drop: new Set(['ء']), min: 1 },
  { seats: true, drop: new Set(['ء']), min: 3 },
  { seats: true, drop: new Set(['ء', 'ا']), min: 3 },
  { seats: true, drop: new Set(['ء', 'ا', 'و', 'ي']), min: 4, last: true },
];

// Reduce text for one level. map[i] = position in the original text of reduced character i.
function reduce(text, level) {
  const { seats, drop } = LEVELS[level];
  let out = '';
  const map = [];
  let space = true; // collapse runs of spaces, no leading space
  for (let i = 0; i < text.length; i++) {
    const start = i;
    let c = text[i];
    if (WITH_HAMZA[c] && (text[i + 1] === 'ٔ' || text[i + 1] === 'ٕ')) {
      c = WITH_HAMZA[c];
      i++;
    }
    if (MARK.test(c)) continue;
    c = LETTER_FORMS[c] ?? c;
    if (seats) c = SEATS[c] ?? c;
    if (drop.has(c)) continue;
    if (/\s/.test(c)) {
      if (space) continue;
      c = ' ';
      space = true;
    } else {
      space = false;
    }
    out += c;
    map.push(start);
  }
  if (out.endsWith(' ')) {
    out = out.slice(0, -1);
    map.pop();
  }
  return { text: out, map };
}

let entries = null; // [{ s, a, text, shown, map, levels: [{text, map}, ...] }]

// The text of every ayah, fetched once (about 1.5 MB, 2 MB for Hafs)
export async function loadSearch() {
  if (!entries) {
    const rows = await fetchData(HAFS ? 'search-hafs' : 'search');
    entries = rows.map(([s, a, text, shown, map]) => ({ s, a, text, shown, map, levels: LEVELS.map((_, l) => reduce(text, l)) }));
  }
  return entries;
}

// Every match in reading order, stricter levels first: [{ entry, ranges: [[from, to], ...] }].
function find(query) {
  const found = new Map(); // "s:a" -> result
  for (let level = 0; level < LEVELS.length; level++) {
    const q = reduce(query, level).text;
    if (q.replace(/ /g, '').length < LEVELS[level].min) continue; // too loose for short queries
    if (LEVELS[level].last && found.size) break; // the loosest level only when nothing else matched
    for (const entry of entries) {
      const key = `${entry.s}:${entry.a}`;
      if (found.has(key)) continue;
      const { text, map } = entry.levels[level];
      const ranges = [];
      for (let i = text.indexOf(q); i !== -1; i = text.indexOf(q, i + q.length)) {
        ranges.push([map[i], map[i + q.length - 1] + 1]);
      }
      if (ranges.length) found.set(key, { entry, ranges, level });
    }
  }
  return [...found.values()].sort((x, y) => x.level - y.level || x.entry.s - y.entry.s || x.entry.a - y.entry.a);
}

// What a query finds: { kind: 'help' } (nothing typed), { kind: 'ayah', matches, missing } ("48:11"),
// or { kind: 'text', matches } - matches: [{ entry, ranges }]
export function search(query) {
  query = query.trim();
  if (!query || !entries) return { kind: 'help', matches: [] };
  // "48:11", "48 11" or "٤٨:١١" -> that ayah
  const numbers = query.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).match(/^(\d{1,3})\s*[:：.\s]\s*(\d{1,3})$/);
  if (numbers) {
    const entry = entries.find((e) => e.s === +numbers[1] && e.a === +numbers[2]);
    return { kind: 'ayah', matches: entry ? [{ entry, ranges: [] }] : [], missing: !entry };
  }
  return { kind: 'text', matches: find(query) };
}

// The KFGQPC text is made for the KFGQPC font, which draws ف and ق in the Maghribi style. Results use a
// standard Naskh font instead, so a few KFGQPC-specific codes are swapped for the standard Unicode
// characters (one for one, so match positions stay the same): open tanween, and the final ے (a ي).
const DISPLAY = { 'ٗ': 'ࣰ', 'ٞ': 'ࣱ', 'ٖ': 'ࣲ', 'ے': 'ي' };
export const forDisplay = (t) => t.replace(/[ٖٗٞے]/g, (c) => DISPLAY[c]);

// Hafs rows keep the plain spelling (entry.text) for matching and the voweled text (entry.shown) for
// display. A match is found on the plain text, then mapped to the same word(s) of the voweled text;
// null when the two texts do not line up word for word.
const wordSpans = (text) => [...text.matchAll(/\S+/g)].map((m) => [m.index, m.index + m[0].length]);

function onShown(entry, ranges) {
  const plain = wordSpans(entry.text);
  const shown = wordSpans(entry.shown);
  // Ayat where the two spellings split words differently carry entry.map (plain word -> voweled word).
  const toShown = entry.map ?? (plain.length === shown.length ? plain.map((_, i) => i) : null);
  if (!toShown || toShown.length !== plain.length || toShown.some((i) => i >= shown.length)) return null;
  const out = [];
  for (const [from, to] of ranges) {
    const first = plain.findIndex(([, end]) => end > from);
    const last = plain.findLastIndex(([start]) => start < to);
    if (first === -1 || last < first) continue;
    const range = [shown[toShown[first]][0], shown[toShown[last]][1]];
    const prev = out[out.length - 1];
    if (prev && prev[1] >= range[0]) prev[1] = Math.max(prev[1], range[1]);
    else out.push(range);
  }
  return out;
}

// The ayah text cut into pieces, the matches marked: [{ text, mark }] (a match's tashkeel included)
export function pieces(entry, ranges) {
  let text = entry.text;
  if (entry.shown) {
    const mapped = onShown(entry, ranges);
    if (mapped) {
      text = entry.shown;
      ranges = mapped;
    }
  }
  text = forDisplay(text.replace(/\s*[٠-٩]+\s*$/, '')); // without the ayah number at the end
  const out = [];
  let at = 0;
  for (let [from, to] of ranges) {
    if (from >= text.length) break;
    // A match that starts just after a word-initial alif or hamza (skipped by the looser levels, as
    // in اَ۬لصَّلَوٰةَ or ءَامَنُواْ) is widened to include it.
    let k = from;
    while (k > at && MARK.test(text[k - 1])) k--;
    if (k > at && /[ءآأإاٱ]/.test(text[k - 1]) && (k - 1 === at || /\s/.test(text[k - 2]))) from = k - 1;
    while (to < text.length && MARK.test(text[to])) to++;
    if (from > at) out.push({ text: text.slice(at, from), mark: false });
    out.push({ text: text.slice(from, to), mark: true });
    at = to;
  }
  if (at < text.length) out.push({ text: text.slice(at), mark: false });
  return out;
}

export const EXAMPLES = ['الرحمن الرحيم', 'يومنون بالغيب', '48:11', '112:1'];
