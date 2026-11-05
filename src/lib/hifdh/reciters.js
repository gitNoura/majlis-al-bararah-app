// The reciters Listen can play. Each one says which narration it recites (the audio must match the
// mushaf that is open) and where the audio of one ayah is.
//
// HAFS so far: ayah-by-ayah MP3 files from https://docs.islamic.app/api-reference/audio-ayah.md,
//   https://cdn.islamic.app/quran/audio/{reciter}/{number}.mp3  where {number} is the ayah's place
//   in the whole Quran, 1-6236 (Hafs counting: 7 ayat in al-Fātiḥa, 286 in al-Baqarah...).
// WARSH: none yet. To add a reciter, add one line below; nothing else changes. `url` gets the
//   surah and ayah in the narration's own numbering, and the ayah's number in the whole Quran.

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

export const RECITERS = [
  { id: 'ar.alafasy', riwaya: 'hafs', name: ['مشاري راشد العفاسي', 'Mishary Alafasy'], url: islamicApp('ar.alafasy') },
  { id: 'ar.abdurrahmaansudais', riwaya: 'hafs', name: ['عبد الرحمن السديس', 'Abdurrahman As-Sudais'], url: islamicApp('ar.abdurrahmaansudais') },
];
