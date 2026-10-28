// Prayer times, calculated on the device (the adhan library, MIT) for where the member is.
//
// The place: the phone's location when the member allows it (asked once, from the calendar), or
// a city they choose from CITIES; kept on this device ('prayerPlace'). Each country's own method
// (METHODS): Morocco the Ministry of Habous' angles (Fajr 19°, Isha 17°) and its precaution
// minutes. The times are calculated: the mosque's adhan comes first.
import { CalculationMethod, CalculationParameters, Coordinates, Madhab, PrayerTimes } from 'adhan';
import * as Location from 'expo-location';
import { isEnglish } from '../i18n/i18n.js';
import { calendarCountry } from './hijri.js';
import { readJSON, writeJSON } from './storage.js';

// [Arabic name, English name, latitude, longitude, country]
const CITIES = [
  ['الرباط', 'Rabat', 34.0209, -6.8416, 'MA'], ['سلا', 'Salé', 34.0531, -6.7985, 'MA'],
  ['الدار البيضاء', 'Casablanca', 33.5731, -7.5898, 'MA'], ['المحمدية', 'Mohammedia', 33.6866, -7.383, 'MA'],
  ['فاس', 'Fès', 34.0331, -5.0003, 'MA'], ['مكناس', 'Meknès', 33.8935, -5.5547, 'MA'],
  ['إفران', 'Ifrane', 33.5228, -5.1106, 'MA'], ['مراكش', 'Marrakech', 31.6295, -7.9811, 'MA'],
  ['طنجة', 'Tangier', 35.7595, -5.834, 'MA'], ['تطوان', 'Tétouan', 35.5889, -5.3626, 'MA'],
  ['العرائش', 'Larache', 35.1932, -6.1557, 'MA'], ['القنيطرة', 'Kénitra', 34.261, -6.5802, 'MA'],
  ['وجدة', 'Oujda', 34.6814, -1.9086, 'MA'], ['الناظور', 'Nador', 35.1681, -2.9335, 'MA'],
  ['الحسيمة', 'Al Hoceïma', 35.2517, -3.9372, 'MA'], ['تازة', 'Taza', 34.21, -4.01, 'MA'],
  ['أكادير', 'Agadir', 30.4278, -9.5981, 'MA'], ['الصويرة', 'Essaouira', 31.5085, -9.7595, 'MA'],
  ['آسفي', 'Safi', 32.2994, -9.2372, 'MA'], ['الجديدة', 'El Jadida', 33.2316, -8.5007, 'MA'],
  ['سطات', 'Settat', 33.001, -7.6166, 'MA'], ['خريبكة', 'Khouribga', 32.8811, -6.9063, 'MA'],
  ['بني ملال', 'Béni Mellal', 32.3373, -6.3498, 'MA'], ['الرشيدية', 'Errachidia', 31.9314, -4.4246, 'MA'],
  ['ورزازات', 'Ouarzazate', 30.9189, -6.8934, 'MA'], ['كلميم', 'Guelmim', 28.987, -10.0574, 'MA'],
  ['العيون', 'Laâyoune', 27.1253, -13.1625, 'MA'], ['الداخلة', 'Dakhla', 23.6848, -15.958, 'MA'],
  ['مكة المكرمة', 'Makkah', 21.3891, 39.8579, 'SA'], ['المدينة المنورة', 'Madinah', 24.5247, 39.5692, 'SA'],
  ['الرياض', 'Riyadh', 24.7136, 46.6753, 'SA'], ['جدة', 'Jeddah', 21.4858, 39.1925, 'SA'],
  ['دبي', 'Dubai', 25.2048, 55.2708, 'AE'], ['أبوظبي', 'Abu Dhabi', 24.4539, 54.3773, 'AE'],
  ['الدوحة', 'Doha', 25.2854, 51.531, 'QA'], ['الكويت', 'Kuwait City', 29.3759, 47.9774, 'KW'],
  ['المنامة', 'Manama', 26.2285, 50.586, 'BH'], ['مسقط', 'Muscat', 23.588, 58.3829, 'OM'],
  ['صنعاء', 'Sanaa', 15.3694, 44.191, 'YE'], ['عمّان', 'Amman', 31.9454, 35.9284, 'JO'],
  ['بيروت', 'Beirut', 33.8938, 35.5018, 'LB'], ['دمشق', 'Damascus', 33.5138, 36.2765, 'SY'],
  ['بغداد', 'Baghdad', 33.3152, 44.3661, 'IQ'], ['القدس', 'Jerusalem', 31.7683, 35.2137, 'PS'],
  ['غزة', 'Gaza', 31.5017, 34.4668, 'PS'], ['القاهرة', 'Cairo', 30.0444, 31.2357, 'EG'],
  ['الإسكندرية', 'Alexandria', 31.2001, 29.9187, 'EG'], ['الخرطوم', 'Khartoum', 15.5007, 32.5599, 'SD'],
  ['طرابلس', 'Tripoli', 32.8872, 13.1913, 'LY'], ['تونس', 'Tunis', 36.8065, 10.1815, 'TN'],
  ['الجزائر', 'Algiers', 36.7538, 3.0588, 'DZ'], ['وهران', 'Oran', 35.6971, -0.6308, 'DZ'],
  ['نواكشوط', 'Nouakchott', 18.0735, -15.9582, 'MR'], ['داكار', 'Dakar', 14.7167, -17.4677, 'SN'],
  ['إسطنبول', 'Istanbul', 41.0082, 28.9784, 'TR'], ['أنقرة', 'Ankara', 39.9334, 32.8597, 'TR'],
  ['كراتشي', 'Karachi', 24.8607, 67.0011, 'PK'], ['لاهور', 'Lahore', 31.5204, 74.3587, 'PK'],
  ['إسلام آباد', 'Islamabad', 33.6844, 73.0479, 'PK'], ['دلهي', 'Delhi', 28.6139, 77.209, 'IN'],
  ['دكا', 'Dhaka', 23.8103, 90.4125, 'BD'], ['جاكرتا', 'Jakarta', -6.2088, 106.8456, 'ID'],
  ['كوالالمبور', 'Kuala Lumpur', 3.139, 101.6869, 'MY'], ['طهران', 'Tehran', 35.6892, 51.389, 'IR'],
  ['باريس', 'Paris', 48.8566, 2.3522, 'FR'], ['ليون', 'Lyon', 45.764, 4.8357, 'FR'],
  ['مرسيليا', 'Marseille', 43.2965, 5.3698, 'FR'], ['لندن', 'London', 51.5074, -0.1278, 'GB'],
  ['مدريد', 'Madrid', 40.4168, -3.7038, 'ES'], ['برشلونة', 'Barcelona', 41.3874, 2.1686, 'ES'],
  ['بروكسل', 'Brussels', 50.8503, 4.3517, 'BE'], ['أمستردام', 'Amsterdam', 52.3676, 4.9041, 'NL'],
  ['برلين', 'Berlin', 52.52, 13.405, 'DE'], ['روما', 'Rome', 41.9028, 12.4964, 'IT'],
  ['ميلانو', 'Milan', 45.4642, 9.19, 'IT'], ['تورنتو', 'Toronto', 43.6532, -79.3832, 'CA'],
  ['مونتريال', 'Montreal', 45.5019, -73.5674, 'CA'], ['نيويورك', 'New York', 40.7128, -74.006, 'US'],
  ['شيكاغو', 'Chicago', 41.8781, -87.6298, 'US'], ['لوس أنجلوس', 'Los Angeles', 34.0522, -118.2437, 'US'],
  ['واشنطن', 'Washington', 38.9072, -77.0369, 'US'],
];

const cityName = (c) => c[isEnglish ? 1 : 0];

// The calculation for each country: [method or angles, Hanafi Asr, precaution minutes]
const METHODS = {
  MA: { fajr: 19, isha: 17, add: { dhuhr: 5, maghrib: 5 } },
  DZ: { fajr: 18, isha: 17 },
  TN: { fajr: 18, isha: 18 },
  SA: { method: 'UmmAlQura' }, YE: { method: 'UmmAlQura' }, BH: { method: 'UmmAlQura' }, OM: { method: 'UmmAlQura' },
  AE: { method: 'Dubai' }, QA: { method: 'Qatar' }, KW: { method: 'Kuwait' },
  EG: { method: 'Egyptian' }, SD: { method: 'Egyptian' }, LY: { method: 'Egyptian' }, SY: { method: 'Egyptian' },
  LB: { method: 'Egyptian' }, IQ: { method: 'Egyptian' }, PS: { method: 'Egyptian' }, JO: { method: 'Egyptian' },
  PK: { method: 'Karachi', hanafi: true }, IN: { method: 'Karachi', hanafi: true }, BD: { method: 'Karachi', hanafi: true },
  TR: { method: 'Turkey', hanafi: true }, IR: { method: 'Tehran' },
  ID: { method: 'Singapore' }, MY: { method: 'Singapore' }, SG: { method: 'Singapore' },
  US: { method: 'NorthAmerica' }, CA: { method: 'NorthAmerica' },
};

function parameters(country) {
  const m = METHODS[country] ?? { method: 'MuslimWorldLeague' };
  const p = m.method ? CalculationMethod[m.method]() : new CalculationParameters('Other', m.fajr, m.isha);
  p.madhab = m.hanafi ? Madhab.Hanafi : Madhab.Shafi;
  for (const [prayer, minutes] of Object.entries(m.add ?? {})) p.adjustments[prayer] += minutes;
  return p;
}

// ---------- The place ----------

// { lat, lng, name, country, source: 'gps' | 'city' } or null
export function place() {
  return readJSON('prayerPlace');
}

// A time of day as HH:MM, in the device's zone - except in Morocco, which has been on plain GMT
// since 20 September 2026 (older browsers still say +1)
export function clockTime(date) {
  let timeZone;
  if (place()?.country === 'MA' && date >= Date.UTC(2026, 8, 20, 1)) timeZone = 'UTC';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
}

function keep(p) {
  writeJSON('prayerPlace', p);
}

const distance = (a, b) => Math.hypot(a[2] - b.lat, (a[3] - b.lng) * Math.cos((b.lat * Math.PI) / 180));

// The nearest city we know, as a name for a location (within ~50 km), or none
const nearest = (here) => CITIES.reduce((best, c) => (distance(c, here) < distance(best, here) ? c : best));

export function chooseCity(index) {
  const c = CITIES[index];
  keep({ lat: c[2], lng: c[3], city: index, country: c[4], source: 'city' });
}

// Asks the phone where it is (the member may refuse): resolves with the place, or rejects
export async function locate() {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) throw new Error('location refused');
  const pos =
    (await Location.getLastKnownPositionAsync({ maxAge: 6 * 3600 * 1000 })) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  const city = nearest(here);
  const p = { ...here, city: distance(city, here) < 0.5 ? CITIES.indexOf(city) : null, country: calendarCountry(), source: 'gps' };
  if (p.city !== null) p.country = city[4];
  keep(p);
  return p;
}

// The place's name: its city, or «your location»
export const placeName = (p) => (p.city !== null && p.city !== undefined ? cityName(CITIES[p.city]) : null);

// The cities to choose from: the member's country first, then the others
export function cityChoices() {
  const country = calendarCountry();
  const all = CITIES.map((c, i) => ({ i, name: cityName(c), country: c[4] }));
  return [...all.filter((c) => c.country === country), ...all.filter((c) => c.country !== country)];
}

// ---------- The times ----------

export const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// The day's times at the place: { fajr: Date, ... }
export function times(date, p = place()) {
  if (!p) return null;
  const t = new PrayerTimes(new Coordinates(p.lat, p.lng), date, parameters(p.country || calendarCountry()));
  return Object.fromEntries(PRAYERS.map((k) => [k, t[k]]));
}

// The next prayer from now (sunrise is not a prayer): { key, at: Date, from: Date (the one before) }
export function nextPrayer(p = place()) {
  if (!p) return null;
  const now = new Date();
  const today = times(now, p);
  const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (let i = 0; i < order.length; i++) {
    if (today[order[i]] > now) {
      const from = i ? today[order[i - 1]] : times(new Date(now.getTime() - 86400000), p).isha;
      return { key: order[i], at: today[order[i]], from };
    }
  }
  const tomorrow = times(new Date(now.getTime() + 86400000), p);
  return { key: 'fajr', at: tomorrow.fajr, from: today.isha };
}
