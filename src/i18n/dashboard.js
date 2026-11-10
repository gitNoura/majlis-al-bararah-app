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
  khatmas: (n) => L(`ختمات مكتملة: ${n}`, `Khatmas completed: ${n}`, `Khatmas terminées : ${n}`),
  // memorization
  planOverall: () => L('من الخطة', 'of the plan', 'du plan'),
  planDays: (done, total) => L(`${done} من ${total} يوماً`, `${done} of ${total} days`, `${done} jours sur ${total}`),
  createPlan: () => L('أنشئ خطة', 'Create a plan', 'Créer un plan'),
  planBegin: () => L('ابدأ اليوم', 'Start today', 'Commencez aujourd’hui'),
  planIdle: () => L('متوقفة أو لم تبدأ بعد', 'Paused or not started yet', 'En pause ou pas encore commencé'),
  memorizedOf: () => L('من 30 جزءاً محفوظاً', 'of 30 juz memorized', 'sur 30 juz mémorisés'),
  newLabel: () => L('جديد', 'New', 'Nouveau'),
  revisionLabel: () => L('مراجعة', 'Revision', 'Révision'),
  noPlan: () => L('لا توجد خطة حفظ بعد', 'No memorization plan yet', 'Pas encore de plan de mémorisation'),
  noPlanSub: () => L('أنشئ خطتك من تبويب الحفظ', 'Set one up in the Memorize tab', 'Créez-en un dans l’onglet Mémoriser'),
  memorizePlan: () => L('خطة الحفظ', 'Memorization plan', 'Plan de mémorisation'),
  revisionPlan: () => L('خطة المراجعة', 'Revision plan', 'Plan de révision'),
  noMemorizePlan: () => L('لم تضع خطة حفظ بعد', 'No plan yet', 'Pas encore de plan'),
  noRevisionPlan: () => L('لم تضع خطة مراجعة بعد', 'No plan yet', 'Pas encore de plan'),
  addPlan: () => L('أنشئ خطة', 'Create one', 'Créer un plan'),
  // activity
  activity: () => L('النشاط', 'Activity', 'Activité'),
  activityOf7: (n) => L(`${n} من 7`, `${n} of 7`, `${n} sur 7`),
  activityCaption: () => L('أيام تفاعلت فيها مع القرآن', 'days you engaged with the Quran', 'jours passés avec le Coran'),
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
