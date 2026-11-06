// The Quran tab's own words (Read / Listen / Recite, the header, the Find and Display sheets), in the three languages.
// The rest comes from READER (src/i18n/reader.js) and t() (src/i18n/i18n.js).
import { L } from './i18n.js';

const num = (n) => Number(n).toLocaleString(L('ar', 'en', 'fr'));

export const QURAN = {
  modeRead: () => L('قراءة', 'Read', 'Lire'),
  modeListen: () => L('استماع', 'Listen', 'Écouter'),
  modeRecite: () => L('تسميع', 'Recite', 'Réciter'),
  find: () => L('بحث وفهرس', 'Find', 'Chercher'),
  notes: () => L('ملاحظاتي', 'Notes', 'Notes'),
  display: () => L('العرض', 'Display', 'Affichage'),
  findField: () => L('اسم سورة، كلمة، أو رقم مثل 2:255', 'Surah, words, or a number like 2:255', 'Sourate, mots, ou numéro comme 2:255'),
  tabSurah: () => L('السور', 'Surah', 'Sourate'),
  tabJuz: () => L('الأجزاء', 'Juz', 'Juz'),
  tabHizb: () => L('الأحزاب', 'Hizb', 'Hizb'),
  surahsFound: () => L('السور', 'Surahs', 'Sourates'),
  ayatFound: () => L('الآيات', 'Ayat', 'Versets'),
  noResults: () => L('لا نتائج', 'No results', 'Aucun résultat'),
  loadingSearch: () => L('جارٍ تحميل نص القرآن للبحث…', 'Loading the text for search…', 'Chargement du texte pour la recherche…'),
  searchOffline: () => L('البحث في النص يحتاج إلى الاتصال بالإنترنت.', 'Searching the text needs a connection.', 'La recherche dans le texte demande une connexion.'),
  // the khatma sheet
  khatma: () => L('الختمة', 'Khatma', 'Khatma'),
  khatmaProgress: (p) => L(`${num(p)}٪ من الختمة`, `${num(p)}% of the khatma`, `${num(p)} % de la khatma`),
  khatmaPage: (p, total) => L(`الصفحة ${num(p)} من ${num(total)}`, `Page ${num(p)} of ${num(total)}`, `Page ${num(p)} sur ${num(total)}`),
  khatmasDone: (n) => (n ? L(`ختمات مكتملة: ${num(n)}`, `Khatmas completed: ${num(n)}`, `Khatmas terminées : ${num(n)}`) : L('لم تكتمل ختمة بعد', 'No khatma completed yet', 'Aucune khatma terminée')),
  pinLine: (shown, page) => L(`علامتك: ${shown} (صفحة ${num(page)})`, `Your pin: ${shown} (page ${num(page)})`, `Votre repère : ${shown} (page ${num(page)})`),
  noPin: () => L('لا علامة محددة على آية', 'No ayah is pinned', 'Aucun verset repéré'),
  goToPin: () => L('اذهب إلى العلامة', 'Go to the pin', 'Aller au repère'),
  clearPin: () => L('إزالة العلامة', 'Remove the pin', 'Retirer le repère'),
  // the ayah menu
  markHere: () => L('علّم هنا', 'Mark here', 'Repérer ici'),
  pinned: () => L('تم وضع العلامة', 'Pinned', 'Repère placé'),
  // the page side
  rightPage: () => L('الصفحة اليمنى', 'Right-hand page', 'Page de droite'),
  leftPage: () => L('الصفحة اليسرى', 'Left-hand page', 'Page de gauche'),
};
