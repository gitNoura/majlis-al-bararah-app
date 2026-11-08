// The Quran tab's own words (the modes, the header's buttons, the search sheet, the ayah menu's mark), in the three languages.
// The rest comes from READER (src/i18n/reader.js) and t() (src/i18n/i18n.js).
import { L } from './i18n.js';

export const QURAN = {
  modeRead: () => L('قراءة', 'Read', 'Lire'),
  modeListen: () => L('استماع', 'Listen', 'Écouter'),
  modeRecite: () => L('استظهار', 'Recite', 'Réciter'),
  fullView: () => L('عرض كامل', 'Full view', 'Plein écran'),
  back: () => L('رجوع', 'Back', 'Retour'),
  index: () => L('الفهرس', 'Index', 'Index'),
  search: () => L('بحث', 'Search', 'Rechercher'),
  findField: () => L('اسم سورة، كلمة، أو رقم مثل 2:255', 'Surah, words, or a number like 2:255', 'Sourate, mots, ou numéro comme 2:255'),
  ayatFound: () => L('الآيات', 'Ayat', 'Versets'),
  noResults: () => L('لا نتائج', 'No results', 'Aucun résultat'),
  loadingSearch: () => L('جارٍ تحميل نص القرآن للبحث…', 'Loading the text for search…', 'Chargement du texte pour la recherche…'),
  searchOffline: () => L('البحث في النص يحتاج إلى الاتصال بالإنترنت.', 'Searching the text needs a connection.', 'La recherche dans le texte demande une connexion.'),
  // the mark a long press puts on an ayah
  pinned: () => L('سنكمل من هنا', 'Marked', 'Repère placé'),
  unmarked: () => L('أُزيل موضع القراءة', 'Mark removed', 'Repère retiré'),
  // the page's bookmark (the ribbon on the page) and «My marks»
  unmarkPage: () => L('إزالة علامة الصفحة', 'Remove the page bookmark', 'Retirer le signet'),
  pageMarked: () => L('وُضعت علامة في هذه الصفحة', 'Page bookmarked', 'Page marquée'),
  pageUnmarked: () => L('أُزيلت علامة الصفحة', 'Page bookmark removed', 'Signet retiré'),
  marksPages: () => L('العلامات', 'Bookmarks', 'Signets'),
  marksHighlights: () => L('التظليل', 'Highlights', 'Surlignages'),
  marksComments: () => L('التعليقات', 'Comments', 'Commentaires'),
  stopRow: () => L('موضع القراءة', 'Where I stopped', 'Où je me suis arrêté'),
  // how to put the stop mark (a long press): said once on the page, and always in the Bookmarks list while there is none
  stopHint: () => L('اضغط مطولاً على آية لتضع تحتها خطاً عند موضع توقفك.', 'Press and hold an ayah to underline where you stopped.', 'Maintenez un verset pour le souligner là où vous vous êtes arrêté.'),
  noPages: () => L('اضغط على رمز العلامة أعلى الصفحة لتحفظ مكانها هنا.', 'Tap the bookmark at the top of a page to keep its place here.', 'Touchez le signet en haut d’une page pour garder sa place ici.'),
  noHighlights: () => L('اضغط على آية ثم اختر لوناً لتظليلها.', 'Tap an ayah, then pick a colour to highlight it.', 'Touchez un verset, puis choisissez une couleur pour le surligner.'),
  noComments: () => L('اضغط على آية ثم «أضف تعليقاً».', 'Tap an ayah, then «Add a comment».', 'Touchez un verset, puis « Ajouter un commentaire ».'),
};
