// The reciters Listen can play. Each one says which narration it recites (the audio must match the
// mushaf that is open) and where the audio of one ayah is.
//
// HAFS so far: ayah-by-ayah MP3 files from https://docs.islamic.app/api-reference/audio-ayah.md,
//   https://cdn.islamic.app/quran/audio/{reciter}/{number}.mp3  where {number} is the ayah's place
//   in the whole Quran, 1-6236 (Hafs counting: 7 ayat in al-Fātiḥa, 286 in al-Baqarah...).
//   More HAFS reciters from Ummah API (https://ummahapi.com/api/docs, /api/quran/reciters): its ayah-by-ayah files are on
//   everyayah.com, https://everyayah.com/data/{folder}/{SSS}{AAA}.mp3  where SSS and AAA are the surah and the ayah, 3 digits
//   each (Hafs counting). Ummah's Bandar Baleela and Abdullah Al-Buajan have whole surahs only, so they cannot play in Listen.
// WARSH: ayah-by-ayah MP3 files from the QuranHub catalogue (https://qurani.ai/en/docs/mcp),
//   https://quranhub.b-cdn.net/quran/audio/versebyverse/{kbps}/{reciter}/{number}.mp3  where {number} is the
//   ayah's place in the whole Warsh Quran, 1-6214 (7 ayat in al-Fātiḥa with the Basmala as the first, 285 in
//   al-Baqarah...). Only the reciters that have ayah-by-ayah files are here; those with whole surahs only
//   (al-Qazabri, Mohammad Saayed, Hicham Lharraz) cannot play in Listen.
// To add a reciter, add one line below; nothing else changes. `url` gets the surah and ayah in the
//   narration's own numbering, and the ayah's number in the whole Quran (in that narration's counting).

// Ayat in each surah, Hafs numbering (the sum is 6236). Same as public/data/surah-hafs/N.json.
export const HAFS_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227,
  93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96,
  29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17,
  19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

// "surah 2, ayah 255" -> 262 (the ayah's place in the whole Quran, Hafs counting)
export function globalNumber(surah, ayah) {
  let n = ayah;
  for (let s = 0; s < surah - 1; s++) n += HAFS_COUNTS[s];
  return n;
}

const islamicApp = (id) => (surah, ayah, number) => `https://cdn.islamic.app/quran/audio/${id}/${number}.mp3`;

const pad3 = (n) => String(n).padStart(3, '0');
const everyAyah = (folder) => (surah, ayah) => `https://everyayah.com/data/${folder}/${pad3(surah)}${pad3(ayah)}.mp3`;

const quranHub = (id, kbps) => (surah, ayah, number) => `https://quranhub.b-cdn.net/quran/audio/versebyverse/${kbps}/${id}/${number}.mp3`;

export const RECITERS = [
  { id: 'ar.alafasy', riwaya: 'hafs', name: ['مشاري راشد العفاسي', 'Mishary Alafasy'], url: islamicApp('ar.alafasy') },
  { id: 'ar.abdurrahmaansudais', riwaya: 'hafs', name: ['عبد الرحمن السديس', 'Abdurrahman As-Sudais'], url: islamicApp('ar.abdurrahmaansudais') },
  { id: 'ar.abdulbasit', riwaya: 'hafs', name: ['عبدالباسط عبدالصمد', 'Abdul Basit Abdul Samad'], url: everyAyah('Abdul_Basit_Murattal_192kbps') },
  { id: 'ar.abdulbasit.mujawwad', riwaya: 'hafs', name: ['عبدالباسط عبدالصمد - مجود', 'Abdul Basit Abdul Samad (Mujawwad)'], url: everyAyah('Abdul_Basit_Mujawwad_128kbps') },
  { id: 'ar.mahermuaiqly', riwaya: 'hafs', name: ['ماهر المعيقلي', 'Maher Al Muaiqly'], url: everyAyah('MaherAlMuaiqly128kbps') },
  { id: 'ar.saadalghamdi', riwaya: 'hafs', name: ['سعد الغامدي', 'Saad Al-Ghamdi'], url: everyAyah('Ghamadi_40kbps') },
  { id: 'ar.hanirifai', riwaya: 'hafs', name: ['هاني الرفاعي', 'Hani Ar-Rifai'], url: everyAyah('Hani_Rifai_192kbps') },
  { id: 'ar.abubakrshatri', riwaya: 'hafs', name: ['أبوبكر الشاطري', 'Abu Bakr Al Shatri'], url: everyAyah('Abu_Bakr_Ash-Shaatree_128kbps') },
  { id: 'ar.yasserdosari', riwaya: 'hafs', name: ['ياسر الدوسري', 'Yasser Al-Dosari'], url: everyAyah('Yasser_Ad-Dussary_128kbps') },
  { id: 'ar.saudshuraim', riwaya: 'hafs', name: ['سعود الشريم', 'Saud Al-Shuraim'], url: everyAyah('Saood_ash-Shuraym_128kbps') },
  { id: 'ar.abdullahjuhany', riwaya: 'hafs', name: ['عبدالله الجهني', 'Abdullah Al-Juhany'], url: everyAyah('Abdullaah_3awwaad_Al-Juhaynee_128kbps') },
  { id: 'ar.alkouchi.warsh', riwaya: 'warsh', name: ['العيون الكوشي', 'Al-Ayoune Al-Kouchi'], url: quranHub('ar.alkouchi.warsh', 128) },
  { id: 'ar.husary.warsh', riwaya: 'warsh', name: ['محمود خليل الحصري', 'Mahmoud Khalil Al-Husary'], url: quranHub('ar.husary.warsh', 48) },
  { id: 'ar.abdulsamad.warsh', riwaya: 'warsh', name: ['عبد الباسط عبد الصمد', 'Abdul Basit Abdul Samad'], url: quranHub('ar.abdulsamad.warsh', 128) },
  { id: 'ar.aljazairi.warsh', riwaya: 'warsh', name: ['ياسين الجزائري', 'Yassin Al Jazairi'], url: quranHub('ar.aljazairi.warsh', 32) },
  { id: 'ar.belalya.warsh', riwaya: 'warsh', name: ['رشيد بلعالية', 'Rachid Belalya'], url: quranHub('ar.belalya.warsh', 128) },
  { id: 'ar.aldaghoush.warsh', riwaya: 'warsh', name: ['عبد الكريم الدغوش', 'Abdul Karim Al-Daghoush'], url: quranHub('ar.aldaghoush.warsh', 96) },
  { id: 'ar.muhammadabdulkareem.warsh', riwaya: 'warsh', name: ['محمد عبد الكريم', 'Muhammad Abdul Kareem'], url: quranHub('ar.muhammadabdulkareem.warsh', 192) },
];
