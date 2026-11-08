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
  soon: () => L('قريباً', 'Soon', 'Bientôt'),
  // the one Settings screen
  account: () => L('الحساب', 'Account', 'Compte'),
  signIn: () => L('تسجيل الدخول', 'Log in', 'Se connecter'),
  signInSub: () => L('لحفظ وِردك وتقدّمك', 'To keep your wird and progress', 'Pour garder votre wird et votre progression'),
  general: () => L('عام', 'General', 'Général'),
  prayer: () => L('الصلاة والموقع', 'Prayer and location', 'Prière et lieu'),
  quranSection: () => L('المصحف', 'Quran', 'Coran'),
};
