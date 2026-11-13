// The tajweed guide of the Hafs mushaf (Dar al-Maarifa's colour system, narration of Hafs from
// ʿAsim by way of al-Shatibiyya): its colour legend and its rules, in Arabic and in English (drawn
// by src/reader/tajweed.js), in the same order and shape as src/reader/tajweed-warsh.js.
//
// What differs from Warsh: the madd with a hamza is 4 or 5 counts (not 6), madd al-badal is a
// natural 2, the ʿarid and leen madds are only when stopping, the heavy lam is only that of the
// name of Allah, and Hafs has its own places (the four saktas, the one imala...).
// The colours are sampled from the legend printed at the bottom of the Hafs pages (the same on
// every page; source/hafs, pages 3 and 5).
// Examples are written as [plain, coloured, plain, ...] in the Hafs text
// (public/data/surah-hafs): every second part is shown in the rule's colour.

export const SUB = { ar: 'برواية حفص عن عاصم', en: 'Narration of Hafs from ʿAsim', fr: 'Lecture de Hafs d’après ʿÂsim' };

export const COLORS = {
  lazim: '#b00062', // مد 6 حركات لزوماً
  wajib: '#e6007c', // مد واجب 4 أو 5 حركات
  jaiz: '#ef7d00', // مد 2 أو 4 أو 6 جوازاً
  haraka2: '#fbba00', // مد حركتان
  ghunna: '#00963f', // إخفاء ومواقع الغنة
  idgham: '#a8a8a6', // إدغام وما لا يلفظ
  tafkhim: '#006a94', // تفخيم
  qalqala: '#009fe3', // قلقلة
};

// The legend of the mushaf, in its own order.
export const LEGEND = [
  { color: COLORS.lazim, name: 'مدّ لازم', length: '6 حركات لزوماً' },
  { color: COLORS.wajib, name: 'مدّ واجب', length: '4 أو 5 حركات' },
  { color: COLORS.jaiz, name: 'مدّ جائز', length: '2 أو 4 أو 6 حركات' },
  { color: COLORS.haraka2, name: 'مدّ طبيعي', length: 'حركتان' },
  { color: COLORS.ghunna, name: 'إخفاء ومواقع الغنّة', length: 'حركتان' },
  { color: COLORS.idgham, name: 'إدغام وما لا يُلفظ', length: 'لا يُنطق' },
  { color: COLORS.tafkhim, name: 'تفخيم', length: 'يُفخَّم' },
  { color: COLORS.qalqala, name: 'قلقلة', length: 'يُقلقَل' },
];

export const SECTIONS = [
  {
    id: 'colors',
    title: 'كيف تقرأ الألوان',
    intro:
      'يعتمد هذا المصحف ثلاثة ألوان رئيسية: الأحمر بدرجاته للمدود، والأخضر لمواقع الغنّة، والأزرق للتفخيم (الغامق) والقلقلة (الفاتح)، أما الرمادي فللحروف التي لا تُلفظ. يكفي أن تنظر إلى لون الحرف قبل نطقه لتعرف الحكم وتطبّقه مباشرة.',
    steps: [
      ['انظر إلى لون الحرف', 'قبل أن تنطق الكلمة، لاحظ الحرف الملوَّن فيها.'],
      ['الأحمر بدرجاته: مُدّ', 'كلما كان اللون أغمق كان المدّ أطول؛ والبرتقالي مدّ تختار مقداره عند الوقف.'],
      ['الأخضر: غُنّ', 'أخرج الصوت من الأنف مقدار حركتين.'],
      ['الأزرق الغامق: فخّم', 'افتح فمك وارفع مؤخرة اللسان ليمتلئ الصوت.'],
      ['الأزرق الفاتح: قلقِل', 'انطق الحرف الساكن بنبرة خفيفة دون أن تضيف إليه حركة.'],
      ['الرمادي: لا تنطقه', 'الحرف مكتوب لكنه يُدغم فيما بعده أو يسقط في النطق.'],
    ],
    note: 'الحركة: مقدار الزمن اللازم لقبض الإصبع أو بسطه بسرعة معتدلة. فالحركتان زمن قبض إصبعين، والستّ زمن قبض ستة أصابع.',
  },
  {
    id: 'madd',
    title: 'المدود',
    rules: [
      {
        color: COLORS.lazim,
        name: 'المدّ اللازم',
        length: '6 حركات',
        when: 'حرف مدّ بعده سكون أصلي أو حرف مشدَّد في الكلمة نفسها، ومنه حروف فواتح السور.',
        how: 'يُمدّ ستّ حركات دائماً، في الوصل والوقف، لا يجوز فيه غير ذلك.',
        examples: [['ٱلضَّ', 'آ', 'لِّينَ'], ['', 'الٓمٓ', ''], ['دَ', 'آ', 'بَّةٖ']],
      },
      {
        color: COLORS.wajib,
        name: 'المدّ المتصل والمنفصل',
        length: '4 أو 5 حركات',
        when: 'حرف مدّ بعده همزة: في الكلمة نفسها (المتصل، وهو واجب)، أو في أول الكلمة التالية (المنفصل).',
        how: 'يقرأ حفص من طريق الشاطبية المتصل والمنفصل أربع حركات أو خمساً. اختر مقداراً واحداً والتزمه في تلاوتك كلها.',
        examples: [['ٱلسَّمَ', 'آ', 'ءِ'], ['جَ', 'آ', 'ءَ'], ['بِمَ', 'آ', ' أُنزِلَ']],
      },
      {
        color: COLORS.jaiz,
        name: 'المدّ الجائز (العارض للسكون واللين)',
        length: '2 أو 4 أو 6',
        when: 'العارض للسكون: حرف مدّ بعده حرف تُسكّنه عند الوقف. واللين: واو أو ياء ساكنة بعد فتح، عند الوقف على ما بعدها.',
        how: 'لا يكون إلا عند الوقف (كالوقف على «نستعين»): يجوز فيه القصر (حركتان) أو التوسط (4) أو الإشباع (6). أما في الوصل فيُمدّ حركتين.',
        examples: [['نَسۡتَعِ', 'ي', 'نُ'], ['ٱلۡعَٰلَمِ', 'ي', 'نَ'], ['خَ', 'وۡ', 'فِۭ']],
      },
      {
        color: COLORS.haraka2,
        name: 'المدّ الطبيعي',
        length: 'حركتان',
        when: 'حرف مدّ ليس بعده همز ولا سكون، ومنه مدّ البدل (همزة بعدها حرف مدّ) في رواية حفص، وصلة هاء الضمير بين متحركين.',
        how: 'يُمدّ حركتين فقط، بلا زيادة ولا نقصان.',
        examples: [['قَ', 'ا', 'لَ'], ['يَقُ', 'و', 'لُ'], ['ءَ', 'ا', 'مَنُواْ']],
      },
    ],
  },
  {
    id: 'ghunna',
    title: 'الغنّة والنون الساكنة',
    rules: [
      {
        color: COLORS.ghunna,
        name: 'الإخفاء',
        length: 'غنّة حركتان',
        when: 'نون ساكنة أو تنوين بعدها أحد حروف الإخفاء الخمسة عشر (مثل: ت، ث، د، ذ، ز، س، ش، ص، ض، ط، ظ، ف، ق، ك، ج).',
        how: 'تُنطق النون بين الإظهار والإدغام، دون أن يلمس اللسان مخرجها، مع غنّة حركتين.',
        examples: [['مِ', 'ن', ' شَرِّ'], ['أَ', 'ن', 'فُسَكُمۡ'], ['مِ', 'ن', ' قَبۡلِكَ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الغنّة في النون والميم المشدّدتين',
        length: 'حركتان',
        when: 'كل نون أو ميم عليها شدّة.',
        how: 'تُحبس الغنّة في الأنف مقدار حركتين قبل الانتقال إلى الحرف التالي.',
        examples: [['إِ', 'نَّ', ''], ['ثُ', 'مَّ', ''], ['ٱل', 'نَّ', 'اسِ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإقلاب',
        length: 'غنّة حركتان',
        when: 'نون ساكنة أو تنوين بعدها باء.',
        how: 'تُقلب النون ميماً مخفاة عند الباء مع غنّة حركتين، وتُنطق الشفتان منطبقتين برفق.',
        examples: [['مِ', 'نۢ', ' بَعۡدِ'], ['سَمِي', 'عُۢ', ' بَصِيرٞ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإدغام بغنّة',
        length: 'غنّة حركتان',
        when: 'نون ساكنة أو تنوين بعدها حرف من حروف (ينمو) في كلمتين.',
        how: 'تُدخل النون في الحرف التالي فتصيرا حرفاً واحداً مشدّداً، مع غنّة حركتين.',
        examples: [['مَ', 'ن', ' يَقُولُ'], ['مِ', 'ن', ' وَالٍ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإخفاء الشفوي',
        length: 'غنّة حركتان',
        when: 'ميم ساكنة بعدها باء.',
        how: 'تُخفى الميم عند الباء مع غنّة حركتين، بإطباق خفيف للشفتين.',
        examples: [['تَرۡمِيهِ', 'م', ' بِحِجَارَةٖ']],
      },
    ],
  },
  {
    id: 'idgham',
    title: 'الإدغام وما لا يُلفظ',
    rules: [
      {
        color: COLORS.idgham,
        name: 'الحرف الرمادي',
        length: 'لا يُنطق',
        when: 'حرف يُدغم في ما بعده (كالنون الساكنة قبل اللام والراء)، أو حرف مكتوب لا يُقرأ، كهمزة الوصل في وسط الكلام واللام الشمسية.',
        how: 'تجاوزه في النطق وانتقل مباشرة إلى الحرف الذي بعده، ويُشدَّد الحرف التالي إن كان مدغماً فيه.',
        examples: [['مِّ', 'ن', ' رَّبِّهِمۡ'], ['ءَامَنُو', 'اْ', ''], ['قَ', 'د', ' تَّبَيَّنَ']],
      },
    ],
  },
  {
    id: 'tafkhim',
    title: 'التفخيم والقلقلة',
    rules: [
      {
        color: COLORS.tafkhim,
        name: 'التفخيم',
        length: 'يُفخَّم',
        when: 'حروف الاستعلاء السبعة المجموعة في (خُصَّ ضَغْطٍ قِظْ)، والراء المفخّمة، ولام لفظ الجلالة بعد فتح أو ضمّ.',
        how: 'ارفع مؤخرة اللسان نحو الحنك ليمتلئ الفم بالصوت. أعلى درجاته مع الفتح وبعده ألف، ثم الفتح، ثم الضم، ثم السكون، وأدناها مع الكسر.',
        examples: [['', 'قَا', 'لَ'], ['ٱل', 'صِّ', 'رَٰطَ'], ['', 'طَّآ', 'ئِفَةٞ']],
      },
      {
        color: COLORS.qalqala,
        name: 'القلقلة',
        length: 'يُقلقَل',
        when: 'أحد حروف (قُطْبُ جَدٍّ) إذا كان ساكناً، في وسط الكلمة أو عند الوقف عليها.',
        how: 'انطق الحرف الساكن بنبرة خفيفة حتى يُسمع له صدى، دون أن تُحرّكه بفتح أو ضم أو كسر. وهي عند الوقف أقوى، كالوقف على «الفلق» و«أحد».',
        examples: [['يَ', 'جۡ', 'عَلُونَ'], ['ٱلۡفَلَ', 'قِ', ''], ['أَحَ', 'دٌ', '']],
      },
    ],
  },
  {
    id: 'hafs',
    title: 'من خصائص رواية حفص',
    intro:
      'لرواية حفص عن عاصم من طريق الشاطبية مواضعُ خاصة يُنبَّه عليها في ضبط المصحف، تختلف فيها عن غيرها من الروايات. هذه أشهرها:',
    features: [
      ['السكت', 'سكتة لطيفة دون تنفّس في أربعة مواضع: «عوجا» في الكهف، و«مرقدنا» في يس، و«من راق» في القيامة، و«بل ران» في المطففين.', 'مَنۡۜ رَاقٖ'],
      ['الإمالة', 'تُمال الراء والألف بعدها إمالة كبرى في موضع واحد: «مجريها» في هود.', 'مَجۡر۪ىٰهَا'],
      ['التسهيل', 'تُسهَّل الهمزة الثانية بين الهمزة والألف في «ءأعجمي» في فصّلت.', 'ءَا۬عۡجَمِيّٞ'],
      ['الإشمام', 'تُضمّ الشفتان مع إدغام النون في «تأمنّا» في يوسف، إشارةً إلى ضمّة النون الأولى.', 'تَأۡمَ۬نَّا'],
      ['الوجهان في «ضعف»', 'يجوز فتح الضاد وضمّها في كلمة «ضعف» في مواضعها الثلاثة في سورة الروم.', 'مِّن ضَعۡفٖ'],
      ['السين والصاد', '«ويبصط» في البقرة و«بصطة» في الأعراف تُقرآن بالسين، و«المصيطرون» في الطور بالسين أو الصاد.', 'وَيَبۡصُۜطُ'],
      ['مدّ البدل', 'يُقرأ حركتين فقط (مدّاً طبيعياً)، بخلاف رواية ورش.', 'ءَامَنُواْ'],
    ],
    note: 'هذا دليل مبسّط لقراءة ألوان المصحف. لإتقان التلاوة برواية حفص يُنصح بالتلقي عن شيخ متقن.',
  },
];

// ---------- English ----------

// The same guide in English, in the same order as LEGEND and SECTIONS. The Quran examples
// (and the colours) are taken from the Arabic sections.
export const LEGEND_EN = [
  { name: 'Necessary madd', length: '6 counts, always' },
  { name: 'Obligatory madd', length: '4 or 5 counts' },
  { name: 'Permitted madd', length: '2, 4 or 6 counts' },
  { name: 'Natural madd', length: '2 counts' },
  { name: 'Ikhfaa & ghunna', length: '2 counts' },
  { name: 'Idgham & silent letters', length: 'not pronounced' },
  { name: 'Tafkhim (heavy)', length: 'heavy' },
  { name: 'Qalqala (echo)', length: 'echoed' },
];

export const SECTIONS_EN = [
  {
    title: 'How to read the colours',
    intro:
      'This mushaf uses three main colours: shades of red for the madd (lengthening), green for ghunna (nasal sound), and blue for tafkhim (dark blue) and qalqala (light blue). Grey marks letters that are not pronounced. Look at a letter’s colour before you say it, and you know the rule to apply.',
    steps: [
      ['Look at the colour of the letter', 'Before saying the word, notice its coloured letter.'],
      ['Shades of red: lengthen', 'The darker the red, the longer the madd; orange is a madd whose length you choose when stopping.'],
      ['Green: ghunna', 'Let the sound come through the nose for two counts.'],
      ['Dark blue: make it heavy', 'Open the mouth and raise the back of the tongue so the sound is full.'],
      ['Light blue: qalqala', 'Say the letter without a vowel with a light bounce, without adding a vowel to it.'],
      ['Grey: do not pronounce it', 'The letter is written, but it merges into the next one or is silent.'],
    ],
    note: 'A count (haraka) is the time it takes to fold or unfold a finger at a moderate pace. Two counts is the time of two fingers, six counts the time of six.',
  },
  {
    title: 'Madd (lengthening)',
    rules: [
      {
        name: 'Necessary madd (lazim)',
        length: '6 counts',
        when: 'A madd letter followed by an original sukun or a doubled (shadda) letter in the same word, including the letters at the start of some surahs.',
        how: 'Always six counts, when continuing and when stopping; nothing else is allowed.',
      },
      {
        name: 'Connected and separated madd (muttasil and munfasil)',
        length: '4 or 5 counts',
        when: 'A madd letter followed by a hamza: in the same word (muttasil, obligatory) or at the start of the next word (munfasil).',
        how: 'Hafs, by way of al-Shatibiyya, reads both with four or five counts. Choose one length and keep it throughout your recitation.',
      },
      {
        name: 'Permitted madd (ʿarid and leen)',
        length: '2, 4 or 6',
        when: 'ʿArid: a madd letter followed by a letter that becomes silent when you stop. Leen: a silent waw or ya after a fatha, when stopping on the letter after it.',
        how: 'Only when stopping (as on «نستعين»): short (2), medium (4) or long (6). When continuing, it is two counts.',
      },
      {
        name: 'Natural madd',
        length: '2 counts',
        when: 'A madd letter with no hamza or sukun after it, including madd al-badal (a hamza followed by a madd letter) in Hafs, and the joined ha of the pronoun between two voweled letters.',
        how: 'Exactly two counts, no more and no less.',
      },
    ],
  },
  {
    title: 'Ghunna and the silent nun',
    rules: [
      {
        name: 'Ikhfaa (hiding)',
        length: 'ghunna, 2 counts',
        when: 'A silent nun or tanween followed by one of the fifteen letters of ikhfaa (such as ت ث د ذ ز س ش ص ض ط ظ ف ق ك ج).',
        how: 'The nun is said between clear and merged: the tongue does not touch its place, with a ghunna of two counts.',
      },
      {
        name: 'Ghunna on doubled nun and mim',
        length: '2 counts',
        when: 'Every nun or mim with a shadda.',
        how: 'Hold the nasal sound for two counts before moving to the next letter.',
      },
      {
        name: 'Iqlab (changing)',
        length: 'ghunna, 2 counts',
        when: 'A silent nun or tanween followed by ba.',
        how: 'The nun becomes a hidden mim before the ba, with a ghunna of two counts and the lips gently closed.',
      },
      {
        name: 'Idgham with ghunna',
        length: 'ghunna, 2 counts',
        when: 'A silent nun or tanween followed by one of the letters of «ينمو» in the next word.',
        how: 'The nun merges into the next letter, which becomes one doubled letter, with a ghunna of two counts.',
      },
      {
        name: 'Labial ikhfaa',
        length: 'ghunna, 2 counts',
        when: 'A silent mim followed by ba.',
        how: 'The mim is hidden before the ba with a ghunna of two counts, the lips lightly closed.',
      },
    ],
  },
  {
    title: 'Idgham and silent letters',
    rules: [
      {
        name: 'The grey letter',
        length: 'not pronounced',
        when: 'A letter that merges into the next one (like a silent nun before lam and ra), or a letter that is written but not read, such as hamzat al-wasl inside a sentence and the sun lam.',
        how: 'Skip it and go straight to the letter after it; that letter is doubled if the grey letter merged into it.',
      },
    ],
  },
  {
    title: 'Tafkhim and qalqala',
    rules: [
      {
        name: 'Tafkhim (heavy letters)',
        length: 'heavy',
        when: 'The seven raised letters gathered in «خُصَّ ضَغْطٍ قِظْ», the heavy ra, and the lam of the name of Allah after a fatha or damma.',
        how: 'Raise the back of the tongue towards the palate so the mouth fills with sound. Heaviest with fatha followed by alif, then fatha, damma, sukun, and lightest with kasra.',
      },
      {
        name: 'Qalqala (echo)',
        length: 'echoed',
        when: 'One of the letters of «قُطْبُ جَدٍّ» when it has no vowel, inside a word or when stopping on it.',
        how: 'Say the letter with a light bounce so it echoes, without giving it a vowel. It is stronger when stopping, as on «الفلق» and «أحد».',
      },
    ],
  },
  {
    title: 'Features of the Hafs narration',
    intro:
      'The narration of Hafs from ʿAsim (by way of al-Shatibiyya) has particular places, marked in the writing of the mushaf, where it differs from other narrations. These are the best known:',
    features: [
      ['Sakt (a short pause)', 'A light pause without taking a breath in four places: «عوجا» (al-Kahf), «مرقدنا» (Ya-Sin), «من راق» (al-Qiyama) and «بل ران» (al-Mutaffifin).'],
      ['Imala', 'The ra and the alif after it are said with full imala in one place only: «مجريها» (Hud).'],
      ['Tashil (easing)', 'The second hamza is eased between hamza and alif in «ءأعجمي» (Fussilat).'],
      ['Ishmam', 'The lips are rounded while the nun is merged in «تأمنّا» (Yusuf), pointing to the damma of the first nun.'],
      ['Two ways in «ضعف»', 'The dad may be read with fatha or damma in «ضعف», in its three places in al-Rum.'],
      ['Sin and sad', '«ويبصط» (al-Baqara) and «بصطة» (al-Aʿraf) are read with sin; «المصيطرون» (al-Tur) with sin or sad.'],
      ['Madd al-badal', 'Read with two counts only (a natural madd), unlike Warsh.'],
    ],
    note: 'This is a simple guide to the colours of the mushaf. To master recitation in the Hafs narration, learn from a qualified teacher.',
  },
];

// ---------- French ----------
// Terms follow the French tajwid courses (Khaled Bouchafaa's course on IslamHouse; the «Règles de Tajwîd» notes on
// quran-uni.com): ikhfâ’ = dissimulation, idghâm = assimilation, iqlâb = substitution, ghunna = nasalisation,
// qalqala = agitation, madd = prolongation, ikhfâ’ chafawî = dissimulation labiale, noun sâkina / tanwîn.
// A «count» (haraka) is a «temps».

export const LEGEND_FR = [
  { name: 'Madd lâzim (nécessaire)', length: '6 temps, toujours' },
  { name: 'Madd wâjib (obligatoire)', length: '4 ou 5 temps' },
  { name: 'Madd permis (jâ’iz)', length: '2, 4 ou 6 temps' },
  { name: 'Madd aslî (d’origine)', length: '2 temps' },
  { name: 'Ikhfâ’ et ghunna', length: '2 temps' },
  { name: 'Idghâm et lettres muettes', length: 'non prononcée' },
  { name: 'Tafkhîm (emphase)', length: 'emphatique' },
  { name: 'Qalqala (agitation)', length: 'avec agitation' },
];

export const SECTIONS_FR = [
  {
    title: 'Comment lire les couleurs',
    intro:
      'Ce mushaf utilise trois couleurs principales : les nuances de rouge pour le madd (prolongation), le vert pour la ghunna (nasalisation) et le bleu pour le tafkhîm (bleu foncé) et la qalqala (bleu clair). Le gris signale les lettres qui ne sont pas prononcées. Regardez la couleur d’une lettre avant de la dire : vous savez alors quelle règle appliquer.',
    steps: [
      ['Regardez la couleur de la lettre', 'Avant de dire le mot, repérez sa lettre colorée.'],
      ['Nuances de rouge : prolongez', 'Plus le rouge est foncé, plus le madd est long ; l’orange est un madd dont vous choisissez la durée à l’arrêt.'],
      ['Vert : ghunna', 'Laissez le son passer par le nez pendant deux temps.'],
      ['Bleu foncé : rendez-la emphatique', 'Ouvrez la bouche et relevez l’arrière de la langue pour que le son soit plein.'],
      ['Bleu clair : qalqala', 'Dites la lettre sans voyelle avec un léger rebond, sans lui ajouter de voyelle.'],
      ['Gris : ne la prononcez pas', 'La lettre est écrite, mais elle se fond dans la suivante ou reste muette.'],
    ],
    note: 'Un temps (haraka) est la durée qu’il faut pour plier ou déplier un doigt à un rythme modéré. Deux temps, c’est la durée de deux doigts ; six temps, celle de six.',
  },
  {
    title: 'Madd (prolongation)',
    rules: [
      {
        name: 'Madd lâzim (nécessaire)',
        length: '6 temps',
        when: 'Une lettre de madd suivie d’un soukoun d’origine ou d’une lettre doublée (chadda) dans le même mot, y compris les lettres au début de certaines sourates.',
        how: 'Toujours six temps, en continuant comme à l’arrêt ; aucune autre durée n’est permise.',
      },
      {
        name: 'Madd muttasil et munfasil (dans le mot et entre deux mots)',
        length: '4 ou 5 temps',
        when: 'Une lettre de madd suivie d’une hamza : dans le même mot (muttasil, obligatoire) ou au début du mot suivant (munfasil).',
        how: 'Hafs, par la voie d’al-Shatibiyya, lit les deux avec quatre ou cinq temps. Choisissez une durée et gardez-la tout au long de votre récitation.',
      },
      {
        name: 'Madd permis (ʿârid et lîn)',
        length: '2, 4 ou 6',
        when: 'ʿÂrid : une lettre de madd suivie d’une lettre qui devient muette à l’arrêt. Lîn : un waw ou un ya sâkin après une fatha, lorsqu’on s’arrête sur la lettre qui suit.',
        how: 'Seulement à l’arrêt (comme sur «نستعين») : court (2), moyen (4) ou long (6). En continuant, c’est deux temps.',
      },
      {
        name: 'Madd aslî (d’origine)',
        length: '2 temps',
        when: 'Une lettre de madd sans hamza ni soukoun après elle, y compris le madd al-badal (une hamza suivie d’une lettre de madd) chez Hafs, et le ha du pronom attaché entre deux lettres voyellées.',
        how: 'Exactement deux temps, ni plus ni moins.',
      },
    ],
  },
  {
    title: 'Ghunna et noun sâkina',
    rules: [
      {
        name: 'Ikhfâ’ (dissimulation)',
        length: 'ghunna, 2 temps',
        when: 'Un noun sâkina (sans voyelle) ou un tanwîn suivi de l’une des quinze lettres de l’ikhfâ’ (comme ت ث د ذ ز س ش ص ض ط ظ ف ق ك ج).',
        how: 'Le noun est dit entre clair et fondu : la langue ne touche pas son point d’articulation, avec une ghunna de deux temps.',
      },
      {
        name: 'Ghunna sur noun et mim doublés',
        length: '2 temps',
        when: 'Tout noun ou mim portant une chadda.',
        how: 'Tenez le son nasal pendant deux temps avant de passer à la lettre suivante.',
      },
      {
        name: 'Iqlâb (substitution)',
        length: 'ghunna, 2 temps',
        when: 'Un noun sâkina ou un tanwîn suivi de ba.',
        how: 'Le noun devient un mim dissimulé devant le ba, avec une ghunna de deux temps et les lèvres doucement fermées.',
      },
      {
        name: 'Idghâm avec ghunna',
        length: 'ghunna, 2 temps',
        when: 'Un noun sâkina ou un tanwîn suivi de l’une des lettres de «ينمو» dans le mot suivant.',
        how: 'Le noun se fond dans la lettre suivante, qui devient une seule lettre doublée, avec une ghunna de deux temps.',
      },
      {
        name: 'Ikhfâ’ labial (chafawî)',
        length: 'ghunna, 2 temps',
        when: 'Un mim sâkin suivi de ba.',
        how: 'Le mim est dissimulé devant le ba avec une ghunna de deux temps, les lèvres légèrement fermées.',
      },
    ],
  },
  {
    title: 'Idghâm et lettres muettes',
    rules: [
      {
        name: 'La lettre grise',
        length: 'non prononcée',
        when: 'Une lettre qui se fond dans la suivante (comme un noun sâkin devant lam et ra), ou une lettre écrite mais non lue, comme la hamzat al-wasl au milieu d’une phrase et le lam solaire.',
        how: 'Passez-la et allez directement à la lettre suivante ; celle-ci est doublée si la lettre grise s’y est fondue.',
      },
    ],
  },
  {
    title: 'Tafkhîm et qalqala',
    rules: [
      {
        name: 'Tafkhîm (lettres emphatiques)',
        length: 'emphatique',
        when: 'Les sept lettres d’élévation (emphatiques) réunies dans «خُصَّ ضَغْطٍ قِظْ», le ra emphatique, et le lam du nom d’Allah après une fatha ou une damma.',
        how: 'Relevez l’arrière de la langue vers le palais pour que la bouche se remplisse de son. L’emphase est la plus forte avec fatha suivie d’un alif, puis fatha, damma, soukoun, et la plus légère avec kasra.',
      },
      {
        name: 'Qalqala (agitation)',
        length: 'avec agitation',
        when: 'L’une des lettres de «قُطْبُ جَدٍّ» lorsqu’elle n’a pas de voyelle, à l’intérieur d’un mot ou à l’arrêt.',
        how: 'Dites la lettre avec un léger rebond pour qu’elle résonne, sans lui donner de voyelle. Elle est plus forte à l’arrêt, comme sur «الفلق» et «أحد».',
      },
    ],
  },
  {
    title: 'Particularités de la lecture de Hafs',
    intro:
      'La lecture de Hafs d’après ʿÂsim (par la voie d’al-Shatibiyya) comporte des endroits particuliers, marqués dans l’écriture du mushaf, où elle diffère des autres lectures. Voici les plus connus :',
    features: [
      ['Sakt (courte pause)', 'Une légère pause, sans reprendre son souffle, en quatre endroits : «عوجا» (al-Kahf), «مرقدنا» (Ya-Sin), «من راق» (al-Qiyama) et «بل ران» (al-Mutaffifin).'],
      ['Imâla', 'Le ra et l’alif qui le suit sont dits avec une imâla complète à un seul endroit : «مجريها» (Hud).'],
      ['Tashîl (adoucissement)', 'La seconde hamza est adoucie entre hamza et alif dans «ءأعجمي» (Fussilat).'],
      ['Ishmâm', 'Les lèvres sont arrondies pendant que le noun est fondu dans «تأمنّا» (Yusuf), pour indiquer la damma du premier noun.'],
      ['Deux façons dans «ضعف»', 'Le dad peut être lu avec fatha ou damma dans «ضعف», à ses trois endroits dans al-Rum.'],
      ['Sin et sad', '«ويبصط» (al-Baqara) et «بصطة» (al-Aʿraf) se lisent avec sin ; «المصيطرون» (al-Tur) avec sin ou sad.'],
      ['Madd al-badal', 'Lu avec deux temps seulement (un madd aslî), contrairement à Warsh.'],
    ],
    note: 'Ceci est un guide simple des couleurs du mushaf. Pour maîtriser la récitation selon Hafs, apprenez auprès d’un enseignant qualifié.',
  },
];
