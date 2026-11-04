// The app's settings page's own words, in the three languages (the website's #settings, its PAGE_EN and
// PAGE_FR); the rest comes from t() (src/i18n/i18n.js).
import { L } from './i18n.js';

export const SETTINGS = {
  title: () => L('الإعدادات', 'Settings', 'Paramètres'),
  appearance: () => L('المظهر', 'Appearance', 'Apparence'),
  light: () => L('نهاري', 'Light', 'Clair'),
  dark: () => L('ليلي', 'Night', 'Nuit'),
  auto: () => L('تلقائي', 'Auto', 'Auto'),
  // night from al-Maghrib until al-Fajr
  byTime: () => L('حسب الصلاة', 'By prayer', 'Selon la prière'),
  byTimeNote: () =>
    L('«حسب الصلاة»: ليلي من المغرب إلى الفجر، ونهاري بقية اليوم.', '«By prayer»: night from Maghrib until Fajr, light the rest of the day.', '« Selon la prière » : nuit du Maghrib au Fajr, clair le reste de la journée.'),
  language: () => L('اللغة', 'Language', 'Langue'),
  place: () => L('مكان مواقيت الصلاة', 'Location for prayer times', 'Lieu des horaires de prière'),
  myLocation: () => L('موقعي', 'My location', 'Ma position'),
  chooseCity: () => L('اختر مدينتك', 'Choose your city', 'Choisissez votre ville'),
  noPlace: () => L('لم يُحدَّد بعد', 'Not set yet', 'Pas encore indiqué'),
  hijri: () => L('التاريخ الهجري', 'Hijri date', 'Date hégirienne'),
  hijriNote: () =>
    L(
      'إن أعلن بلدك بداية الشهر بيوم مختلف، عدّل التاريخ هنا.',
      'If your country announced the month a day apart, adjust the date here.',
      'Si votre pays a annoncé le mois avec un jour d’écart, ajustez la date ici.',
    ),
  today: () => L('اليوم', 'Today', 'Aujourd’hui'),
  quranGroup: () => L('القرآن الكريم', 'The Quran', 'Le Coran'),
  quran: () => L('إعدادات المصحف', 'Quran settings', 'Paramètres du Coran'),
  quranSub: () => L('الرواية، التفاسير والترجمات، التحميل', 'Narration, tafsirs and translations, downloads', 'Lecture, tafsirs et traductions, téléchargements'),
  feedback: () => L('ملاحظاتك', 'Feedback', 'Votre avis'),
  sendFeedback: () => L('أرسل ملاحظة', 'Send feedback', 'Envoyer un avis'),
  soon: () => L('قريباً', 'Soon', 'Bientôt'),
};
