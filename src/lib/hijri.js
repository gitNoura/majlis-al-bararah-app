// The Hijri calendar, for the country the member lives in.
//
// Each country announces the start of the Hijri months itself (the new moon is sighted, or not),
// so no formula gives every country's dates. The calendar starts from Umm al-Qura (Saudi Arabia's
// calendar, built into the browser), moves it by the country's usual difference (USUAL below,
// e.g. Morocco usually one day after), and the member can move it one more day either way when
// their country announces differently ('hijriAdjust', kept on this device).
//
// The country: the member's profile (profiles.country), otherwise a guess from the device (its time
// zone, then its language's region).
import { getLocales } from 'expo-localization';
import { L } from '../i18n/i18n.js';
import { MONTHS_FR } from '../i18n/i18n-fr.js';
import { readJSON } from './storage.js';

const DAY = 86400000;

// ---------- The country ----------

// Every country the browser can name, as [code, name], in the reader's language, sorted by name
export function countries() {
  const names = new Intl.DisplayNames([L('ar', 'en', 'fr')], { type: 'region' });
  const list = [];
  for (let a = 65; a <= 90; a++)
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      if (['EU', 'EZ', 'UN', 'QO', 'ZZ', 'AQ', 'BV', 'HM', 'TF', 'UM', 'CP', 'DG', 'EA', 'IC', 'TA', 'AC', 'XK'].includes(code)) continue;
      let name;
      try {
        name = names.of(code);
      } catch {
        continue;
      }
      if (name && name !== code) list.push([code, name]);
    }
  return list.sort((x, y) => x[1].localeCompare(y[1], L('ar', 'en', 'fr')));
}

export function countryName(code) {
  try {
    return new Intl.DisplayNames([L('ar', 'en', 'fr')], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

// The device's country: its time zone (the surest sign), then the region of its language
const ZONES = {
  'Africa/Casablanca': 'MA', 'Africa/El_Aaiun': 'MA', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN',
  'Africa/Tripoli': 'LY', 'Africa/Cairo': 'EG', 'Africa/Khartoum': 'SD', 'Africa/Nouakchott': 'MR',
  'Africa/Dakar': 'SN', 'Africa/Lagos': 'NG', 'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Aden': 'YE', 'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB', 'Asia/Damascus': 'SY', 'Asia/Baghdad': 'IQ', 'Asia/Gaza': 'PS', 'Asia/Hebron': 'PS',
  'Asia/Karachi': 'PK', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Dhaka': 'BD', 'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Tehran': 'IR', 'Europe/Istanbul': 'TR', 'Europe/Paris': 'FR',
  'Europe/London': 'GB', 'Europe/Madrid': 'ES', 'Europe/Brussels': 'BE', 'Europe/Amsterdam': 'NL',
  'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'America/Toronto': 'CA', 'America/New_York': 'US',
  'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
};

export function deviceCountry() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (ZONES[zone]) return ZONES[zone];
  } catch {}
  // the phone's own languages and region
  for (const locale of getLocales()) {
    if (locale.regionCode) return locale.regionCode;
  }
  return 'SA';
}

// The member's country (saved with their profile), else the device's
export function calendarCountry() {
  const country = readJSON('mjProfile')?.country;
  if (country) return country;
  return deviceCountry();
}

// ---------- The days ----------

// The country's usual difference from Umm al-Qura, in days (its new months usually begin a day
// later). Others: 0. The member's own adjustment covers the rest.
const USUAL = { MA: -1, PK: -1, IN: -1, BD: -1 };

export function adjustment() {
  try {
    const n = parseInt(localStorage.getItem('hijriAdjust'), 10);
    return n >= -1 && n <= 1 ? n : 0;
  } catch {
    return 0;
  }
}

export function setAdjustment(n) {
  try {
    if (n) localStorage.setItem('hijriAdjust', String(n));
    else localStorage.removeItem('hijriAdjust');
  } catch {}
}

const shift = (country) => (USUAL[country] ?? 0) + adjustment();

// A Gregorian date at noon (no time zone or summer-time surprises), and n days later
export const noon = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
export const addDays = (d, n) => new Date(d.getTime() + n * DAY);

// Umm al-Qura, as the phone's own calendars know it - when they do: the JavaScript engine of the app
// (Hermes) may not have the Islamic calendars on every phone. Checked once on a known day (26 October
// 2026 is in 1448); without it, the arithmetical Islamic calendar below (within a day of Umm al-Qura,
// and the reader can move it a day either way in the settings).
const UMM_AL_QURA = (() => {
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const year = f.formatToParts(new Date(2026, 9, 26, 12)).find((p) => p.type === 'year');
    return Number(year?.value) === 1448 ? f : null;
  } catch {
    return null;
  }
})();

// The arithmetical (civil) Islamic calendar, from the Julian day number
function tabular(date) {
  const jd = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY) + 2440588;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l) / 709);
  return { y: 30 * n + j - 30, m, d: l - Math.floor((709 * m) / 24) };
}

// The Hijri date of a Gregorian day in the country: { y, m, d } (m 1-12)
export function hijri(date, country = calendarCountry()) {
  const day = addDays(noon(date), shift(country));
  if (!UMM_AL_QURA) return tabular(day);
  const parts = UMM_AL_QURA.formatToParts(day);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const index = (h) => h.y * 12 + h.m;

// The Gregorian day of a Hijri date in the country, or null (e.g. a 30th in a 29-day month)
export function gregorian(y, m, d, country = calendarCountry()) {
  const today = noon(new Date());
  const now = hijri(today, country);
  let date = addDays(today, Math.round((index({ y, m }) - index(now)) * 29.5306 + (d - now.d)));
  for (let i = 0; i < 6; i++) {
    const h = hijri(date, country);
    const diff = (index(h) - index({ y, m })) * 30 + (h.d - d);
    if (diff === 0) return date;
    date = addDays(date, diff > 0 ? -1 : 1);
  }
  return null;
}

// The days of a Hijri month, as Gregorian dates
export function monthDays(y, m, country = calendarCountry()) {
  const first = gregorian(y, m, 1, country);
  const days = [];
  for (let date = first; days.length < 30; date = addDays(date, 1)) {
    if (hijri(date, country).m !== m) break;
    days.push(date);
  }
  return days;
}

const MONTHS = [
  ['محرّم', 'Muharram'],
  ['صفر', 'Safar'],
  ['ربيع الأول', 'Rabi al-Awwal'],
  ['ربيع الآخر', 'Rabi al-Akhir'],
  ['جمادى الأولى', 'Jumada al-Ula'],
  ['جمادى الآخرة', 'Jumada al-Akhirah'],
  ['رجب', 'Rajab'],
  ['شعبان', 'Shaban'],
  ['رمضان', 'Ramadan'],
  ['شوّال', 'Shawwal'],
  ['ذو القعدة', 'Dhul-Qadah'],
  ['ذو الحجّة', 'Dhul-Hijjah'],
];

export const monthName = (m) => L(...MONTHS[m - 1], MONTHS_FR[m - 1]);

// ---------- The occasions ----------

// The main occasions shared by Muslims everywhere: [month, day, key in i18n]
const OCCASIONS = [
  [1, 1, 'calNewYear'],
  [1, 10, 'calAshura'],
  [9, 1, 'calRamadan'],
  [9, 27, 'calQadr'],
  [10, 1, 'calFitr'],
  [12, 9, 'calArafah'],
  [12, 10, 'calAdha'],
];

export const occasionOn = (h) => OCCASIONS.find(([m, d]) => m === h.m && d === h.d)?.[2] ?? null;

// ---------- The fasts ----------

// A day's fast, from its Hijri date and its weekday: Ramadan (obligatory), and the sunnah fasts - the
// day of Arafah, Tasu'a and Ashura (9 and 10 Muharram), the three white days (13, 14 and 15 of each
// month), every Monday and Thursday, and the six days of Shawwal (any six after the Eid: «loose», not
// marked day by day). Never on the two Eids nor on the days of Tashreeq (11-13 Dhul-Hijjah), when
// fasting is forbidden. { key (i18n), fard?, loose? } or null.
export function fastOn(h, date) {
  if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return null;
  if (h.m === 9) return { key: 'fastRamadan', fard: true };
  if (h.m === 12 && h.d === 9) return { key: 'fastArafah' };
  if (h.m === 1 && h.d === 9) return { key: 'fastTasua' };
  if (h.m === 1 && h.d === 10) return { key: 'fastAshura' };
  if (h.d >= 13 && h.d <= 15) return { key: 'fastWhite' };
  if (date.getDay() === 1) return { key: 'fastMonday' };
  if (date.getDay() === 4) return { key: 'fastThursday' };
  if (h.m === 10) return { key: 'fastShawwal', loose: true };
  return null;
}

// The fasts to come within `span` days (today included), soonest first: [{ date, h, fast, days }].
// Ramadan counts once, on its first day (or today, during it); the six days of Shawwal are not listed.
export function upcomingFasts(span = 60, country = calendarCountry()) {
  const today = noon(new Date());
  const list = [];
  for (let i = 0; i < span; i++) {
    const date = addDays(today, i);
    const h = hijri(date, country);
    const fast = fastOn(h, date);
    if (!fast || fast.loose || (fast.fard && h.d !== 1 && i > 0)) continue;
    list.push({ date, h, fast, days: i });
  }
  return list;
}

// The next time each occasion comes (today included), soonest first: [{ key, h, date, days }]
export function upcoming(country = calendarCountry()) {
  const today = noon(new Date());
  const now = hijri(today, country);
  return OCCASIONS.map(([m, d, key]) => {
    let y = now.y;
    if (m < now.m || (m === now.m && d < now.d)) y += 1;
    const date = gregorian(y, m, d, country);
    return date && { key, h: { y, m, d }, date, days: Math.round((date - today) / DAY) };
  })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);
}
