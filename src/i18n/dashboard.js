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
  // first run: the three Home cards say what the app is for (no plan and no progress yet)
  startWird: () => L('ابدأ وِردك من الفاتحة', 'Start your daily reading from al-Fatiha', 'Commencez votre lecture quotidienne par al-Fatiha'),
  startHifdh: () => L('ابدأ رحلتك في الحفظ', 'Start your memorization journey', 'Commencez votre parcours de mémorisation'),
  startHifdhSub: () => L('اختر ما تحفظ وكم تحفظ كل يوم', 'Choose what to memorize and how much each day', 'Choisissez quoi mémoriser et combien chaque jour'),
  startRevise: () => L('ثبّت حفظك بالمراجعة', 'Keep what you memorize with revision', 'Consolidez votre mémorisation par la révision'),
  startReviseSub: () => L('حتى لا يضيع ما حفظته', 'So what you have memorized stays with you', 'Pour que ce que vous avez appris reste acquis'),
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
  // the memorization and revision cards (plan name, pace, and one line under the ring)
  perDay: (a) => L(`${a} في اليوم`, `${a} a day`, `${a} par jour`),
  perWeek: (a) => L(`${a} في الأسبوع`, `${a} a week`, `${a} par semaine`),
  daysAWeek: (n) => L(n === 1 ? 'يوم واحد في الأسبوع' : n === 2 ? 'يومان في الأسبوع' : `${n} أيام في الأسبوع`, `${n} ${n === 1 ? 'day' : 'days'} a week`, `${n} ${n === 1 ? 'jour' : 'jours'} par semaine`),
  daysLeft: (n) => L(n === 1 ? 'متبقي يوم واحد' : n === 2 ? 'متبقي يومان' : n <= 10 ? `متبقي ${n} أيام` : `متبقي ${n} يوماً`, `${n} ${n === 1 ? 'day' : 'days'} left`, `${n} ${n === 1 ? 'jour restant' : 'jours restants'}`),
  unitsDone: (done, total, word) => L(`${done} من ${total} ${word}`, `${done} of ${total} ${word}`, `${done} sur ${total} ${word}`),
  restDay: () => L('اليوم راحة', 'Rest day today', 'Jour de repos aujourd’hui'),
  sessionTomorrow: () => L('الجلسة غداً', 'Next session tomorrow', 'Prochaine séance demain'),
  sessionOn: (day) => L(`الجلسة يوم ${day}`, `Next session ${day}`, `Prochaine séance ${day}`),
  doneToday: () => L('أنجزتَ ما عليك اليوم', 'Done for today', 'Terminé pour aujourd’hui'),
  todayIs: (portion) => L(`اليوم: ${portion}`, `Today: ${portion}`, `Aujourd’hui : ${portion}`),
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
