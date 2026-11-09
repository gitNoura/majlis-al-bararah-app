// The Hifdh page's own words, in the three languages (the website had them inline in src/hifz/hifz.js):
// HIF.key() gives them in the language of the moment. Words for units, statuses, weekdays and dates
// already live in src/lib/hifdh/labels.js (UNIT_*, STATUS, kindOf, perWord, weekLine...), so they are not repeated here.
import { L } from './i18n.js';

export const HIF = {
  // titles
  title: () => L('الحفظ', 'Memorization', 'Mémorisation'),
  segToday: () => L('اليوم', 'Today', 'Aujourd’hui'),
  segPlan: () => L('الخطة', 'Plan', 'Plan'),
  recitePortion: () => L('سمّع هذا الورد', 'Recite this portion', 'Réciter cette portion'),
  editPlan: () => L('تعديل الخطة', 'Edit plan', 'Modifier le plan'),
  newPlan: () => L('خطة جديدة', 'New plan', 'Nouveau plan'),
  myPlans: () => L('خططي', 'My plans', 'Mes plans'),
  history: () => L('سجلّ الأيام', 'History', 'Historique'),
  progress: () => L('التقدّم', 'Progress', 'Progression'),
  progressLabel: () => L('تقدّم خططك', 'Your plans', 'Vos plans'),
  progressNone: () => L('لا شيء بعد', 'None yet', 'Rien encore'),
  progressNoneSub: () => L('ابدأ خطة لتظهر هنا', 'Start a plan to see it here', 'Lancez un plan pour le voir ici'),
  progressOfPlans: () => L('من مجموع خططك', 'across your plans', 'sur l’ensemble de vos plans'),
  historySub: () => L('تصفّح أيامك الماضية', 'Browse your past days', 'Parcourir vos jours passés'),
  memorizedTitle: () => L('محفوظي', 'What I’ve memorized', 'Ce que j’ai mémorisé'),
  loading: () => L('جارٍ التحميل…', 'Loading…', 'Chargement…'),
  loadFailed: () => L('تعذّر تحميل البيانات.', 'The data could not be loaded.', 'Les données n’ont pas pu être chargées.'),

  // the bottom tabs
  tabsLabel: () => L('أقسام الحفظ', 'Memorization', 'Mémorisation'),
  tabListen: () => L('استماع', 'Listen', 'Écouter'),
  tabRecite: () => L('تسميع', 'Recite', 'Réciter'),

  // summary: week, ring, links
  yourWeek: () => L('أسبوعك', 'Your week', 'Votre semaine'),
  ofSevenDays: () => L('من 7 أيام', 'of 7 days', 'sur 7 jours'),
  editMemorized: () => L('عدّل ما حفظتُه', 'Edit what I’ve memorized', 'Modifier ce que j’ai mémorisé'),
  historyRing: () => L('السجل', 'History', 'Historique'),
  pastDaysProgress: () => L('الأيام الماضية وتقدّم خططك', 'Past days and your plans’ progress', 'Jours passés et avancement de vos plans'),
  pastDays: () => L('الأيام الماضية', 'Past days', 'Jours passés'),

  // today
  todayPlan: () => L('خطة اليوم', 'Today’s plan', 'Plan du jour'),
  noPlanYet: () =>
    L(
      'لا خطة للحفظ بعد. اختر وتيرة تناسب يومك ونرتّب لك الباقي.',
      'No memorization plan yet. Pick a pace that fits your day and we’ll plan the rest.',
      'Pas encore de plan de mémorisation. Choisissez un rythme adapté à votre journée, on s’occupe du reste.',
    ),
  setUpPlan: () => L('ابدأ خطتي', 'Set up my plan', 'Définir mon plan'),
  nothingToday: () => L('لا وِرد لك اليوم.', 'Nothing is planned for today.', 'Rien de prévu aujourd’hui.'),
  nothingTodayNext: (day) => L(`لا وِرد اليوم. موعد وِردك التالي: ${day}.`, `Nothing today. Next: ${day}.`, `Rien aujourd’hui. Prochain : ${day}.`),
  allDone: () => L('ما شاء الله، أتممتَ ورد اليوم.', 'MashaAllah, you’ve finished today’s plan.', 'MashaAllah, vous avez terminé le plan du jour.'),
  congratsTitle: () => L('ما شاء الله، أتممتَ وِردك', 'MashaAllah, today is done', 'MashaAllah, c’est fait pour aujourd’hui'),
  congratsBody: () =>
    L(
      'بارك الله فيك وفي جهدك. نلقاك غدًا على وِرد جديد.',
      'May Allah bless your effort. Come back tomorrow for the next portion.',
      'Qu’Allah bénisse votre effort. Revenez demain pour la suite.',
    ),
  aheadDone: () => L('بارك الله فيك، سبقتَ ورد الغد.', 'Well done, you’re ahead of schedule.', 'Bravo, vous êtes en avance.'),

  // revision
  reviseHint: () =>
    L('ثبّت ما حفظتَه بخطة مراجعة منتظمة.', 'Keep what you know fresh with a steady revision plan.', 'Consolidez ce que vous savez avec un plan de révision régulier.'),
  reviseLocked: () =>
    L(
      'أضف محفوظك أولاً لتبدأ المراجعة.',
      'Revision opens once you’ve memorized something.',
      'La révision s’ouvre dès que vous avez mémorisé quelque chose.',
    ),
  startRevision: () => L('ابدأ خطة مراجعة', 'Start a revision plan', 'Commencer un plan de révision'),
  noRevision: () => L('لا مراجعة عليك اليوم.', 'No revision planned for today.', 'Pas de révision prévue aujourd’hui.'),

  // a daily card
  dayOfN: (k, n) => L(`اليوم ${k} من ${n}`, `Day ${k} of ${n}`, `Jour ${k} sur ${n}`),
  forDay: (day) => L(`ورد ${day}`, `For ${day}`, `Pour ${day}`),
  weekComplete: () => L('أتممتَ ورد هذا الأسبوع', 'This week is complete', 'La semaine est complète'),
  complete: () => L('أتممتُ', 'Complete', 'Terminer'),
  holdHint: () =>
    L('اضغط مطوّلاً لتحدّد الآية التي وقفتَ عندها', 'Press and hold to choose where you stopped', 'Appui long pour choisir où vous vous êtes arrêté'),
  listenPortion: () => L('استمع إلى هذا الورد', 'Listen to this portion', 'Écouter cette portion'),
  undo: () => L('تراجع', 'Undo', 'Annuler'),
  notDoneToast: () =>
    L('لم تُتمّه؛ أجّلناه إلى الغد.', 'Marked not done; moved to the next day.', 'Marqué « non fait » ; reporté au jour suivant.'),
  partialToast: () =>
    L('وقفتَ في منتصفه، ونُكمل الباقي غدًا.', 'Stopped partway; the rest carries on to the next day.', 'Arrêté en cours de route ; la suite est reportée.'),

  // the «where did you stop» sheet
  stopTitle: () => L('عند أي آية وقفتَ؟', 'Where did you stop?', 'Où vous êtes-vous arrêté ?'),
  stopHint: () =>
    L(
      'نحسب ما حفظتَه حتى هذه الآية، ويبقى الباقي لغدٍ.',
      'Ayat up to this one are counted; the rest carries forward.',
      'Les versets jusqu’à celui-ci sont comptés ; la suite est reportée.',
    ),
  stopSaved: () => L('سُجّل، ونُكمل الباقي غدًا.', 'Saved; the rest carries forward.', 'Enregistré ; la suite est reportée.'),
  close: () => L('إغلاق', 'Close', 'Fermer'),
  stoppedAt: () => L('وقفتُ عند آية…', 'Stopped at an ayah…', 'Arrêté à un verset…'),
  markNotDone: () => L('لم أتمّها', 'Mark as not done', 'Marquer comme non fait'),
  markNotDoneHint: () =>
    L('ننقل هذا الورد وما بعده إلى الأيام التالية.', 'This portion and the later ones shift to the following days.', 'Cette portion et les suivantes sont décalées.'),
  clearMark: () => L('إزالة العلامة', 'Clear the mark', 'Effacer la marque'),

  // setting up or editing a plan (the questions)
  stepOf: (i, n) => L(`السؤال ${i} من ${n}`, `Question ${i} of ${n}`, `Question ${i} sur ${n}`),
  continue: () => L('متابعة', 'Continue', 'Continuer'),
  previous: () => L('السابق', 'Previous', 'Précédent'),
  next: () => L('التالي', 'Next', 'Suivant'),
  startPlan: () => L('ابدأ خطتي', 'Start my plan', 'Commencer mon plan'),
  planReady: () => L('خطتك جاهزة', 'Your plan is ready', 'Votre plan est prêt'),
  whatToDo: () => L('بماذا تريد أن تبدأ؟', 'What would you like to do?', 'Que souhaitez-vous faire ?'),
  whatToDoSub: () =>
    L(
      'ويمكنك إضافة الآخر في أي وقت.',
      'Pick where to start; you can add the other later.',
      'Choisissez par où commencer ; vous pourrez ajouter l’autre plus tard.',
    ),
  memorizeOpt: () => L('حفظ جديد', 'Memorize something new', 'Mémoriser du nouveau'),
  memorizeOptSub: () => L('آيات لم تحفظها بعد', 'Ayat you don’t know yet', 'Des versets que vous ne connaissez pas encore'),
  reviseOpt: () => L('مراجعة', 'Revise', 'Réviser'),
  reviseOptSub: () => L('تثبيت ما حفظتَه من قبل', 'Keep what you know fresh', 'Consolider ce que vous savez'),
  reviseOptLocked: () =>
    L('أضف محفوظك أولاً لتفعيل المراجعة.', 'Add what you’ve memorized first to unlock this.', 'Ajoutez d’abord ce que vous avez mémorisé.'),
  scopeQuestion: (revise) =>
    revise
      ? L('ماذا تريد أن تراجع؟', 'What will you revise?', 'Que voulez-vous réviser ?')
      : L('ماذا تريد أن تحفظ الآن؟', 'What are you memorizing now?', 'Que mémorisez-vous maintenant ?'),
  scopeSub: () =>
    L('القرآن كله، أو أثمان تختارها.', 'The whole Quran, or only the thumun you choose.', 'Tout le Coran, ou seulement les thumun choisis.'),
  scopeSpecific: () => L('سور محددة', 'Specific surahs', 'Des sourates précises'),
  scopeSpecificSub: () => L('اختر السور أو الأجزاء', 'Choose surahs or juz', 'Choisissez sourates ou juz'),
  nothingToRevise: () => L('ليس في هذا الاختيار ما تراجعه.', 'Nothing to revise in this selection.', 'Rien à réviser dans cette sélection.'),
  nothingToReviseSub: () =>
    L(
      'كل ما اخترتَه محفوظ لديك بالفعل. ارجع واختر سوراً أخرى.',
      'Everything you picked is already memorized. Go back and choose other surahs.',
      'Tout ce que vous avez choisi est déjà mémorisé. Revenez choisir d’autres sourates.',
    ),
  amountQuestion: (revise, weekly) =>
    revise
      ? weekly
        ? L('كم تراجع أسبوعياً؟', 'How much do you revise weekly?', 'Combien révisez-vous par semaine ?')
        : L('كم تراجع يومياً؟', 'How much do you revise daily?', 'Combien révisez-vous par jour ?')
      : weekly
        ? L('كم تحفظ أسبوعياً؟', 'How much do you memorize weekly?', 'Combien mémorisez-vous par semaine ?')
        : L('كم تحفظ يومياً؟', 'How much do you memorize daily?', 'Combien mémorisez-vous par jour ?'),
  amountSub: () =>
    L('القليل مع المداومة يبلغ بك بعيداً.', 'Small, consistent amounts add up powerfully over time.', 'Un peu, régulièrement, mène loin.'),
  encouragement: () =>
    L(
      'كل آية تحفظها تقرّبك من ختم القرآن، والمداومة على أي وتيرة توصلك.',
      'Every ayah memorized is one ayah closer to your goal. Any pace, done consistently, will get you there.',
      'Chaque verset est un pas vers votre but. Tout rythme, tenu avec constance, y mène.',
    ),
  pickDate: () => L('أريد تحديد تاريخ أنتهي فيه', 'I’d rather pick a finish date', 'Je préfère choisir une date de fin'),
  pickAmount: () => L('أريد تحديد المقدار بنفسي', 'I’d rather set an amount', 'Je préfère fixer une quantité'),
  whenQuestion: () => L('متى تريد أن تنتهي؟', 'When do you want to finish?', 'Quand voulez-vous finir ?'),
  finishDate: () => L('تاريخ الانتهاء', 'Finish date', 'Date de fin'),
  thatsAbout: () => L('أي ما يقارب', 'That’s about', 'Soit environ'),
  daysQuestion: (revise) =>
    revise
      ? L('في أي أيام تريد أن تراجع؟', 'Which days do you want to revise?', 'Quels jours voulez-vous réviser ?')
      : L('في أي أيام تريد أن تحفظ؟', 'Which days do you want to memorize?', 'Quels jours voulez-vous mémoriser ?'),
  daysSub: () => L('اختر الأيام التي تريد أن يظهر فيها وِردك.', 'Your plan will appear on the days you pick.', 'Votre plan apparaîtra les jours choisis.'),
  everyDay: () => L('كل يوم', 'Every day', 'Tous les jours'),
  pickADay: () => L('اختر يوماً واحداً على الأقل.', 'Choose at least one day.', 'Choisissez au moins un jour.'),
  everyDaySub: () => L('تحديد كل أيام الأسبوع', 'Select all seven days', 'Sélectionner les sept jours'),
  selectedDays: (n) => L(`${n} من 7`, `${n} of 7`, `${n} sur 7`),
  splitQuestion: () => L('كم تحفظ في كل يوم؟', 'How much on each day?', 'Combien chaque jour ?'),
  splitSub: () =>
    L(
      'قسّمنا المقدار بالتساوي. عدّل أي يوم كما تشاء، نصفاً في يوم وأكثر في آخر.',
      'We split your week evenly. Change any day you like: half one day, more the next.',
      'Nous avons réparti la semaine à parts égales. Modifiez un jour à votre guise : la moitié un jour, davantage le suivant.',
    ),
  splitTotal: () => L('المجموع', 'Total', 'Total'),
  splitMatches: () => L('يطابق هدفك الأسبوعي', 'Matches your weekly goal', 'Correspond à votre objectif'),
  splitGoal: (goal) => L(`هدفك ${goal}`, `Your goal was ${goal}`, `Votre objectif était ${goal}`),
  splitEven: () => L('تقسيم متساوٍ', 'Split evenly', 'Répartir à parts égales'),
  splitRest: () => L('راحة', 'Day off', 'Repos'),
  divideTitle: (unit) => L(`كيف يُقسَّم ${unit} على الأيام؟`, `How should each ${unit} be split across the days?`, `Comment répartir chaque ${unit} sur les jours ?`),
  selectAll: () => L('تحديد الكل', 'Select all', 'Tout sélectionner'),
  clearAll: () => L('إلغاء التحديد', 'Clear', 'Tout effacer'),
  splitQuestionAbout: (unit) => L(`كم ${unit} تقريباً في كل يوم؟`, `About how many ${unit} each day?`, `Environ combien de ${unit} par jour ?`),
  splitQuestionExact: (unit) => L(`كم ${unit} في كل يوم؟`, `How many ${unit} each day?`, `Combien de ${unit} par jour ?`),
  splitSubExact: () =>
    L(
      'الأيام التي حدّدتها دقيقة. آخر يوم في كل أسبوع هو الذي يتغيّر قليلاً لأنه يأخذ ما بقي.',
      'The days you set are exact. Only the last day of each week can vary, because it takes what is left.',
      'Les jours que vous fixez sont exacts. Seul le dernier jour de la semaine peut varier : il prend le reste.',
    ),
  splitLastDay: (unit) =>
    L(
      `آخر يوم يأخذ ما بقي، فينتهي الأسبوع مع نهاية ${unit}.`,
      `The last day takes what is left, so each week ends with the ${unit}.`,
      `Le dernier jour prend le reste : chaque semaine finit avec le ${unit}.`,
    ),
  splitSubAbout: () =>
    L(
      'هذه أرقام تقريبية، فالأجزاء والأحزاب تختلف قليلاً في الطول. تُقسَّم كل أسبوع بدقة، وتستطيع تعديل أي يوم، حتى بالنصف.',
      'These are approximate: juz and hizb differ a little in length. Each real week is cut exactly, and you can change any day, even by half.',
      'Ces chiffres sont approximatifs : juz et hizb diffèrent un peu en longueur. Chaque semaine réelle est découpée exactement ; modifiez un jour à votre guise, même d’un demi.',
    ),
  divideSub: () =>
    L(
      'يبقى الأسبوع مرتبطاً بنهاية الوحدة، ويُقسَّم ورد كل أسبوع على أيامك عند حدود الوحدة الأصغر.',
      'Each week still ends where the unit ends. Its portion is cut into your days at the edges of the smaller unit.',
      'Chaque semaine finit là où finit l’unité. Sa portion est découpée sur vos jours aux limites de la plus petite unité.',
    ),
  splitGoalAbout: (goal, unit) =>
    L(
      `نحو ${goal} في الأسبوع (${unit}). آخر يوم يأخذ ما بقي فينتهي الأسبوع مع الوحدة.`,
      `About ${goal} a week (${unit}). The last day takes what is left, so the week ends with the unit.`,
      `Environ ${goal} par semaine (${unit}). Le dernier jour prend le reste : la semaine finit avec l’unité.`,
    ),
  divideSplitBy: () => L('يُقسَّم حسب', 'Split by', 'Découpé par'),
  dateTooBig: (unit) =>
    L(
      `${unit} كامل كل يوم أكبر مما يحتاجه هذا التاريخ.`,
      `A whole ${unit} a day is more than this date needs.`,
      `1 ${unit} entier par jour dépasse ce qu’il faut pour cette date.`,
    ),
  dateUseSmaller: (unit) => L(`استخدم ${unit} بدلاً من ذلك`, `Use ${unit} instead`, `Utiliser ${unit} à la place`),
  splitMore: () => L('زِد', 'More', 'Plus'),
  splitLess: () => L('أنقِص', 'Less', 'Moins'),
  perDay: () => L('في كل يوم', 'Each day', 'Chaque jour'),
  planSaved: () => L('سُجّلت خطتك.', 'Plan saved.', 'Plan enregistré.'),

  // editing a plan (one page)
  covers: () => L('ما تشمله الخطة', 'What it covers', 'Ce que ça couvre'),
  pace: () => L('الوتيرة', 'Pace', 'Rythme'),
  days: () => L('الأيام', 'Days', 'Jours'),
  newPaceFrom: () => L('يبدأ التعديل من', 'New pace from', 'Nouveau rythme dès le'),
  pastDaysKept: () => L('الأيام الماضية تبقى كما كانت.', 'Past days keep their old plan.', 'Les jours passés gardent leur ancien plan.'),
  finishLine: (revise) =>
    revise
      ? L('تنتهي دورة المراجعة في', 'You’ll finish a full revision on', 'Vous aurez tout révisé le')
      : L('تختم بإذن الله في', 'You’ll finish on', 'Vous finirez le'),
  resumePlan: () => L('استئناف الخطة', 'Resume plan', 'Reprendre le plan'),
  pausePlan: () => L('إيقاف الخطة مؤقتاً', 'Pause plan', 'Mettre en pause'),
  deletePlan: () => L('حذف الخطة', 'Delete plan', 'Supprimer le plan'),
  saveChanges: () => L('تأكيد التعديلات', 'Save changes', 'Enregistrer'),
  confirmDelete: () =>
    L(
      'هل تريد حذف هذه الخطة وسجلّها؟ ما حفظتَه لن يُحذف.',
      'Delete this plan and its session history? (What you memorized stays.)',
      'Supprimer ce plan et son historique ? (Ce que vous avez mémorisé reste.)',
    ),

  // my plans
  paused: () => L('متوقفة مؤقتاً', 'Paused', 'En pause'),
  modify: () => L('تعديل', 'Modify', 'Modifier'),
  resume: () => L('استئناف', 'Resume', 'Reprendre'),
  pause: () => L('إيقاف', 'Pause', 'Pause'),
  delete: () => L('حذف', 'Delete', 'Supprimer'),
  noPlans: () => L('لا خطط بعد. أضف خطة لتبدأ.', 'No plans yet. Add one to get started.', 'Aucun plan pour l’instant. Ajoutez-en un pour commencer.'),
  addPlan: () => L('خطة جديدة', 'Add plan', 'Ajouter un plan'),

  // history
  noHistory: () =>
    L(
      'لا أيام هنا بعد. تظهر أيامك حين تبدأ خطة.',
      'Nothing yet. Days will appear here once you set a plan.',
      'Rien pour l’instant. Les jours apparaîtront ici dès que vous aurez un plan.',
    ),
  extraRevision: () => L('مراجعة إضافية', 'Extra revision', 'Révision en plus'),
  older: () => L('أيام سابقة', 'Older', 'Plus ancien'),
  sessionRemoved: () => L('حُذفت الجلسة.', 'Session removed.', 'Séance supprimée.'),

  // what I’ve memorized
  memorizedQuestion: () => L('ما الذي حفظتَه؟', 'What have you memorized?', 'Qu’avez-vous mémorisé ?'),
  memorizedSub: () => L('حدّد ما حفظتَه بالسورة أو بالجزء.', 'Mark it by surah or by juz.', 'Indiquez-le par sourate ou par juz.'),
  ofQuran: () => L('من القرآن', 'of the Quran', 'du Coran'),
  surahs: () => L('السور', 'Surahs', 'Sourates'),
  juzPlural: () => L('الأجزاء', 'Juz', 'Juz'),
  autoSaved: () =>
    L(
      'يُسجَّل ما تختاره تلقائيًا، وما تُتمّه من وِردك يُضاف هنا.',
      'Saved as you go. Whatever you complete in your plan is added here.',
      'Enregistré automatiquement. Ce que vous terminez dans votre plan s’ajoute ici.',
    ),
  wholeQuran: () => L('حفظتُ القرآن كاملاً', 'I know the whole Quran', 'Je connais tout le Coran'),
  nothingYet: () => L('لم أحفظ شيئاً بعد', 'Nothing yet', 'Rien encore'),
  searchSurah: () => L('ابحث عن سورة', 'Search a surah', 'Chercher une sourate'),
  fromAyah: () => L('من آية', 'From ayah', 'Du verset'),
  toAyah: () => L('إلى', 'to', 'au'),
  add: () => L('أضف', 'Add', 'Ajouter'),
  remove: () => L('أزل', 'Remove', 'Retirer'),
  hizbWord: () => L('الحزب', 'Hizb', 'Hizb'),
  juzWord: () => L('الجزء', 'Juz', 'Juz'),
  // Listen (استماع)
  lsWarshSoon: () => L('الاستماع متاح الآن بالرواية الحفصية فقط، وورش قريباً. غيّر الرواية من إعدادات المصحف.', 'Listening is available in Hafs for now; Warsh is coming. Change the narration in the Quran’s settings.', 'L’écoute est disponible en Hafs pour l’instant ; Warsh arrive. Changez la narration dans les réglages du Coran.'),
  lsNothingChosen: () => L('لم تختر آيات بعد', 'No ayat chosen yet', 'Aucun verset choisi'),
  lsAyatCount: (n) =>
    L(n === 1 ? 'آية واحدة' : n === 2 ? 'آيتان' : n < 11 ? `${n} آيات` : `${n} آية`, n === 1 ? '1 ayah' : `${n} ayat`, n === 1 ? '1 verset' : `${n} versets`),
  lsQuickH: () => L('اختيار سريع', 'Quick select', 'Sélection rapide'),
  lsQuickPage: () => L('الصفحة كلها', 'Whole page', 'Toute la page'),
  lsQuickSurah: () => L('السورة كلها', 'Whole surah', 'Toute la sourate'),
  lsQuickClear: () => L('مسح الاختيار', 'Clear the choice', 'Effacer le choix'),
  lsPlay: () => L('استماع', 'Play', 'Écouter'),
  lsPause: () => L('إيقاف مؤقت', 'Pause', 'Pause'),
  lsPrevStep: () => L('السابق', 'Previous', 'Précédent'),
  lsNextStep: () => L('التالي', 'Next', 'Suivant'),
  lsStep: (n, m) => L(`الخطوة ${n} من ${m}`, `step ${n} of ${m}`, `étape ${n} sur ${m}`),
  lsTime: (n, m) => L(m ? `المرة ${n} من ${m}` : `المرة ${n}`, m ? `time ${n} of ${m}` : `time ${n}`, m ? `fois ${n} sur ${m}` : `fois ${n}`),
  lsRound: (n, m) => L(m ? `الإعادة ${n} من ${m}` : `الإعادة ${n}`, m ? `round ${n} of ${m}` : `round ${n}`, m ? `tour ${n} sur ${m}` : `tour ${n}`),
  lsDone: () => L('انتهى الاستماع', 'Finished', 'Terminé'),
  lsError: () => L('تعذّر تشغيل الصوت', 'The audio could not be played', 'Le son n’a pas pu être lu'),
  lsSpeed: () => L('السرعة', 'Speed', 'Vitesse'),
  lsMethod: () => L('طريقة الاستماع', 'Way of listening', 'Façon d’écouter'),
  lsMethodEach: () => L('كل آية بدورها', 'Each ayah in turn', 'Chaque verset à son tour'),
  lsMethodEachD: () => L('تسمع كل آية بعدد المرات التي اخترتها، ثم التي بعدها.', 'Each ayah is heard as many times as you chose, then the next.', 'Chaque verset est écouté autant de fois que choisi, puis le suivant.'),
  lsMethodPrev: () => L('ربط كل آية بالتي قبلها', 'Link each ayah with the one before', 'Relier chaque verset au précédent'),
  lsMethodPrevD: () => L('الأولى، ثم الثانية، ثم الاثنتان معاً، ثم الثالثة، ثم الثانية والثالثة معاً…', 'The first, then the second, then both together, then the third, then the second and third together…', 'Le premier, puis le deuxième, puis les deux ensemble, puis le troisième, puis le deuxième et le troisième ensemble…'),
  lsMethodAll: () => L('ربط كل آية بكل ما قبلها', 'Link each ayah with all those before', 'Relier chaque verset à tous les précédents'),
  lsMethodAllD: () => L('الأولى، ثم الثانية، ثم الاثنتان معاً، ثم الثالثة، ثم الثلاث معاً…', 'The first, then the second, then both together, then the third, then all three together…', 'Le premier, puis le deuxième, puis les deux ensemble, puis le troisième, puis les trois ensemble…'),
  lsReciter: () => L('القارئ', 'Reciter', 'Récitateur'),
  lsLoop: () => L('تكرار المقطع كله بلا توقف', 'Repeat the whole selection without stopping', 'Répéter toute la sélection sans arrêt'),
  lsSurah: () => L('سورة', 'Surah', 'Sourate'),
  lsAyah: () => L('آية', 'Ayah', 'Verset'),
  lsOther: () => L('رقم آخر', 'Other number', 'Autre nombre'),
  lsRangeH: () => L('الآيات', 'Ayat', 'Versets'),
  lsFrom: () => L('من', 'From', 'De'),
  lsTo: () => L('إلى', 'To', 'À'),
  lsEachH: () => L('كم مرة تسمع كل آية؟', 'Play each ayah', 'Écouter chaque verset'),
  lsRoundsH: () => L('كم مرة تسمع المقطع كله؟', 'Play the whole selection', 'Écouter toute la sélection'),
  lsOptional: () => L('(اختياري)', '(optional)', '(facultatif)'),
  lsSettings: () => L('إعدادات الاستماع', 'Playback settings', 'Réglages d’écoute'),
  lsLocked: () => L('اخترتَ الآيات. لتغييرها اضغط ✕ أو افتح الإعدادات.', 'The ayat are set. To change them, press ✕ or open settings.', 'Les versets sont choisis. Pour les changer, appuyez sur ✕ ou ouvrez les réglages.'),
  lsPickMore: () => L('اضغط على آية أخرى لتشمل ما بينهما', 'tap another ayah to include everything between', 'touchez un autre verset pour inclure tout ce qui est entre'),
  lsPickShort: () => L('اضغط على آية في الصفحة', 'Tap an ayah on the page', 'Touchez un verset sur la page'),
  lsPageN: (n) => L(`صفحة ${n}`, `Page ${n}`, `Page ${n}`),
  lsGo: () => L('ابدأ الاستماع', 'Play audio', 'Lancer l’écoute'),
  lsClose: () => L('إغلاق', 'Close', 'Fermer'),
  // the Plan page for someone with no plan yet, and the cards' one-line subtitles
  planIntro: () => L('ضع خطة، وسترى هنا كل يوم ما تحفظه وما تراجعه.', 'Set a plan and this page shows each day what to memorize and what to revise.', 'Créez un plan et cette page vous montre chaque jour quoi mémoriser et quoi réviser.'),
  doneMemorized: () => L('تمّ الحفظ', 'Memorized', 'Mémorisé'),
  doneRevised: () => L('تمّت المراجعة', 'Revised', 'Révisé'),
  cardHifdh: () => L('الحفظ', 'Memorization', 'Mémorisation'),
  cardMurajaa: () => L('المراجعة', 'Revision', 'Révision'),
  noHifdhPlan: () => L('لا توجد خطة حفظ بعد', 'No memorization plan yet', 'Aucun plan de mémorisation pour l’instant'),
  noHifdhPlanSub: () =>
    L(
      'اختر ما تريد حفظه ومقدار وِردك كل يوم، وسيظهر لك هنا.',
      'Choose what to memorize and how much each day, and it will show up here.',
      'Choisissez ce que vous voulez mémoriser et le rythme de chaque jour : il apparaîtra ici.',
    ),
  noRevPlan: () => L('لا توجد خطة مراجعة بعد', 'No revision plan yet', 'Aucun plan de révision pour l’instant'),
  noRevPlanSub: () =>
    L(
      'اختر ما تريد مراجعته وكم تراجع في الأسبوع.',
      'Choose what you want to revise and how much each week.',
      'Choisissez ce que vous voulez réviser et le rythme de chaque semaine.',
    ),
  noRevPlanLocked: () =>
    L(
      'سجّل ما حفظته أولًا، ثم تبدأ مراجعته.',
      'Add what you’ve already memorized first, then revision opens.',
      'Ajoutez d’abord ce que vous avez mémorisé : la révision s’ouvrira ensuite.',
    ),
  todaySub: () => L('ما تحفظه اليوم', 'What to memorize today', 'À mémoriser aujourd’hui'),
  reviseSub: () => L('ما تراجعه ليبقى محفوظاً', 'What to revise so it stays with you', 'À réviser pour que cela reste'),
  reviseDoneTitle: () => L('ما شاء الله، أتممتَ مراجعتك', 'MashaAllah, revision done', 'Machaallah, révision terminée'),
  reviseDoneBody: () => L('ما حفظتَه ازداد رسوخًا، بارك الله فيك.', 'What you know is a little firmer. Barakallahu feek.', 'Ce que vous savez est un peu plus solide. Qu’Allah vous bénisse.'),
  // Recite (تسميع): the page is covered and shows itself back one ayah or one word at a time
  reciteTitle: () => L('تسميع', 'Recite', 'Réciter'),
  reciteModeAyah: () => L('آية آية', 'Ayah by ayah', 'Verset par verset'),
  reciteModeWord: () => L('كلمة كلمة', 'Word by word', 'Mot par mot'),
  reciteLevelBlank: () => L('صفحة فارغة', 'Blank', 'Vide'),
  reciteLevelFirst: () => L('أول كلمة تظهر', 'First word shows', 'Premier mot visible'),
  reciteStart: () => L('ابدأ التسميع', 'Start', 'Commencer'),
  reciteNothing: () => L('لم تختر آيات بعد', 'No ayat chosen yet', 'Aucun verset choisi'),
  recitePick: () => L('اضغط آية للبداية، ثم آية للنهاية', 'Tap an ayah to start, then another to end', 'Touchez un verset pour commencer, puis un autre pour finir'),
  reciteHideAll: () => L('إخفاء الكل', 'Hide all', 'Tout masquer'),
  reciteShowAll: () => L('إظهار الكل', 'Show all', 'Tout afficher'),
  reciteReveal: () => L('أظهر', 'Show', 'Afficher'),
  reciteHint: () => L('تلميح', 'Hint', 'Indice'),
  reciteBack: () => L('رجوع', 'Back', 'Retour'),
  reciteStop: () => L('إنهاء', 'End', 'Terminer'),
  reciteAgain: () => L('من البداية', 'Again', 'Recommencer'),
  reciteAyahOf: (i, n) => L(`الآية ${i} من ${n}`, `Ayah ${i} of ${n}`, `Verset ${i} sur ${n}`),
  reciteWordOf: (w, m, i, n) => L(`الكلمة ${w}/${m} · الآية ${i}/${n}`, `Word ${w}/${m} · ayah ${i}/${n}`, `Mot ${w}/${m} · verset ${i}/${n}`),
  reciteDone: () => L('أتممتَ التسميع، بارك الله فيك', 'You finished. Barakallahu feek.', 'Terminé. Qu’Allah vous bénisse.'),
  reciteLoading: () => L('جارٍ التحميل…', 'Loading…', 'Chargement…'),
  reciteFailed: () => L('تعذّر تحميل النص. تحقق من الاتصال.', 'Could not load the text. Check your connection.', 'Texte indisponible. Vérifiez la connexion.'),
};
