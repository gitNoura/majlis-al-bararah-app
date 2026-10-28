// Structure of the Dar al-Maarifa Warsh mushaf (604 pages).
// Surah pages and Meccan/Medinan come from the mushaf's own index (PDF page 609).
// Hizb pages were read from the "حزب N" label at the top of each page.

import { HAFS } from './riwaya.js';
import { isFrench } from '../i18n/i18n.js';
import { SURAH_MEANINGS_FR } from '../i18n/i18n-fr.js';

export const TOTAL_PAGES = 604;

const MEDINAN = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98,
  99, 110,
]);

// English name of each surah: transliteration (KFGQPC) · meaning.
const ENGLISH_NAMES = [
  ["Al-Fatihah", "The Opening"],
  ["Al-Baqarah", "The Cow"],
  ["Al-'Imran", "The Family of Imran"],
  ["An-Nisa", "The Women"],
  ["Al-Ma'idah", "The Table Spread"],
  ["Al-An'am", "The Cattle"],
  ["Al-A'raf", "The Heights"],
  ["Al-Anfal", "The Spoils of War"],
  ["At-Taubah", "The Repentance"],
  ["Yunus", "Jonah"],
  ["Hud", "Hud"],
  ["Yusuf", "Joseph"],
  ["Ar-Ra'd", "The Thunder"],
  ["Ibrahim", "Abraham"],
  ["Al-Hijr", "The Rocky Tract"],
  ["An-Nahl", "The Bee"],
  ["Al-Isra", "The Night Journey"],
  ["Al-Kahf", "The Cave"],
  ["Maryam", "Mary"],
  ["Ta-Ha", "Ta-Ha"],
  ["Al-Anbiya", "The Prophets"],
  ["Al-Hajj", "The Pilgrimage"],
  ["Al-Mu'minun", "The Believers"],
  ["An-Nur", "The Light"],
  ["Al-Furqan", "The Criterion"],
  ["Ash-Shu'ara", "The Poets"],
  ["An-Naml", "The Ant"],
  ["Al-Qasas", "The Stories"],
  ["Al-'Ankabut", "The Spider"],
  ["Ar-Rum", "The Romans"],
  ["Luqman", "Luqman"],
  ["As-Sajdah", "The Prostration"],
  ["Al-Ahzab", "The Combined Forces"],
  ["Saba", "Sheba"],
  ["Fatir", "The Originator"],
  ["Ya-Sin", "Ya-Sin"],
  ["As-Saffat", "Those Who Set the Ranks"],
  ["Sad", "Sad"],
  ["Az-Zumar", "The Troops"],
  ["Ghafir", "The Forgiver"],
  ["Fussilat", "Explained in Detail"],
  ["Ash-Shura", "The Consultation"],
  ["Az-Zukhruf", "The Ornaments of Gold"],
  ["Ad-Dukhan", "The Smoke"],
  ["Al-Jathiyah", "The Crouching"],
  ["Al-Ahqaf", "The Wind-Curved Sandhills"],
  ["Muhammad", "Muhammad"],
  ["Al-Fath", "The Victory"],
  ["Al-Hujurat", "The Rooms"],
  ["Qaf", "Qaf"],
  ["Adh-Dhariyat", "The Winnowing Winds"],
  ["At-Tur", "The Mount"],
  ["An-Najm", "The Star"],
  ["Al-Qamar", "The Moon"],
  ["Ar-Rahman", "The Beneficent"],
  ["Al-Waqi'ah", "The Inevitable"],
  ["Al-Hadid", "The Iron"],
  ["Al-Mujadilah", "The Pleading Woman"],
  ["Al-Hashr", "The Exile"],
  ["Al-Mumtahanah", "The Woman to be Examined"],
  ["As-Saff", "The Ranks"],
  ["Al-Jumu'ah", "Friday"],
  ["Al-Munafiqun", "The Hypocrites"],
  ["At-Taghabun", "The Mutual Disillusion"],
  ["At-Talaq", "The Divorce"],
  ["At-Tahrim", "The Prohibition"],
  ["Al-Mulk", "The Sovereignty"],
  ["Al-Qalam", "The Pen"],
  ["Al-Haqqah", "The Reality"],
  ["Al-Ma'arij", "The Ascending Stairways"],
  ["Nuh", "Noah"],
  ["Al-Jinn", "The Jinn"],
  ["Al-Muzzammil", "The Enshrouded One"],
  ["Al-Muddaththir", "The Cloaked One"],
  ["Al-Qiyamah", "The Resurrection"],
  ["Al-Insan", "Man"],
  ["Al-Mursalat", "The Emissaries"],
  ["An-Naba", "The Tidings"],
  ["An-Nazi'at", "Those Who Drag Forth"],
  ["'Abasa", "He Frowned"],
  ["At-Takwir", "The Overthrowing"],
  ["Al-Infitar", "The Cleaving"],
  ["Al-Mutaffifin", "The Defrauding"],
  ["Al-Inshiqaq", "The Sundering"],
  ["Al-Buruj", "The Mansions of the Stars"],
  ["At-Tariq", "The Nightcomer"],
  ["Al-A'la", "The Most High"],
  ["Al-Ghashiyah", "The Overwhelming"],
  ["Al-Fajr", "The Dawn"],
  ["Al-Balad", "The City"],
  ["Ash-Shams", "The Sun"],
  ["Al-Lail", "The Night"],
  ["Ad-Duha", "The Morning Hours"],
  ["Ash-Sharh", "The Relief"],
  ["At-Tin", "The Fig"],
  ["Al-'Alaq", "The Clot"],
  ["Al-Qadr", "The Power"],
  ["Al-Bayyinah", "The Clear Proof"],
  ["Az-Zalzalah", "The Earthquake"],
  ["Al-'Adiyat", "The Coursers"],
  ["Al-Qari'ah", "The Calamity"],
  ["At-Takathur", "The Rivalry in World Increase"],
  ["Al-'Asr", "The Declining Day"],
  ["Al-Humazah", "The Traducer"],
  ["Al-Fil", "The Elephant"],
  ["Quraish", "Quraysh"],
  ["Al-Ma'un", "The Small Kindnesses"],
  ["Al-Kauthar", "The Abundance"],
  ["Al-Kafirun", "The Disbelievers"],
  ["An-Nasr", "The Divine Support"],
  ["Al-Masad", "The Palm Fiber"],
  ["Al-Ikhlas", "The Sincerity"],
  ["Al-Falaq", "The Daybreak"],
  ["An-Nas", "Mankind"],
];

export const SURAHS = [
  ['الفاتحة', 1], ['البقرة', 2], ['آل عمران', 50], ['النساء', 77], ['المائدة', 106],
  ['الأنعام', 128], ['الأعراف', 151], ['الأنفال', 177], ['التوبة', 187], ['يونس', 208],
  ['هود', 221], ['يوسف', 235], ['الرعد', 249], ['إبراهيم', 255], ['الحجر', 262],
  ['النحل', 267], ['الإسراء', 282], ['الكهف', 293], ['مريم', 305], ['طه', 312],
  ['الأنبياء', 322], ['الحج', 332], ['المؤمنون', 342], ['النور', 350], ['الفرقان', 359],
  ['الشعراء', 367], ['النمل', 377], ['القصص', 385], ['العنكبوت', 396], ['الروم', 404],
  ['لقمان', 411], ['السجدة', 415], ['الأحزاب', 418], ['سبأ', 428], ['فاطر', 434],
  ['يس', 440], ['الصافات', 446], ['ص', 453], ['الزمر', 458], ['غافر', 467],
  ['فصلت', 477], ['الشورى', 483], ['الزخرف', 489], ['الدخان', 496], ['الجاثية', 499],
  ['الأحقاف', 502], ['محمد', 507], ['الفتح', 511], ['الحجرات', 515], ['ق', 518],
  ['الذاريات', 520], ['الطور', 523], ['النجم', 526], ['القمر', 528], ['الرحمن', 531],
  ['الواقعة', 534], ['الحديد', 537], ['المجادلة', 542], ['الحشر', 545], ['الممتحنة', 549],
  ['الصف', 551], ['الجمعة', 553], ['المنافقون', 554], ['التغابن', 556], ['الطلاق', 558],
  ['التحريم', 560], ['الملك', 562], ['القلم', 564], ['الحاقة', 566], ['المعارج', 568],
  ['نوح', 570], ['الجن', 572], ['المزمل', 574], ['المدثر', 575], ['القيامة', 577],
  ['الإنسان', 578], ['المرسلات', 580], ['النبأ', 582], ['النازعات', 583], ['عبس', 585],
  ['التكوير', 586], ['الانفطار', 587], ['المطففين', 587], ['الانشقاق', 589], ['البروج', 590],
  ['الطارق', 591], ['الأعلى', 591], ['الغاشية', 592], ['الفجر', 593], ['البلد', 594],
  ['الشمس', 595], ['الليل', 595], ['الضحى', 596], ['الشرح', 596], ['التين', 597],
  ['العلق', 597], ['القدر', 598], ['البينة', 598], ['الزلزلة', 599], ['العاديات', 599],
  ['القارعة', 600], ['التكاثر', 600], ['العصر', 601], ['الهمزة', 601], ['الفيل', 601],
  ['قريش', 602], ['الماعون', 602], ['الكوثر', 602], ['الكافرون', 603], ['النصر', 603],
  ['المسد', 603], ['الإخلاص', 604], ['الفلق', 604], ['الناس', 604],
].map(([name, page], i) => ({
  number: i + 1,
  name,
  page,
  type: MEDINAN.has(i + 1) ? 'مدنية' : 'مكية',
  english: `${ENGLISH_NAMES[i][0]} · ${ENGLISH_NAMES[i][1]}`,
  latin: ENGLISH_NAMES[i][0], // Al-Fatihah
  meaning: isFrench ? SURAH_MEANINGS_FR[i] : ENGLISH_NAMES[i][1], // The Opening / L’Ouverture
}));

// Page on which each of the 60 ahzab starts. Hizb 8 is on page 72 in this Warsh mushaf (71 in Hafs).
const HIZB_PAGES = [
  1, 11, 22, 32, 42, 51, 62, 72, 82, 92, 102, 111, 121, 132, 142, 151, 162, 173, 182, 192,
  201, 212, 222, 231, 242, 252, 262, 272, 282, 292, 302, 312, 322, 332, 342, 352, 362, 371, 382, 392,
  402, 413, 422, 431, 442, 451, 462, 472, 482, 491, 502, 513, 522, 531, 542, 553, 562, 572, 582, 591,
];

// The ayah each hizb starts with [surah, ayah], Warsh numbering. From the ۞ marks in the
// KFGQPC Warsh text, checked against the pages above (scripts/find_hizb_starts.py).
// Some differ from Hafs: hizb 12 starts at «قَالَ رَجُلَٰنِ» (5:25), hizb 16 at 7:4.
const HIZB_STARTS = [
  [1, 1], [2, 75], [2, 141], [2, 201], [2, 251], [3, 15], [3, 91], [3, 171], [4, 24], [4, 86],
  [4, 147], [5, 25], [5, 84], [6, 37], [6, 112], [7, 4], [7, 87], [7, 171], [8, 41], [9, 34],
  [9, 94], [10, 26], [11, 6], [11, 83], [12, 53], [13, 21], [15, 1], [16, 51], [17, 1], [17, 99],
  [18, 74], [20, 1], [21, 1], [22, 1], [23, 1], [24, 21], [25, 21], [26, 111], [27, 58], [28, 51],
  [29, 46], [31, 21], [33, 31], [34, 24], [36, 27], [37, 145], [39, 31], [40, 41], [41, 46], [43, 23],
  [46, 1], [48, 18], [51, 31], [55, 1], [58, 1], [62, 1], [67, 1], [72, 1], [78, 1], [87, 1],
];

if (HAFS) HIZB_PAGES[7] = 71; // hizb 8 starts one page earlier in Hafs

export const AHZAB = HIZB_PAGES.map((page, i) => ({
  number: i + 1,
  page,
  surah: HIZB_STARTS[i][0],
  ayah: HIZB_STARTS[i][1],
}));

// Each juz is two ahzab.
export const AJZA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  page: HIZB_PAGES[i * 2],
  ahzab: [i * 2 + 1, i * 2 + 2],
}));

// The last item in a list that starts on or before the given page.
function lastStartingBy(list, page) {
  let current = list[0];
  for (const item of list) {
    if (item.page > page) break;
    current = item;
  }
  return current;
}

export const surahForPage = (page) => lastStartingBy(SURAHS, page);
export const hizbForPage = (page) => lastStartingBy(AHZAB, page);
export const juzForPage = (page) => lastStartingBy(AJZA, page);
