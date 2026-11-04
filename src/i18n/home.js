// The home screen's own words, in the three languages (the website had them in its HTML and in
// src/home/home.js): HOME.key() gives them in the language of the moment.
import { L } from './i18n.js';

export const HOME = {
  salam: () => L('السلام عليكم', 'Assalamu Alaikum', 'Assalamu Alaikum'),
  guest: () => L('مسلم(ة)', 'Muslim(ah)', 'Musulman(e)'),
  nextPrayer: () => L('الصلاة القادمة', 'Next prayer', 'Prochaine prière'),
  setPlace: () => L('حدّد مكانك', 'Set your place', 'Indiquez votre lieu'),
  wirdLabel: () => L('وردي اليومي', 'My daily wird', 'Mon wird quotidien'),
  wirdBegin: () => L('ابدأ ختمتك من الفاتحة', 'Begin your khatma from al-Fatiha', 'Commencez par al-Fatiha'),
  wirdGo: () => L('اقرأ وِرد اليوم', 'Read today’s wird', 'Lisez le wird du jour'),
  surah: (name) => L(`سورة ${name}`, `Surah ${name}`, `Sourate ${name}`),
  ayahPage: (a, p) => L(`الآية ${a} · الصفحة ${p}`, `Ayah ${a} · Page ${p}`, `Verset ${a} · Page ${p}`),
  khatma: (pct) => L(`ختمة ${pct}%`, `Khatma ${pct}%`, `Khatma ${pct} %`),
  days: (n) =>
    L(
      n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : `${n} ${n <= 10 ? 'أيام' : 'يوماً'}`,
      `${n} ${n === 1 ? 'day' : 'days'}`,
      `${n} ${n === 1 ? 'jour' : 'jours'}`,
    ),
  units: () => L(['ساعة', 'دقيقة', 'ثانية'], ['hr', 'min', 'sec'], ['h', 'min', 's']),
  hadithIntro: () => L('قال رسول الله ﷺ:', 'The Prophet (ﷺ) said:', 'Le Prophète (ﷺ) a dit :'),
  hadith: () =>
    L(
      'يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ، كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا.',
      '“It will be said to the one devoted to the Qur’an: Read, ascend, and recite with deliberation as you used to recite in the world. Your rank will be at the last verse you recite.”',
      '« On dira au compagnon du Coran : Lis, élève-toi et psalmodie comme tu psalmodiais en ce bas monde, car ton rang sera au dernier verset que tu réciteras. »',
    ),
  secQuran: () => L('خدمات القرآن الكريم الأساسية', 'Essential Quran services', 'L’essentiel pour le Coran'),
  secTools: () => L('أدوات ومراجع إضافية', 'Tools and references', 'Outils et références'),
  read: () => L('القرآن الكريم', 'The Holy Quran', 'Le Saint Coran'),
  readSub: () => L('قراءة، تفاسير وبحث', 'Read, tafsir and search', 'Lecture, tafsir et recherche'),
  memorize: () => L('الحفظ', 'Memorization', 'Mémorisation'),
  memorizeSub: () => L('خطط ومراجعة وأوسمة', 'Plans, revision and badges', 'Programmes, révision et badges'),
  test: () => L('اختبار المحفوظ', 'Test your memorization', 'Tester sa mémorisation'),
  testShort: () => L('اختبار الحفظ', 'Test', 'Test'),
  testSub: () => L('تسميع وتصحيح', 'Recitation and correction', 'Récitation et correction'),
  majalis: () => L('مجالس البررة', 'Majalis al-Bararah', 'Majalis al-Bararah'),
  majalisSub: () => L('حلقات وتسميع جماعي', 'Circles and group recitation', 'Cercles et récitation en groupe'),
  soon: () => L('قريباً', 'Soon', 'Bientôt'),
  adhkar: () => L('الأذكار', 'Adhkar', 'Adhkar'),
  ahadith: () => L('الأحاديث', 'Ahadith', 'Hadiths'),
  qibla: () => L('القبلة', 'Qibla', 'Qibla'),
  calendar: () => L('التقويم', 'Calendar', 'Calendrier'),
  settings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  back: () => L('رجوع', 'Back', 'Retour'),
  // the wird card's hadith («read and rise»: HOME.hadith) and its short chain, on two lines: who told it,
  // and where it is recorded
  heroSource: () =>
    L(
      'عن عبد الله بن عمرو رضي الله عنهما\nرواه أبو داود والترمذي',
      'Narrated by Abdullah ibn Amr\nAbu Dawud and al-Tirmidhi',
      'Rapporté par Abdallah ibn Amr\nAbou Daoud et at-Tirmidhi',
    ),
  wirdStart: () => L('ابدأ وِردك', 'Start your wird', 'Commencez votre wird'),
  // today's five prayers (the green box)
  prayersToday: () => L('صلوات اليوم', 'Today’s prayers', 'Les prières du jour'),
  prayerIn: (name, hms) => L(`${name} بعد ${hms}`, `${name} in ${hms}`, `${name} dans ${hms}`),
  locating: () => L('جارٍ تحديد مكانك…', 'Finding your location…', 'Localisation…'),
  // the bar along the bottom
  tabHome: () => L('الرئيسية', 'Home', 'Accueil'),
  tabQuran: () => L('القرآن', 'Quran', 'Coran'),
  tabMemorize: () => L('الحفظ', 'Memorize', 'Mémoriser'),
  tabMajalis: () => L('المجالس', 'Majalis', 'Majalis'),
  profile: () => L('حسابي', 'My account', 'Mon compte'),
  login: () => L('تسجيل الدخول', 'Log in', 'Connexion'),
  tabSettings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  coming: () => L('هذا القسم في الطريق إن شاء الله.', 'This section is coming soon, in sha Allah.', 'Cette section arrive bientôt, in sha Allah.'),
};
