// Interface language: Arabic (default), English or French, chosen in the settings. The same texts as
// the website (its src/core/i18n.js and i18n-fr.js, copied here).
//
// Only the interface changes: the mushaf pages, the Quran text and the Arabic search stay as they
// are. Switching sets the language here (live bindings: every module reading LANG, isEnglish... sees
// the new one) and the app is drawn again from its root (src/app/_layout.tsx listens), no restart.
//
// French is laid out exactly as English (left to right, Latin surah names); only the words differ.
// Its texts are in i18n-fr.js; anything not translated there is shown in English.
import { FR } from './i18n-fr.js';

const saved = () => {
  try {
    const lang = globalThis.localStorage?.getItem('lang');
    return lang === 'en' || lang === 'fr' ? lang : 'ar';
  } catch {
    return 'ar';
  }
};

export let LANG = 'ar';
export let isFrench = false;
// English or French: the left-to-right interface (named for English, which came first)
export let isEnglish = false;
// for dates and numbers
export let LOCALE = 'ar-MA';

function apply(lang) {
  LANG = lang;
  isFrench = lang === 'fr';
  isEnglish = lang !== 'ar';
  LOCALE = { ar: 'ar-MA', en: 'en-GB', fr: 'fr-FR' }[lang];
}
apply(saved());

// One text per language, for the few written in place: L('عربي', 'English', 'Français').
export const L = (ar, en, fr = en) => (isFrench ? fr : isEnglish ? en : ar);

// French typography: a non-breaking space before ? ! : ; % » and after «, so they never start a line
export const frenchSpaces = (s) => (typeof s === 'string' ? s.replace(/ ([?!:;%»])/g, ' $1').replace(/« /g, '« ') : s);

const listeners = new Set();
// fn(lang) is called after each change of language (the app's root draws everything again)
export const onLanguageChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setLanguage(lang) {
  try {
    globalThis.localStorage?.setItem('lang', lang);
  } catch {}
  apply(lang);
  listeners.forEach((fn) => fn(lang));
}

// Arabic plural agreement: 1, 2, 3-10, 11+
function arabicCount(n, [one, two, few, many]) {
  if (n === 1) return one;
  if (n === 2) return two;
  return `${n} ${n <= 10 ? few : many}`;
}

// key: [Arabic, English]; a value can be a function of the arguments.
const STRINGS = {
  pageAlt: [(p) => `صفحة ${p}`, (p) => `Page ${p}`],
  tajweed: ['أحكام التجويد', 'Tajweed rules'],
  hizb: [(n) => `الحزب ${n}`, (n) => `Hizb ${n}`],
  juz: [(n) => `الجزء ${n}`, (n) => `Juz ${n}`],
  pageShort: [(p) => `ص ${p}`, (p) => `p. ${p}`],
  hizbStartsSurah: [(name) => `بداية سورة ${name}`, (name) => `Start of ${name}`],
  hizbStartsAyah: [(name, a) => `سورة ${name} • من الآية ${a}`, (name, a) => `${name} • from ayah ${a}`],
  noResults: ['لا توجد نتائج', 'No results'],
  medinan: ['مدنية', 'Medinan'],
  meccan: ['مكية', 'Meccan'],

  // Ayah panel
  ayahTitle: [(name, a) => `سورة ${name} • الآية ${a}`, (name, a) => `${name} • Ayah ${a}`],
  tafsir: ['التفسير', 'Tafsir'],
  source: [(name) => `المصدر: ${name}`, (name) => `Source: ${name}`],
  noTafsir: ['لم يُختر أي تفسير. اختر من زر «التفاسير» في الأعلى.', 'No tafsir chosen. Choose one with «Tafsirs» above.'],
  noTranslation: ['لم تُختر أي ترجمة. اختر من زر «الترجمات» في الأعلى.', 'No translation chosen. Choose one with «Translations» above.'],
  tafsirsBtn: ['التفاسير', 'Tafsirs'],
  translationsBtn: ['الترجمات', 'Translations'],
  mushafWarsh: ['مصحف ورش عن نافع', 'Warsh ʿan Nāfiʿ mushaf'],
  mushafHafs: ['مصحف حفص عن عاصم', 'Hafs ʿan ʿĀṣim mushaf'],
  loadFailed: ['تعذّر التحميل، تحقق من الاتصال.', 'Could not load. Check your connection.'],
  copyRef: [(name, a, r) => `[سورة ${name} ${a} — رواية ${r}]`, (name, a, r) => `[${name} ${a} — ${r} narration]`],
  ayahCopied: ['تم نسخ الآية', 'Ayah copied'],
  copiedWithTafsir: ['تم نسخ الآية وتفسيرها', 'Ayah and tafsir copied'],
  copiedWithTranslation: ['تم نسخ الآية وترجمتها', 'Ayah and translation copied'],
  copyFailed: ['تعذّر النسخ على هذا الجهاز', 'Copying is not possible on this device'],
  translation: ['الترجمة', 'Translation'],

  // Mutashabihat (tab of the ayah panel)
  noSimilar: ['لا متشابهات لهذه الآية.', 'This ayah has no similar ayat.'],
  ayahRange: [(a, b) => `الآيات ${a}–${b}`, (a, b) => `Ayat ${a}–${b}`],
  simSource: ['المصدر: أصوات القرّاء (aswaatulqurraa.com)', 'Source: Aswaatul Qurraa (aswaatulqurraa.com)'],

  // Bookmarks
  addBookmark: ['وضع علامة على هذه الصفحة', 'Bookmark this page'],
  removeBookmark: ['إزالة العلامة', 'Remove bookmark'],
  bookmarkTab: ['علامة', 'Bookmark'],
  deleteBookmark: ['حذف العلامة', 'Delete bookmark'],
  noBookmarks: [
    'لا توجد علامات بعد.<br />اضغط على الشريط أعلى أي صفحة لوضع علامة.',
    'No bookmarks yet.<br />Tap the ribbon at the top of any page to bookmark it.',
  ],
  recentPages: ['الصفحات الأخيرة', 'Recent pages'],
  hizbJuz: [(h, j) => `الحزب ${h} • الجزء ${j}`, (h, j) => `Hizb ${h} • Juz ${j}`],

  // Majalis al-Bararah (src/majalis.js)
  mjTasmiIntro: [
    'مجالس صوتية يتلو فيها الحفّاظ بعضهم على بعض، حتى سبعة أعضاء في المجلس. مجالس الإخوة ومجالس الأخوات منفصلة.',
    'Voice majalis where memorizers recite to each other, up to seven members each. Brothers’ and sisters’ majalis are separate.',
  ],
  mjIlmIntro: [
    'دروس مباشرة يقدّمها معلّمون معتمدون: يُرى المعلّم ويُسمع، ويستمع الحاضرون ويكتبون أسئلتهم في محادثة الدرس.',
    'Live lessons by approved teachers: the teacher is seen and heard; attendees listen and write their questions in the lesson’s chat.',
  ],
  // ZAIN is written the same in both languages, with «AI» in gold (the assistant's name hides AI).
  mjZain: ['<span dir="ltr">Z<span class="zain-ai">AI</span>N</span>', 'Z<span class="zain-ai">AI</span>N'],
  mjZainSub: ['مساعدك في المجالس', 'Your assistant in the majalis'],
  mjZainSoon: ['يُفتح ZAIN قريباً إن شاء الله.', 'ZAIN opens soon, in shāʾ Allāh.'],
  mjOpenNow: ['المجالس المفتوحة الآن', 'Majalis open now'],
  mjNoRooms: ['لا توجد مجالس مفتوحة بعد. ستُفتح المجالس قريباً إن شاء الله.', 'No majalis are open yet. They open soon, in shāʾ Allāh.'],
  mjLessons: ['الدروس', 'Lessons'],
  mjNoLessons: ['لا توجد دروس بعد. ستبدأ مع أول المعلّمين المعتمدين إن شاء الله.', 'No lessons yet. They start with the first approved teachers, in shāʾ Allāh.'],
  mjGuestNote: [
    'يمكنك الاطلاع على المجالس. وللمشاركة فيها (التلاوة والمحادثة) أنشئ حساباً.',
    'You can look around the majalis. To take part (recite and chat), create an account.',
  ],
  mjJoin: ['إنشاء حساب', 'Create an account'],
  mjFinishProfile: ['بقيت خطوة واحدة: أكمل ملفك لتشارك في المجالس.', 'One step left: complete your profile to take part.'],
  mjCompleteProfile: ['إكمال الملف', 'Complete my profile'],

  // The daily wird (src/wird.js)
  wirdDone: ['تقبّل الله وردك اليوم', 'May Allah accept your wird today'],
  wirdKhatmas: [(n) => `${n} ختمة`, (n) => `${n} khatma${n > 1 ? 's' : ''}`],
  wirdNextStep: [(s, a) => `خطوتك التالية غداً: ${s} · الآية ${a}`, (s, a) => `Your next step tomorrow: ${s} · ayah ${a}`],
  wirdKhatmaCongrats: [
    (n) => (n > 1 ? `مبارك! أتممت ختمتك رقم ${n}` : 'مبارك! أتممت ختم القرآن الكريم'),
    (n) => (n > 1 ? `Mabrook! You completed khatma number ${n}` : 'Mabrook! You have completed the whole Quran'),
  ],
  wirdKhatmaAgain: [
    'الباب مفتوح، والدرج يبدأ من جديد: ختمتك التالية تبدأ غداً من سورة الفاتحة، فارتقِ درجة كل يوم.',
    'The door is open, and the stairs begin again: your next khatma starts tomorrow with al-Fatiha. Rise one step every day.',
  ],
  wirdKhatmaSoFar: [(p) => `${p}٪ من ختمتك`, (p) => `${p}% of your khatma`],
  wirdSeeYou: ['تمّ', 'Done'],
  wirdSkip: ['تخطّي', 'Skip'],

  // Memorization (src/hifz.js, src/hifz-plan.js)
  hzTitle: ['الحفظ', 'Memorization'],
  hzLoading: ['جارٍ التحميل…', 'Loading…'],
  hzPage: [(n) => `الصفحة ${n}`, (n) => `Page ${n}`],
  hzPages: [(a, b) => `الصفحات ${a}–${b}`, (a, b) => `Pages ${a}–${b}`],
  hzQuarters: [
    (a, b) => (a === b ? `الربع ${a}` : `الأرباع ${a}–${b}`),
    (a, b) => (a === b ? `quarter ${a}` : `quarters ${a}–${b}`),
  ],
  hzNewBadge: ['وسام جديد:', 'New badge:'],
  hzQ_start: ['من أين تبدأ؟', 'Where are you starting from?'],
  hzA_start_new: [['أحفظ لأول مرة', 'لم أحفظ شيئاً بعد، أو القليل جداً'], ['First time', 'Nothing memorized yet, or very little']],
  hzA_start_some: [['حفظتُ جزءاً من القرآن', 'وأريد أن أكمل'], ['I have memorized some', 'and want to continue']],
  hzA_start_forgot: [['حفظتُ ثم نسيت كثيراً', 'وأريد أن أستعيد حفظي'], ['I memorized, then forgot much', 'and want to bring it back']],
  hzA_start_hafiz: [['أحفظ القرآن كاملاً', 'وأريد أن أثبّته بالمراجعة'], ['I know the whole Quran', 'and want to keep it with review']],
  hzQ_known: ['كم تحفظ تقريباً؟', 'How much do you know, roughly?'],
  hzFrom_end: ['من آخر المصحف', 'From the end'],
  hzFrom_start: ['من أوله', 'From the beginning'],
  hzFrom_scattered: ['أجزاء متفرقة', 'Scattered parts'],
  hzScatteredHint: ['اضغط على الأجزاء التي تحفظها.', 'Tap the juz you know.'],
  hzAmount: [
    (n) => {
      const whole = Math.floor(n / 2);
      const half = n % 2 ? ' ونصف' : '';
      if (!whole) return 'نصف جزء (حزب واحد)';
      const juz = whole === 1 ? 'جزء واحد' : whole === 2 ? 'جزءان' : `${whole} ${whole <= 10 ? 'أجزاء' : 'جزءاً'}`;
      return `${juz}${half} (${n === 2 ? 'حزبان' : `${n} ${n <= 10 ? 'أحزاب' : 'حزباً'}`})`;
    },
    (n) => `${n / 2} juz (${n} ${n === 1 ? 'hizb' : 'ahzab'})`,
  ],
  hzWhereEnd: [
    (h, s, a) => `من سورة الناس إلى بداية الحزب ${h}: سورة ${s.name}${a > 1 ? `، الآية ${a}` : ''}`,
    (h, s, a) => `From an-Nas back to the start of hizb ${h}: ${s.latin}${a > 1 ? ` ${a}` : ''}`,
  ],
  hzWhereStart: [
    (h, s) => `من سورة الفاتحة إلى نهاية الحزب ${h} (سورة ${s.name})`,
    (h, s) => `From al-Fatiha to the end of hizb ${h} (${s.latin})`,
  ],
  hzQ_strength: ['كيف حال حفظك عموماً؟', 'How solid is it, overall?'],
  hzA_strength_3: [['متقن', 'أتلوه دون أخطاء تقريباً'], ['Solid', 'I recite it with hardly any mistakes']],
  hzA_strength_2: [['متوسط', 'أتعثّر أحياناً'], ['Medium', 'I stumble sometimes']],
  hzA_strength_1: [['يحتاج مراجعة', 'نسيت كثيراً منه'], ['Needs review', "I've forgotten much of it"]],
  hzStrengthNote: [
    'لا تقلق من الدقة: بعد كل مراجعة تقيّم تلاوتك، فيتعلّم التطبيق قوة كل صفحة بنفسه.',
    "Don't worry about being exact: after each review you rate your recitation, and the app learns each page's strength by itself.",
  ],
  hzSt_0: ['لم يُحفظ', 'Not yet'],
  hzSt_1: ['ضعيف', 'Weak'],
  hzSt_2: ['متوسط', 'Medium'],
  hzSt_3: ['متقن', 'Solid'],
  hzQ_months: ['كم استغرق منك حفظه تقريباً؟', 'About how long did it take you?'],
  hzMonths_3: ['أقل من 3 أشهر', 'Under 3 months'],
  hzMonths_6: ['من 3 إلى 6 أشهر', '3 to 6 months'],
  hzMonths_12: ['من 6 أشهر إلى سنة', '6 months to a year'],
  hzMonths_24: ['من سنة إلى سنتين', '1 to 2 years'],
  hzMonths_36: ['أكثر من سنتين', 'More than 2 years'],
  hzMonths_0: ['لا أذكر', "I don't remember"],
  hzQ_time: ['كم من الوقت لديك؟', 'How much time do you have?'],
  hzDaysQ: ['أيام في الأسبوع', 'Days per week'],
  hzMinutesQ: ['دقائق في كل جلسة', 'Minutes per session'],
  hzMin: [(m) => `${m} د`, (m) => `${m} min`],
  hzQ_style: ['كيف تتعامل عادةً مع الخطط؟', 'How do you usually live with plans?'],
  hzA_style_steady: [['ألتزم بجدول ثابت', 'حصة يومية في أيام محددة، وتاريخ متوقع للختم'], ['I keep a fixed routine', 'a daily portion on set days, and a finish date']],
  hzA_style_flexible: [['وقتي يتغير من أسبوع لآخر', 'كل يوم تخبرنا بالوقت المتاح، ونرتّب لك الجلسة'], ['My time changes week to week', 'each day you say how much time you have, and the session fits it']],
  hzA_style_gentle: [['أبدأ بحماس ثم أتوقف', 'خطوات صغيرة جداً، بلا ضغط ولا عتاب'], ['I start strong, then stop', 'very small steps, no pressure, no guilt']],
  hzQ_goal: ['ما هدفك؟', 'What is your goal?'],
  hzA_goal_juz: [['جزء واحد', 'مثل جزء عمّ أو تبارك'], ['One juz', 'e.g. Amma or Tabarak']],
  hzA_goal_all: [['القرآن كاملاً', 'خطوة بعد خطوة'], ['The whole Quran', 'step by step']],
  hzWhichJuz: ['أي جزء؟', 'Which juz?'],
  hzQ_dir: ['من أين يبدأ الحفظ الجديد؟', 'Where should new memorization start?'],
  hzA_dir_end: [['من آخر المصحف', 'من سورة الناس إلى الوراء، كما يبدأ أغلب الحفّاظ'], ['From the end', 'from an-Nas backwards, as most memorizers begin']],
  hzA_dir_start: [['من أول المصحف', 'من الفاتحة والبقرة'], ['From the beginning', 'from al-Fatiha and al-Baqara']],
  hzPrev: ['السابق', 'Back'],
  hzNext: ['التالي', 'Next'],
  hzMakePlan: ['أنشئ خطتي', 'Make my plan'],
  hzPlanReady: ['خطتك جاهزة، بارك الله فيك', 'Your plan is ready'],
  hzKind_old: ['مراجعة بعيدة', 'Old review'],
  hzKind_recent: ['مراجعة قريبة', 'Recent review'],
  hzKind_new: ['حفظ جديد', 'New memorization'],
  hzKind_test: ['مراجعة', 'Self-test'],
  hzStart: ['ابدأ', 'Start'],
  hzStreak: ['يوماً متتالياً', 'days in a row'],
  hzFinish: ['الختم المتوقع', 'Expected finish'],
  hzHowLong: ['كم دقيقة لديك اليوم؟', 'How many minutes do you have today?'],
  hzThisWeek: [(n) => `هذا الأسبوع: ${n} من حصص الحفظ الجديد`, (n) => `This week: ${n} new portions`],
  hzWelcomeBack: ['مرحباً بعودتك! نبدأ بخطوة صغيرة، دون استعجال.', 'Welcome back! Let’s start with one small step, no rush.'],
  hzSmallStep: ['«أحبّ الأعمال إلى الله أدومها وإن قلّ». خطوة صغيرة اليوم تكفي.', '“The most beloved deeds to Allah are the most constant, even if small.” One small step today is enough.'],
  hzMore: [(n) => `المزيد (${n})`, (n) => `More (${n})`],
  hzAbout: [(m) => `حوالي ${m} دقيقة`, (m) => `About ${m} minutes`],
  hzDoneToday: ['أتممت ورد اليوم', 'Today’s portion is done'],
  hzDoneNote: ['بارك الله فيك. نلتقي غداً إن شاء الله.', 'May Allah bless you. See you tomorrow, in shāʾ Allāh.'],
  hzEditPlan: ['تعديل الخطة', 'Change my plan'],
  hzReviewIntro: ['اختبر نفسك في أي صفحة: تُخفى الآيات، وتظهر كل آية حين تضغط عليها.', 'Test yourself on any page: the ayat are hidden, and each one appears when you tap it.'],
  hzRandom: ['صفحة عشوائية من محفوظي', 'A random page I know'],
  hzChooseJuz: ['اختر جزءاً', 'Choose a juz'],
  hzChoosePage: ['اختر صفحة', 'Choose a page'],
  hzStatPages: ['صفحة محفوظة', 'pages memorized'],
  hzStatJuz: ['جزءاً كاملاً', 'full juz'],
  hzStatReviews: ['مراجعة', 'reviews'],
  hzForecast: [
    (left, date) => `بقيت ${left} صفحة من هدفك. بهذه الوتيرة تختم في ${date} تقريباً.`,
    (left, date) => `${left} pages left in your goal. At this pace you finish around ${date}.`,
  ],
  hzGoalDone: ['أتممت هدفك! اختر هدفاً جديداً من «تعديل الخطة».', 'Goal reached! Choose a new goal in “Change my plan”.'],
  hzMapTitle: ['الأحزاب الستون', 'The 60 ahzab'],
  hzHizb: [(n) => `الحزب ${n}`, (n) => `Hizb ${n}`],
  hzBadgesCount: [(a, b) => `حصلت على ${a} من ${b} أوسمة`, (a, b) => `${a} of ${b} badges earned`],
  hzLearnIntro: ['اقرأ المقطع وكرّره حتى تحفظه، ثم اضغط «اختبر نفسي» لتُخفى الآيات.', 'Read the portion and repeat it until you know it, then tap “Test me” to hide the ayat.'],
  hzTestIntro: ['اتلُ من حفظك، ثم اضغط على الآية لتظهر وتتأكد.', 'Recite from memory, then tap an ayah to reveal it and check.'],
  hzTestMe: ['اختبر نفسي', 'Test me'],
  hzShowAll: ['إظهار الكل', 'Show all'],
  hzHideAll: ['إخفاء الكل', 'Hide all'],
  hzHint: ['تلميح: أول كلمة', 'Hint: first word'],
  hzOpenMushaf: ['افتح في المصحف', 'Open in the mushaf'],
  hzHowWent: ['كيف كانت تلاوتك؟', 'How did it go?'],
  hzRate_3: ['سهلة', 'Easy'],
  hzRate_2: ['جيدة', 'Good'],
  hzRate_1: ['صعبة', 'Hard'],
  hzRate_0: ['نسيت', 'Forgot'],
  hzRated: ['سُجّلت، بارك الله فيك', 'Saved, may Allah bless you'],
  hzRatedAgain: ['لا بأس، ستعود قريباً للمراجعة', 'No problem, it will come back soon'],
  hzBackToPlan: ['رجوع', 'Back'],
  badge_start: [['البداية', 'أول تلاوة في خطتك'], ['First step', 'Your first recitation in the plan']],
  badge_page: [['أول صفحة', 'حفظت صفحة كاملة'], ['First page', 'A whole page memorized']],
  badge_surah: [['سورة كاملة', 'حفظت سورة كاملة'], ['A whole surah', 'A whole surah memorized']],
  badge_days7: [['سبعة أيام', 'تلوت في سبعة أيام مختلفة'], ['Seven days', 'Recited on seven different days']],
  badge_streak7: [['أسبوع متصل', 'سبعة أيام متتالية'], ['A full week', 'Seven days in a row']],
  badge_hizb: [['حزب كامل', 'حفظت حزباً كاملاً'], ['A whole hizb', 'A whole hizb memorized']],
  badge_juz: [['جزء كامل', 'حفظت جزءاً كاملاً'], ['A whole juz', 'A whole juz memorized']],
  badge_amma: [['جزء عمّ', 'حفظت جزء عمّ كاملاً'], ['Juz Amma', 'Juz Amma memorized']],
  badge_reviews50: [['مراجع مثابر', '50 مراجعة'], ['Faithful reviewer', '50 reviews']],
  badge_strong10: [['راسخ', '10 صفحات تلوتها بسهولة'], ['Firm', '10 pages recited with ease']],
  badge_tests20: [['المختبِر', '20 اختباراً في «مراجعة»'], ['Self-tester', '20 self-tests']],
  badge_comeback: [['العودة', 'عدت بعد غياب أسبوع أو أكثر'], ['The return', 'Back after a week or more away']],
  badge_juz5: [['خمسة أجزاء', 'حفظت خمسة أجزاء'], ['Five juz', 'Five juz memorized']],
  badge_juz10: [['عشرة أجزاء', 'حفظت عشرة أجزاء'], ['Ten juz', 'Ten juz memorized']],
  badge_half: [['نصف القرآن', 'حفظت خمسة عشر جزءاً'], ['Half the Quran', 'Fifteen juz memorized']],
  badge_juz20: [['عشرون جزءاً', 'حفظت عشرين جزءاً'], ['Twenty juz', 'Twenty juz memorized']],
  badge_khatm: [['ختم القرآن', 'حفظت القرآن كاملاً'], ['The whole Quran', 'The whole Quran memorized']],
  badge_reviews500: [['حارس الحفظ', '500 مراجعة'], ['Keeper of the Quran', '500 reviews']],

  // Ahadith (src/ahadith.js)
  ahTitle: ['كتب الأحاديث', 'Books of Ahadith'],
  ahHome: ['الرئيسية', 'Home'],
  ahBack: ['رجوع', 'Back'],
  ahLoading: ['جارٍ التحميل…', 'Loading…'],
  ahOffline: ['تعذّر التحميل. تحقّق من اتصالك بالإنترنت.', 'Could not load. Please check your internet connection.'],
  ah_bukhari: ['صحيح البخاري', 'Sahih al-Bukhari'],
  ah_muslim: ['صحيح مسلم', 'Sahih Muslim'],
  ah_nawawi: ['الأربعون النووية', 'An-Nawawi’s Forty'],
  // On the book covers, always in Arabic, as printed on the books
  ah_bukhari_cover: ['صحيح البخاري', 'صحيح البخاري'],
  ah_muslim_cover: ['صحيح مسلم', 'صحيح مسلم'],
  ah_nawawi_cover: ['الأربعون النووية', 'الأربعون النووية'],
  ah_bukhari_by: ['الإمام محمد بن إسماعيل البخاري', 'Imam Muhammad ibn Ismaʿil al-Bukhari'],
  ah_muslim_by: ['الإمام مسلم بن الحجاج النيسابوري', 'Imam Muslim ibn al-Hajjaj an-Naysaburi'],
  ah_nawawi_by: ['الإمام يحيى بن شرف النووي', 'Imam Yahya ibn Sharaf an-Nawawi'],
  ahHadithCount: [(n) => arabicCount(n, ['حديث واحد', 'حديثان', 'أحاديث', 'حديثاً']), (n) => `${n} hadiths`],
  ahNumber: [(n) => `رقم ${n}`, (n) => `no. ${n}`],
  ahBabCount: [(n) => arabicCount(n, ['باب واحد', 'بابان', 'أبواب', 'باباً']), (n) => (n === 1 ? '1 chapter' : `${n} chapters`)],
  ahKitabN: [(n) => `الكتاب ${n}`, (n) => `Book ${n}`],
  ahContinue: ['تابع القراءة', 'Continue reading'],
  ahSaved: ['الأحاديث المحفوظة', 'Saved hadiths'],
  ahSearchAll: ['ابحث في الكتب الثلاثة', 'Search the three books (in Arabic)'],
  ahSearching: ['جارٍ البحث…', 'Searching…'],
  ahNoResults: ['لا توجد نتائج', 'No results'],
  ahResultCount: [(n) => arabicCount(n, ['نتيجة واحدة', 'نتيجتان', 'نتائج', 'نتيجة']), (n) => (n === 1 ? '1 result' : `${n} results`)],
  ahManyResults: ['أكثر من 200 نتيجة: أضف كلمة لتضييق البحث', 'More than 200 results: add a word to narrow the search'],
  ahCopy: ['نسخ', 'Copy'],
  ahShare: ['مشاركة', 'Share'],
  ahSave: ['حفظ', 'Save'],
  ahCopied: ['نُسخ الحديث', 'Hadith copied'],
  ahCopyFailed: ['تعذّر النسخ', 'Could not copy'],
  ahUnsave: ['إزالة من المحفوظات', 'Remove from saved'],
  ahNoSaved: [
    'لا توجد أحاديث محفوظة بعد. اضغط على علامة الحفظ فوق أي حديث لتجده هنا.',
    'No saved hadiths yet. Tap the bookmark above any hadith to find it here.',
  ],
  ahSavedToast: ['حُفظ الحديث', 'Hadith saved'],
  ahEnSee: [(n) => `الترجمة مع الحديث ${n}`, (n) => `English given with hadith ${n}`],  ahUnsavedToast: ['أُزيل من المحفوظات', 'Removed from saved'],

  // Account (src/account.js)
  acNotConfigured: ['الحسابات غير مفعّلة في هذه النسخة.', 'Accounts are not set up in this copy of the app.'],
  acLoading: ['جارٍ التحميل…', 'Loading…'],
  acLogIn: ['تسجيل الدخول', 'Log in'],
  acSignUp: ['إنشاء حساب', 'Create an account'],
  acProfile: ['ملفي', 'My profile'],
  acGoogle: ['المتابعة باستخدام Google', 'Continue with Google'],
  acOr: ['أو', 'or'],
  acNoAccount: ['ليس لديك حساب؟', 'Don’t have an account?'],
  acCreateOne: ['أنشئ حساباً', 'Create one'],
  acHaveAccount: ['لديك حساب؟', 'Already have an account?'],
  acEmail: ['البريد الإلكتروني', 'Email'],
  acPassword: ['كلمة المرور', 'Password'],
  acPasswordHint: ['8 أحرف على الأقل', 'At least 8 characters'],
  acCheckEmail: [
    (e) => `أرسلنا رسالة إلى ${e}. افتحها واضغط على الرابط لتأكيد حسابك.`,
    (e) => `We sent an email to ${e}. Open it and tap the link to confirm your account.`,
  ],
  acErrCredentials: ['البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'Wrong email or password.'],
  acErrExists: ['يوجد حساب بهذا البريد. سجّل الدخول بدلاً من ذلك.', 'An account with this email already exists. Log in instead.'],
  acErrNotConfirmed: ['لم يُؤكَّد بريدك بعد: افتح رسالة التأكيد واضغط على الرابط.', 'Your email is not confirmed yet: open the confirmation email and tap the link.'],
  acErrWeak: ['كلمة المرور ضعيفة: اختر 8 أحرف على الأقل.', 'The password is too weak: use at least 8 characters.'],
  acErrRate: ['أُرسلت رسائل كثيرة. حاول بعد قليل.', 'Too many emails were sent. Please try again a little later.'],
  acErrEmail: ['تحقّق من البريد الإلكتروني.', 'Please check the email address.'],
  acName: ['الاسم الذي يظهر للأعضاء', 'Name shown to members'],
  acGender: ['أخ أم أخت؟', 'Brother or sister?'],
  acGenderHint: ['لا يمكن تغيير هذا الاختيار لاحقاً.', 'This cannot be changed later.'],
  acLanguages: ['اللغات التي تتحدثها', 'Languages you speak'],
  acAge: ['أؤكد أن عمري 13 سنة أو أكثر', 'I confirm I am 13 or older'],
  acSave: ['حفظ', 'Save'],
  acSaved: ['حُفظ ملفك.', 'Your profile was saved.'],
  acSignOut: ['تسجيل الخروج', 'Log out'],
  acEdit: ['تعديل الملف', 'Edit profile'],
  pjBack: ['رجوع', 'Back'],
  pjSettings: ['الإعدادات', 'Settings'],
  pjJourney: ['رحلتي', 'My journey'],
  pjQuran: ['القرآن الكريم', 'The Quran'],
  pjNotYet: ['لم تبدأ بعد', 'Not started yet'],
  pjStart: ['ابدأ', 'Start'],
  pjContinueReading: ['تابع القراءة', 'Continue reading'],
  pjAhadith: ['الأحاديث', 'Ahadith'],
  pjSaved: [(n) => `المحفوظة: ${n}`, (n) => `Saved: ${n}`],
  pjLearn: ['تابع التعلّم', 'Continue learning'],
  pjHifz: ['الحفظ', 'Memorization'],
  pjNoPlan: ['لا خطة بعد', 'No plan yet'],
  pjStartPlan: ['ابدأ خطتك', 'Start your plan'],
  pjContinueHifz: ['تابع الحفظ', 'Continue Hifz'],
  pjContinue: ['تابع رحلتك', 'Continue your journey'],
  pjContinueBtn: ['تابع', 'Continue'],
  pjMilestones: ['الأوسمة', 'Milestones'],
  pjViewAll: ['عرض الكل', 'View all'],
  pjPersonal: ['المعلومات الشخصية', 'Personal information'],
  pjAppearance: ['المظهر واللغة', 'Appearance & language'],
  pjComplete: [(n) => `${n}% مكتمل`, (n) => `${n}% complete`],
  pjPageDone: [(page, n) => `صفحة ${page} · ${n}% من المصحف`, (page, n) => `Page ${page} · ${n}% of the mushaf`],
  pjMajalis: ['مجالسي', 'My Majalis'],
  pjNoMajalis: ['لم تنضمّ إلى مجلس بعد', 'No majlis joined yet'],
  pjFindMajlis: ['اكتشف مجالس التسميع والعلم', 'Find a recitation or study circle'],
  pjHelp: ['المساعدة والملاحظات', 'Help & feedback'],
  pjJuzOf: [(n) => `${n} / 30 جزءاً`, (n) => `${n} / 30 Juz`],
  pjDone: [(n) => `${n} حديثاً مكتملاً`, (n) => `${n} completed`],
  pjAdhkar: ['الأذكار', 'Adhkar'],
  pjStreak: [(n) => `${n} يوماً متتالياً`, (n) => `${n} day streak`],
  pjProgress: ['عرض التقدّم', 'View progress'],
  pjSoonLine: ['إن شاء الله', 'in shāʾ Allāh'],
  pjNextMeeting: ['اللقاء القادم', 'Next meeting'],
  pjAt: [(day, time) => `${day}، ${time}`, (day, time) => `${day}, ${time}`],
  pjMembers: [(n) => `${n} عضواً`, (n) => `${n} members`],
  pjNotifications: ['الإشعارات', 'Notifications'],
  pjPrivacy: ['الخصوصية', 'Privacy'],
  // the sample member (only on this computer, src/journey.js)
  pjS_tafsir: ['حلقة التفسير', 'Tafsir Circle'],
  pjS_hifzGroup: ['مجموعة الحفظ', 'Quran Hifz Group'],
  pjS_today: ['اليوم', 'Today'],
  pjS_tomorrow: ['غداً', 'Tomorrow'],
  pjS_firstJuz: ['أوّل جزء', 'First Juz Completed'],
  pjS_adhkar30: ['30 يوماً من الأذكار', '30 Days of Adkar'],
  pjS_ahadith50: ['50 حديثاً', '50 Ahadith Studied'],
  pjS_hifzPlan: ['أتمّ خطة حفظ', 'Complete a Hifz Plan'],
  acCancel: ['إلغاء', 'Cancel'],
  acSince: [(d) => `عضو منذ ${d}`, (d) => `Member since ${d}`],
  ac_gender_male: ['أخ', 'Brother'],
  ac_gender_female: ['أخت', 'Sister'],
  ac_riwaya_warsh: ['ورش', 'Warsh'],
  ac_riwaya_qalun: ['قالون', 'Qalun'],
  ac_riwaya_hafs: ['حفص', 'Hafs'],
  ac_riwaya_other: ['أخرى', 'Other'],
  ac_languages_ar: ['العربية', 'Arabic'],
  ac_languages_en: ['English', 'English'],
  ac_languages_fr: ['Français', 'French'],

  // Home screen and offline app
  homeMe: ['ملفي', 'My profile'],
  qbNoPlace: ['حدّد مكانك', 'Set your place'],
  qbAskTitle: ['أين أنت؟', 'Where are you?'],
  qbAsk: ['لنحدّد اتجاه القبلة من مكانك.', 'To find the qibla from where you are.'],
  qbCalibrate: ['لدقّة أكبر: حرّك هاتفك في الهواء على شكل ∞ مرتين أو ثلاثاً، وأبعِده عن المعادن والمغناطيس.', 'For a precise direction: move your phone through the air in a figure ∞ two or three times, away from metal and magnets.'],
  homeGuest: ['مسلم(ة)', 'Muslim(ah)'],
  homeWirdBegin: ['ابدأ ختمتك من الفاتحة', 'Begin your khatma from al-Fatiha'],
  homeSetPlace: ['حدّد مكانك', 'Set your place'],
  homeJoin: ['حسابي', 'Account'],
  acCountry: ['بلد الإقامة', 'Country of residence'],
  acCountryHint: ['ليتبع التقويم الهجري إعلان بلدك لبداية الشهور.', "So the Hijri calendar follows your country's start of the months."],
  // the Hijri calendar (src/calendar.js)
  calWhich: ['التقويم المعروض', 'Calendar shown'],
  stPlaceNow: [(place, country) => `حالياً: ${place}، ${country}`, (place, country) => `Now: ${place}, ${country}`],
  calGregorian: ['ميلادي', 'Gregorian'],
  calHijri: ['هجري', 'Hijri'],
  calStreak: [(n) => (n === 0 ? 'ابدأ سلسلتك اليوم' : n === 1 ? 'يوم واحد' : n === 2 ? 'يومان متتاليان' : n <= 10 ? `${n} أيام متتالية` : `${n} يوماً متتالياً`), (n) => (n === 0 ? 'Start your streak today' : n === 1 ? '1 day' : `${n} days in a row`)],
  calPrayers: ['مواقيت الصلاة', 'Prayer times'],
  calMyLocation: ['موقعي', 'My location'],
  calNextPrayer: ['الصلاة القادمة', 'Next prayer'],
  calRemaining: ['متبقٍّ', 'remaining'],
  calPlaceAsk: ['لحساب مواقيت الصلاة، حدّد مكانك.', 'To calculate the prayer times, set where you are.'],
  calUseLocation: ['استخدم موقعي', 'Use my location'],
  calLocating: ['جارٍ تحديد الموقع…', 'Finding your location…'],
  calLocateFailed: ['تعذّر تحديد موقعك. اختر مدينتك.', 'Your location could not be found. Choose your city.'],
  calOrCity: ['أو اختر مدينتك', 'Or choose your city'],
  calEvents: ['المناسبات الإسلامية', 'Islamic events'],
  pr_fajr: ['الفجر', 'Fajr'],
  pr_sunrise: ['الشروق', 'Sunrise'],
  pr_dhuhr: ['الظهر', 'Dhuhr'],
  pr_asr: ['العصر', 'Asr'],
  pr_maghrib: ['المغرب', 'Maghrib'],
  pr_isha: ['العشاء', 'Isha'],
  calPrev: ['الشهر السابق', 'Previous month'],
  calNext: ['الشهر التالي', 'Next month'],
  calBackToday: ['العودة إلى اليوم', 'Back to today'],
  calIsToday: ['اليوم', 'Today'],
  calInDays: [(n) => (n === 1 ? 'غداً' : n === 2 ? 'بعد يومين' : n <= 10 ? `بعد ${n} أيام` : `بعد ${n} يوماً`), (n) => (n === 1 ? 'Tomorrow' : `In ${n} days`)],
  calNewYear: ['رأس السنة الهجرية', 'Islamic New Year'],
  calAshura: ['يوم عاشوراء', 'Day of Ashura'],
  calRamadan: ['بداية رمضان', 'Start of Ramadan'],
  calQadr: ['ليلة القدر (27 رمضان)', 'Laylat al-Qadr (27 Ramadan)'],
  calFitr: ['عيد الفطر', 'Eid al-Fitr'],
  calArafah: ['يوم عرفة', 'Day of Arafah'],
  calAdha: ['عيد الأضحى', 'Eid al-Adha'],
  // the fasts (src/home/hijri.js fastOn) and their reminder (src/home/fast-reminders.js)
  fastRamadan: ['صيام رمضان (فرض)', 'Fast of Ramadan (obligatory)'],
  fastArafah: ['صيام يوم عرفة (سنة)', 'Fast of the Day of Arafah (sunnah)'],
  fastTasua: ['صيام تاسوعاء (سنة)', 'Fast of Tasuʿa (sunnah)'],
  fastAshura: ['صيام عاشوراء (سنة)', 'Fast of Ashura (sunnah)'],
  fastWhite: ['صيام الأيام البيض (سنة)', 'Fast of the White Days (sunnah)'],
  fastMonday: ['صيام الاثنين (سنة)', 'Monday fast (sunnah)'],
  fastThursday: ['صيام الخميس (سنة)', 'Thursday fast (sunnah)'],
  fastShawwal: ['ستّ من شوال: يُسنّ صيام ستة أيام من هذا الشهر', 'Six days of Shawwal: fasting any six days of this month is sunnah'],
  calFasting: ['الصيام', 'Fasting'],
  calLegendRamadan: ['رمضان', 'Ramadan'],
  calLegendSunnah: ['صيام سنة', 'Sunnah fast'],
  calLegendOccasion: ['مناسبة', 'Occasion'],
  calRemindFast: ['ذكّرني بالصيام في الليلة السابقة', 'Remind me the evening before'],
  calRemindDenied: ['الإشعارات غير مسموحة: فعّلها من إعدادات الهاتف.', 'Notifications are not allowed: turn them on in the phone’s settings.'],
  fastRemindTitle: ['صيام الغد', 'Tomorrow’s fast'],
  fastTomorrow: [(label) => `غداً: ${label}`, (label) => `Tomorrow: ${label}`],
  fastRamadanStarts: ['رمضان يبدأ غداً إن شاء الله', 'Ramadan begins tomorrow, in shāʾ Allāh'],
  comingSoon: ['قريباً إن شاء الله', 'Coming soon, in shāʾ Allāh'],
  soonBadge: ['قريباً', 'Soon'],
  megabytes: [(n) => `${n} م.ب`, (n) => `${n} MB`],
  pagesSaved: [
    (n, total, size) => `محفوظ على هذا الجهاز: ${n} من ${total} صفحة${size ? ` (${size})` : ''}. الصفحات تُحفظ تلقائياً عند قراءتها.`,
    (n, total, size) => `Saved on this device: ${n} of ${total} pages${size ? ` (${size})` : ''}. Pages are saved as you read them.`,
  ],
  mushafSaved: ['المصحف كاملاً محفوظ على هذا الجهاز ✓', 'The whole mushaf is saved on this device ✓'],
  downloading: [(done, total) => `جارٍ التنزيل… ${done} / ${total}`, (done, total) => `Downloading… ${done} / ${total}`],
  downloadFailed: [
    (n) => `تعذّر تنزيل ${n} صفحة. تحقق من الاتصال ثم أعد المحاولة.`,
    (n) => `${n} pages could not be downloaded. Check your connection and try again.`,
  ],

  // Highlights
  highlight: ['تظليل', 'Highlight'],
  noteAdd: ['أضف تعليقاً', 'Add a comment'],
  noteEdit: ['تعليقك', 'Your comment'],
  noteOpen: ['تعليقك على هذه الآية', 'Your comment on this ayah'],
  noteColor: ['لون الورقة', 'Note colour'],
  noNotes: ['لا توجد تعليقات بعد.<br />اضغط على آية ثم «أضف تعليقاً».', 'No comments yet.<br />Tap an ayah, then «Add a comment».'],
  removeHighlight: ['إزالة التظليل', 'Remove highlight'],
  noHighlights: [
    'لا توجد آيات مظللة بعد.<br />اضغط على آية ثم اختر لون التظليل.',
    'No highlighted ayat yet.<br />Tap an ayah, then choose a highlight colour.',
  ],

  // Choice of mushaf
  mushafCurrent: ['المصحف الحالي', 'Current mushaf'],
  mushafSoon: ['قريباً إن شاء الله', 'Coming soon, in shāʾ Allāh'],
  mushafChoose: ['اختيار هذا المصحف', 'Read this mushaf'],

  // Feedback
  feedbackEmpty: ['اكتب ملاحظتك أولاً.', 'Please write your message first.'],
  feedbackThanks: ['شكراً لك! وصلتنا ملاحظتك.', 'Thank you! Your feedback was received.'],
  feedbackQueued: [
    'شكراً لك! حُفظت ملاحظتك وستُرسل عند توفر الاتصال.',
    'Thank you! Your feedback was saved and will be sent when you are online.',
  ],

  // Search
  searchLoading: ['جارٍ تحميل نص المصحف…', 'Loading the Quran text…'],
  ayahN: [(a) => `الآية ${a}`, (a) => `Ayah ${a}`],
  searchHelp: [
    'اكتب كلمة أو جزءاً من آية، بدون تشكيل. أو رقم السورة والآية مثل <b dir="ltr">48:11</b>.',
    'Type a word or part of an ayah in Arabic, without tashkeel. Or a surah and ayah number like <b>48:11</b>.',
  ],
  noSuchAyah: ['لا توجد آية بهذا الرقم في رواية ورش', 'There is no ayah with this number in the Warsh narration'],
  firstShown: [
    (n) => ` — تُعرض أول ${n}، أضف كلمة لتضييق البحث`,
    (n) => ` — showing the first ${n}; add a word to narrow the search`,
  ],
  searchNone: [
    'لا توجد نتائج. جرّب كلمة أقصر أو دون أل التعريف.',
    'No results. Try a shorter word, or without «ال».',
  ],
  resultCount: [
    (n) => arabicCount(n, ['نتيجة واحدة', 'نتيجتان', 'نتائج', 'نتيجة']),
    (n) => (n === 1 ? '1 result' : `${n} results`),
  ],
};

export function t(key, ...args) {
  const value = isFrench && key in FR ? FR[key] : STRINGS[key][isEnglish ? 1 : 0];
  const text = typeof value === 'function' ? value(...args) : value;
  if (!isFrench) return text;
  return Array.isArray(text) ? text.map(frenchSpaces) : frenchSpaces(text);
}

// ---------- Surah names ----------

// "سورة الفاتحة" in Arabic, "Al-Fātiḥah" in English.
export const surahTitle = (s) => (isEnglish ? s.latin : `سورة ${s.name}`);
// "الفاتحة" / "Al-Fātiḥah"
export const surahName = (s) => (isEnglish ? s.latin : s.name);
export const surahType = (s) => t(s.type === 'مدنية' ? 'medinan' : 'meccan');
