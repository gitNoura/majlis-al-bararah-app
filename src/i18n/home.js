// The home screen's own words, in the three languages (the website had them in its HTML and in
// src/home/home.js): HOME.key() gives them in the language of the moment.
import { L } from './i18n.js';

export const HOME = {
  // the sections' one-liners, and today's memorization card
  // the wird card: what it is, where the reader stopped, the button
  wirdPage: (n) => L(`الصفحة ${n}`, `Page ${n}`, `Page ${n}`),
  salam: () => L('السلام عليكم', 'Assalamu Alaikum', 'Assalamu Alaikum'),
  nextPrayer: () => L('الصلاة القادمة', 'Next prayer', 'Prochaine prière'),
  setPlace: () => L('حدّد مكانك', 'Set your place', 'Indiquez votre lieu'),
  surah: (name) => L(`سورة ${name}`, `Surah ${name}`, `Sourate ${name}`),
  days: (n) =>
    L(
      n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : `${n} ${n <= 10 ? 'أيام' : 'يوماً'}`,
      `${n} ${n === 1 ? 'day' : 'days'}`,
      `${n} ${n === 1 ? 'jour' : 'jours'}`,
    ),
  units: () => L(['ساعة', 'دقيقة', 'ثانية'], ['hr', 'min', 'sec'], ['h', 'min', 's']),
  hadith: () =>
    L(
      'يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ، كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا.',
      '“It will be said to the one devoted to the Qur’an: Read, ascend, and recite with deliberation as you used to recite in the world. Your rank will be at the last verse you recite.”',
      '« On dira au compagnon du Coran : Lis, élève-toi et psalmodie comme tu psalmodiais en ce bas monde, car ton rang sera au dernier verset que tu réciteras. »',
    ),
  memorize: () => L('الحفظ', 'Memorization', 'Mémorisation'),
  test: () => L('اختبار المحفوظ', 'Test your memorization', 'Tester sa mémorisation'),
  soon: () => L('قريباً', 'Soon', 'Bientôt'),
  qibla: () => L('القبلة', 'Qibla', 'Qibla'),
  settings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  back: () => L('رجوع', 'Back', 'Retour'),
  // the wird card's hadith («read and rise»: HOME.hadith) and its short chain, on two lines: who told it,
  // and where it is recorded
  // today's five prayers (the green box)
  // the bar along the bottom
  tabHome: () => L('الرئيسية', 'Home', 'Accueil'),
  tabQuran: () => L('القرآن', 'Quran', 'Coran'),
  tabMemorize: () => L('الحفظ', 'Memorize', 'Mémoriser'),
  profile: () => L('حسابي', 'My account', 'Mon compte'),
  tabSettings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  coming: () => L('هذا القسم في الطريق إن شاء الله.', 'This section is coming soon, in sha Allah.', 'Cette section arrive bientôt, in sha Allah.'),
};
