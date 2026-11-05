// The Quran page's own words, in the three languages (the website had them in its HTML: PAGE_EN and
// PAGE_FR); the rest comes from t() (src/i18n/i18n.js).
import { L } from './i18n.js';

export const READER = {
  fullscreen: () => L('ملء الشاشة', 'Full screen', 'Plein écran'),
  surahs: () => L('السور', 'Surahs', 'Sommaire'),
  search: () => L('بحث', 'Search', 'Recherche'),
  notebook: () => L('دفتري', 'Notebook', 'Carnet'),
  settings: () => L('الإعدادات', 'Settings', 'Paramètres'),
  wirdHint: () => L('اضغط مطوّلاً على الآية التي توقفت عندها', 'Hold the ayah where you stop', 'Appuyez longuement sur le verset où vous vous arrêtez'),
  wird: () => L('الورد', 'Wird', 'Wird'),
  home: () => L('الرئيسية', 'Home', 'Accueil'),
  index: () => L('فهرس المصحف', 'Index of the mushaf', 'Sommaire du mushaf'),
  close: () => L('إغلاق', 'Close', 'Fermer'),
  tabSurahs: () => L('السور', 'Surahs', 'Sourates'),
  tabAhzab: () => L('الأحزاب', 'Ahzab', 'Ahzab'),
  tabAjza: () => L('الأجزاء', 'Juz', 'Juz'),
  filter: () => L('ابحث باسم السورة أو رقمها…', 'Search by surah name or number…', 'Nom ou numéro de sourate…'),
  soon: () => L('قريباً إن شاء الله', 'Coming soon, in sha Allah', 'Bientôt, in sha Allah'),
  // full screen's round buttons (the website's), and the button back to the whole page while zoomed
  exitFull: () => L('الخروج من ملء الشاشة', 'Exit full screen', 'Quitter le plein écran'),
  pageLight: () => L('خلفية داكنة / خافتة', 'Dark / dimmed screen', 'Écran sombre / atténué'),
  theme: () => L('الوضع الليلي / النهاري', 'Night / day', 'Nuit / jour'),
  wholePage: () => L('الصفحة كاملة', 'Whole page', 'Page entière'),
  back: () => L('رجوع', 'Back', 'Retour'),
  // the Quran's settings (a page of its own)
  settingsTitle: () => L('إعدادات المصحف', 'Quran settings', 'Paramètres du Coran'),
  appearance: () => L('المظهر', 'Theme', 'Thème'),
  night: () => L('الوضع الليلي', 'Night mode', 'Mode nuit'),
  nightSub: () =>
    L(
      'خاص بالمصحف، ويعود إلى مظهر التطبيق إذا غيّرته',
      'Only for the Quran pages. Changing the app’s appearance resets it.',
      'Seulement pour les pages du Coran. Changer l’apparence de l’application le réinitialise.',
    ),
  // at night, in full screen: the screen around the (dimmed) page dark, or the same dimmed paper
  nightPage: () => L('حول الصفحة في ملء الشاشة', 'Around the page in full screen', 'Autour de la page en plein écran'),
  normalPage: () => L('خلفية داكنة', 'Dark screen', 'Écran sombre'),
  normalPageSub: () => L('الصفحة خافتة على خلفية داكنة', 'The dimmed page on a dark screen', 'La page atténuée sur un écran sombre'),
  dimPage: () => L('خلفية خافتة', 'Dimmed screen', 'Écran atténué'),
  dimPageSub: () => L('الشاشة كلها بلون الصفحة الخافتة', 'The whole screen the colour of the dimmed page', 'Tout l’écran de la couleur de la page atténuée'),
  riwaya: () => L('الرواية', 'Narration', 'Lecture (riwaya)'),
  warsh: () => L('ورش عن نافع', 'Warsh from Nafi', 'Warsh d’après Nâfi'),
  hafs: () => L('حفص عن عاصم', 'Hafs from Asim', 'Hafs d’après Âsim'),
  riwayaSub: () => L('يُعاد فتح التطبيق على الصفحة نفسها', 'The app restarts on the same page.', 'L’application redémarre à la même page.'),
  tafsirs: () => L('التفاسير', 'Tafsirs', 'Tafsirs'),
  translations: () => L('الترجمات', 'Translations', 'Traductions'),
  sourcesSub: () =>
    L('ما تفعّله منها يظهر عند لمس آية', 'Those switched on appear when you tap an ayah.', 'Ceux activés s’affichent quand vous touchez un verset.'),
  downloads: () => L('التحميل للقراءة دون اتصال', 'Download for offline reading', 'Télécharger pour lire hors ligne'),
  dlMushaf: () => L('صفحات المصحف', 'Mushaf pages', 'Pages du mushaf'),
  dlTafsir: () => L('ملفات التفاسير', 'Tafsir files', 'Fichiers des tafsirs'),
  dlTranslations: () => L('ملفات الترجمات', 'Translation files', 'Fichiers des traductions'),
  soonTag: () => L('قريباً', 'Soon', 'Bientôt'),
  // a tap on an ayah: its options, and its comment
  tafsirRow: () => L('التفسير والترجمة', 'Tafsir & translation', 'Tafsir et traduction'),
  notePlaceholder: () =>
    L('اكتب ما تشاء: خاطرة، فائدة، تدبّر…', 'Write whatever you like: a thought, a benefit, a reflection…', 'Écrivez ce que vous voulez : une pensée, un bienfait, une méditation…'),
  noteSave: () => L('حفظ', 'Save', 'Enregistrer'),
  noteDelete: () => L('حذف التعليق', 'Delete comment', 'Supprimer le commentaire'),
  // search (a page of its own)
  searchTitle: () => L('البحث في المصحف', 'Search the Quran', 'Rechercher dans le Coran'),
  searchField: () => L('كلمة، جزء من آية، أو 48:11', 'A word, part of an ayah, or 48:11', 'Un mot, une partie de verset, ou 48:11'),
};
