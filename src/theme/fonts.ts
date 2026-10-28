// The fonts, as on the website: Tajawal for the interface, Amiri for titles (and Quranic and hadith
// text). A phone does not make a bold from a regular face, so each weight is its own font, loaded in
// src/app/_layout.tsx; ui(weight) and serif(weight) pick the right one.
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal';

export const FONT_FILES = {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  Amiri_400Regular,
  Amiri_700Bold,
};

type Weight = 400 | 500 | 600 | 700 | 800;

export const ui = (weight: Weight = 400) =>
  weight >= 800 ? 'Tajawal_800ExtraBold' : weight >= 700 ? 'Tajawal_700Bold' : weight >= 500 ? 'Tajawal_500Medium' : 'Tajawal_400Regular';

export const serif = (weight: 400 | 700 = 400) => (weight >= 700 ? 'Amiri_700Bold' : 'Amiri_400Regular');
