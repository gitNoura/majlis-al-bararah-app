// The Home dashboard's own words, in the three languages: DASH.key() gives them in the language of the moment.
import { L } from './i18n.js';

export const DASH = {
  // next prayer
  left: (h, m) =>
    h > 0
      ? L(`${h} س ${m} د`, `${h}h ${m}m`, `${h} h ${m} min`)
      : m > 0
        ? L(`${m} د`, `${m}m`, `${m} min`)
        : L('أقل من دقيقة', 'under a minute', 'moins d’une minute'),
  // reading
  reading: () => L('القراءة', 'Reading', 'Lecture'),
  continueReading: () => L('أكمل القراءة', 'Continue reading', 'Continuer la lecture'),
  startReading: () => L('ابدأ القراءة', 'Start reading', 'Commencer la lecture'),
  beginKhatma: () => L('ابدأ ختمتك من الفاتحة', 'Begin your khatma from al-Fatiha', 'Commencez votre khatma par al-Fatiha'),
  juzRead: (n) => L(`${n} من 30 جزءاً مقروءاً`, `${n} of 30 juz read`, `${n} juz lus sur 30`),
  pagesNone: () => L('لم تقرأ اليوم بعد', 'Nothing read yet today', 'Rien lu aujourd’hui'),
  pagesToday: (n) =>
    L(
      n === 1 ? 'صفحة واحدة اليوم' : n === 2 ? 'صفحتان اليوم' : `${n} ${n <= 10 ? 'صفحات' : 'صفحة'} اليوم`,
      `${n} ${n === 1 ? 'page' : 'pages'} today`,
      `${n} ${n === 1 ? 'page' : 'pages'} aujourd’hui`,
    ),
  khatmas: (n) => L(`ختمات مكتملة: ${n}`, `Khatmas completed: ${n}`, `Khatmas terminées : ${n}`),
  // memorization
  memorizedOf: () => L('من 30 جزءاً محفوظاً', 'of 30 juz memorized', 'sur 30 juz mémorisés'),
  newLabel: () => L('جديد', 'New', 'Nouveau'),
  revisionLabel: () => L('مراجعة', 'Revision', 'Révision'),
  noPlan: () => L('لا توجد خطة حفظ بعد', 'No memorization plan yet', 'Pas encore de plan de mémorisation'),
  noPlanSub: () => L('أنشئ خطتك من تبويب الحفظ', 'Set one up in the Memorize tab', 'Créez-en un dans l’onglet Mémoriser'),
  nothingToday: () => L('لا شيء مقرر اليوم', 'Nothing planned today', 'Rien de prévu aujourd’hui'),
  // activity
  activity: () => L('النشاط', 'Activity', 'Activité'),
  streakLabel: () => L('أيام متتالية', 'days in a row', 'jours d’affilée'),
  last4: () => L('آخر 4 أسابيع', 'Last 4 weeks', '4 dernières semaines'),
  thisWeek: () => L('هذا الأسبوع', 'This week', 'Cette semaine'),
  lastWeek: () => L('الأسبوع الماضي', 'Last week', 'Semaine dernière'),
  pagesLabel: () => L('صفحات اليوم', 'Pages today', 'Pages aujourd’hui'),
  juzLabel: () => L('أجزاء مقروءة', 'Juz read', 'Juz lus'),
  daysLabel: () => L('أيام متتالية', 'day streak', 'jours d’affilée'),
  // additional resources
  resources: () => L('مصادر إضافية', 'Additional resources', 'Ressources complémentaires'),
  libAdhkar: () => L('مكتبة الأذكار', 'Adhkar library', 'Bibliothèque d’adhkar'),
  libAdhkarSub: () => L('الأذكار حسب الأبواب، مع العدّاد', 'Adhkar by category, with a counter', 'Adhkar par catégorie, avec compteur'),
  libAhadith: () => L('مكتبة الأحاديث', 'Hadith library', 'Bibliothèque de hadiths'),
  libAhadithSub: () => L('البخاري ومسلم والأربعون النووية', 'Bukhari, Muslim and Nawawi’s Forty', 'Boukhari, Mouslim et les Quarante de Nawawi'),
  // library tab and calendar
  tabLibrary: () => L('المكتبة', 'Library', 'Bibliothèque'),
  libraryTitle: () => L('المكتبة', 'Library', 'Bibliothèque'),
  calendar: () => L('التقويم', 'Calendar', 'Calendrier'),
  weekdays: () => L(['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'], ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']),
  upcomingEvents: () => L('المناسبات القادمة', 'Coming up', 'À venir'),
};
