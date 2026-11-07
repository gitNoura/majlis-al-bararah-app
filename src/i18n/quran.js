// The Quran tab's own words (the modes, the header's buttons, the search sheet, the ayah menu's mark), in the three languages.
// The rest comes from READER (src/i18n/reader.js) and t() (src/i18n/i18n.js).
import { L } from './i18n.js';

export const QURAN = {
  modeRead: () => L('قراءة', 'Read', 'Lire'),
  modeListen: () => L('استماع', 'Listen', 'Écouter'),
  modeRecite: () => L('تسميع', 'Recite', 'Réciter'),
  index: () => L('الفهرس', 'Index', 'Index'),
  search: () => L('بحث', 'Search', 'Rechercher'),
  notes: () => L('ملاحظاتي', 'Notes', 'Notes'),
  findField: () => L('اسم سورة، كلمة، أو رقم مثل 2:255', 'Surah, words, or a number like 2:255', 'Sourate, mots, ou numéro comme 2:255'),
  ayatFound: () => L('الآيات', 'Ayat', 'Versets'),
  noResults: () => L('لا نتائج', 'No results', 'Aucun résultat'),
  loadingSearch: () => L('جارٍ تحميل نص القرآن للبحث…', 'Loading the text for search…', 'Chargement du texte pour la recherche…'),
  searchOffline: () => L('البحث في النص يحتاج إلى الاتصال بالإنترنت.', 'Searching the text needs a connection.', 'La recherche dans le texte demande une connexion.'),
  // the ayah menu
  markHere: () => L('علّم هنا', 'Mark here', 'Repérer ici'),
  pinned: () => L('تم وضع العلامة', 'Marked', 'Repère placé'),
  unmark: () => L('إزالة العلامة', 'Remove mark', 'Retirer le repère'),
  unmarked: () => L('أُزيلت العلامة', 'Mark removed', 'Repère retiré'),
};
