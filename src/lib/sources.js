// The tafsirs and translations (the website's list, src/reader/settings.js), in the order they are
// shown, and the reader's choice of them ('tafsirSources', as on the website). Files on the website:
// /data/tafsir/<id>/<surah>.json, or for a long tafsir one file per ayah: <id>/<surah>/<ayah>.json.
import { isEnglish, isFrench } from '../i18n/i18n.js';
import { readJSON, writeJSON } from './storage.js';

export const SOURCES = [
  {
    id: 'muyassar',
    name: 'التفسير الميسر',
    nameEn: 'Tafsir al-Muyassar (Arabic)',
    about: 'تفسير مختصر ميسّر، مجمع الملك فهد لطباعة المصحف الشريف',
    aboutEn: 'A short, simple tafsir — King Fahd Complex',
    nameFr: 'Tafsir al-Muyassar (arabe)',
    aboutFr: 'Un tafsir court et simple — Complexe du Roi Fahd',
    lang: 'ar',
  },
  {
    id: 'jalalayn',
    name: 'تفسير الجلالين',
    nameEn: 'Tafsir al-Jalalayn (Arabic)',
    about: 'جلال الدين المحلي وجلال الدين السيوطي',
    aboutEn: 'Jalal al-Din al-Mahalli and Jalal al-Din al-Suyuti',
    nameFr: 'Tafsir al-Jalalayn (arabe)',
    aboutFr: 'Jalal ad-Din al-Mahalli et Jalal ad-Din as-Suyuti',
    lang: 'ar',
  },
  {
    id: 'ibn-kathir',
    name: 'تفسير ابن كثير',
    nameEn: 'Tafsir Ibn Kathir (Arabic)',
    about: 'تفسير القرآن العظيم للحافظ ابن كثير، تفسير مطوّل',
    aboutEn: 'Tafsir al-Qur’an al-‘Azim by al-Hafiz Ibn Kathir, a long tafsir',
    nameFr: 'Tafsir Ibn Kathir (arabe)',
    aboutFr: 'Tafsir al-Qur’an al-Azim d’al-Hafiz Ibn Kathir, un tafsir détaillé',
    lang: 'ar',
    perAyah: true,
  },
  {
    id: 'en-ibn-kathir',
    name: 'Tafsir Ibn Kathir — English (abridged)',
    nameEn: 'Tafsir Ibn Kathir — English (abridged)',
    about: 'الترجمة الإنجليزية المختصرة لتفسير ابن كثير، دار السلام',
    aboutEn: 'The abridged English translation of Tafsir Ibn Kathir, Darussalam',
    nameFr: 'Tafsir Ibn Kathir — anglais (abrégé)',
    aboutFr: 'La traduction anglaise abrégée du Tafsir Ibn Kathir, Darussalam',
    lang: 'en',
    perAyah: true,
  },
  {
    id: 'en-mukhtasar',
    name: 'Al-Mukhtasar — English (short tafsir)',
    nameEn: 'Al-Mukhtasar — English (short tafsir)',
    about: 'المختصر في تفسير القرآن الكريم، بالإنجليزية - مركز تفسير للدراسات القرآنية (QuranEnc.com)',
    aboutEn: "A short tafsir in the manner of al-Muyassar — Tafsir Center for Quranic Studies (QuranEnc.com)",
    nameFr: 'Al-Mukhtasar — anglais (tafsir court)',
    aboutFr: 'Un tafsir court dans l’esprit d’al-Muyassar — Tafsir Center for Quranic Studies (QuranEnc.com)',
    lang: 'en',
  },
  {
    id: 'en-sahih',
    name: 'English — Saheeh International',
    nameEn: 'English — Saheeh International',
    about: 'ترجمة معاني القرآن إلى الإنجليزية',
    aboutEn: 'Translation of the meanings of the Quran into English',
    nameFr: 'Anglais — Saheeh International',
    aboutFr: 'Traduction des sens du Coran en anglais',
    lang: 'en',
    kind: 'translation',
  },
  {
    id: 'fr-hamidullah',
    name: 'Français — Muhammad Hamidullah',
    nameEn: 'Français — Muhammad Hamidullah',
    about: 'ترجمة معاني القرآن إلى الفرنسية',
    aboutEn: 'Translation of the meanings of the Quran into French',
    nameFr: 'Français — Muhammad Hamidullah',
    aboutFr: 'Traduction des sens du Coran en français',
    lang: 'fr',
    kind: 'translation',
  },
];

// The chosen sources; nothing chosen yet: one tafsir (al-Muyassar in Arabic and French, al-Mukhtasar
// in English) and a translation (Hamidullah's French in French, otherwise the English).
export function tafsirSources() {
  const ids = readJSON('tafsirSources');
  if (Array.isArray(ids)) return SOURCES.filter((s) => ids.includes(s.id));
  const first = isFrench ? ['muyassar', 'fr-hamidullah'] : [isEnglish ? 'en-mukhtasar' : 'muyassar', 'en-sahih'];
  return SOURCES.filter((s) => first.includes(s.id));
}

// A source shown or not (the Quran's settings)
export function setSource(id, on) {
  const ids = new Set(tafsirSources().map((s) => s.id));
  if (on) ids.add(id);
  else ids.delete(id);
  writeJSON('tafsirSources', [...ids]);
}
