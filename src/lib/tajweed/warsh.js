// The tajweed guide of the Warsh mushaf (Dar al-Maarifa, narration of Warsh from Nafi): its colour
// legend and its rules, in Arabic and in English (drawn by src/reader/tajweed.js).
//
// Colours are sampled from the legend printed at the bottom of every page.
// Examples are written as [plain, coloured, plain, ...]: every second part is shown in
// the rule's colour, like the coloured letters in the mushaf.

export const SUB = { ar: 'برواية ورش عن نافع', en: 'Narration of Warsh from Nafi', fr: 'Lecture de Warsh d’après Nafiʿ' };

export const COLORS = {
  lazim: '#b00161', // مد 6 حركات لزوماً
  mushbaa: '#e1047d', // مد مشبع 6 حركات
  jaiz: '#ed7e04', // مد 2 أو 4 أو 6 جوازاً
  haraka2: '#e6ad0c', // مد حركتان
  ghunna: '#039540', // إخفاء ومواقع الغنة
  idgham: '#9d9d9d', // إدغام وما لا يلفظ
  tafkhim: '#016a92', // تفخيم
  qalqala: '#049edf', // قلقلة
};

// The legend of the mushaf, in its own order.
export const LEGEND = [
  { color: COLORS.lazim, name: 'مدّ لازم', length: '6 حركات لزوماً' },
  { color: COLORS.mushbaa, name: 'مدّ مشبع', length: '6 حركات' },
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
      ['الأحمر بدرجاته: مُدّ', 'كلما كان اللون أغمق كان المدّ أطول؛ والبرتقالي مدّ تختار مقداره.'],
      ['الأخضر: غُنّ', 'أخرج الصوت من الأنف مقدار حركتين.'],
      ['الأزرق الغامق: فخّم', 'افتح فمك وارفع مؤخرة اللسان ليمتلئ الصوت.'],
      ['الأزرق الفاتح: قلقِل', 'انطق الحرف الساكن بنبرة خفيفة دون أن تضيف إليه حركة.'],
      ['الرمادي: لا تنطقه', 'الحرف مكتوب لكنه يُدغم فيما بعده أو يسقط في النطق.'],
    ],
    note: 'الحركة: مقدار الزمن اللازم لقبض الإصبع أو بسطه بسرعة معتدلة. فالحركتان زمن قبض إصبعين، والستّ زمن قبض ستة أصابع.',
    page: 605,
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
        examples: [['اَ۬لضَّ', 'آ', 'لِّينَ'], ['', 'أَلَٓمِّٓ', ''], ['كُلِّ دَ', 'آ', 'بَّةٖ']],
      },
      {
        color: COLORS.mushbaa,
        name: 'المدّ المشبع (المتصل والمنفصل)',
        length: '6 حركات',
        when: 'حرف مدّ بعده همزة: في الكلمة نفسها (المتصل)، أو في أول الكلمة التالية (المنفصل).',
        how: 'يقرأ ورش المتصل والمنفصل بالإشباع ستّ حركات.',
        examples: [['اَ۬لسَّمَ', 'آ', 'ءِ'], ['جَ', 'آ', 'ءَ'], ['بِمَ', 'آ', ' أُنزِلَ']],
      },
      {
        color: COLORS.jaiz,
        name: 'المدّ الجائز (البدل والعارض للسكون)',
        length: '2 أو 4 أو 6',
        when: 'مدّ البدل: همزة بعدها حرف مدّ. والعارض للسكون: حرف مدّ بعده حرف تُسكّنه عند الوقف.',
        how: 'يجوز فيه القصر (حركتان) أو التوسط (4) أو الإشباع (6)، والعارض لا يكون إلا عند الوقف (كالوقف على «نستعين»). اختر مقداراً واحداً والتزمه في الكلمات المتماثلة طوال تلاوتك.',
        examples: [['ءَ', 'ا', 'مَنُواْ'], ['أُ', 'و', 'تُواْ'], ['نَسْتَعِ', 'ي', 'نُ']],
      },
      {
        color: COLORS.haraka2,
        name: 'المدّ الطبيعي',
        length: 'حركتان',
        when: 'حرف مدّ ليس بعده همز ولا سكون، ومنه صلة هاء الضمير بين متحركين.',
        how: 'يُمدّ حركتين فقط، بلا زيادة ولا نقصان.',
        examples: [['إِنَّهُ', 'ۥ', ' كَانَ'], ['قَ', 'ا', 'لَ'], ['يَقُ', 'و', 'لُ']],
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
        examples: [['مِ', 'ن', ' شَرِّ'], ['أَ', 'ن', 'فُسَكُمْ'], ['عَذَابا', 'ٗ', ' شَدِيداٗ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الغنّة في النون والميم المشدّدتين',
        length: 'حركتان',
        when: 'كل نون أو ميم عليها شدّة.',
        how: 'تُحبس الغنّة في الأنف مقدار حركتين قبل الانتقال إلى الحرف التالي.',
        examples: [['إِ', 'نَّ', ''], ['ثُ', 'مَّ', ''], ['اَ۬ل', 'نَّ', 'اسِ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإقلاب',
        length: 'غنّة حركتان',
        when: 'نون ساكنة أو تنوين بعدها باء.',
        how: 'تُقلب النون ميماً مخفاة عند الباء مع غنّة حركتين، وتُنطق الشفتان منطبقتين برفق.',
        examples: [['مِ', 'نۢ', ' بَعْدِ'], ['سَمِي', 'عُۢ', ' بَصِيرٞ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإدغام بغنّة',
        length: 'غنّة حركتان',
        when: 'نون ساكنة أو تنوين بعدها حرف من حروف (ينمو) في كلمتين.',
        how: 'تُدخل النون في الحرف التالي فتصيرا حرفاً واحداً مشدّداً، مع غنّة حركتين.',
        examples: [['مَ', 'نْ', ' يَّقُولُ'], ['مِ', 'نْ', ' وَّالٍ']],
      },
      {
        color: COLORS.ghunna,
        name: 'الإخفاء الشفوي',
        length: 'غنّة حركتان',
        when: 'ميم ساكنة بعدها باء.',
        how: 'تُخفى الميم عند الباء مع غنّة حركتين، بإطباق خفيف للشفتين.',
        examples: [['تَرْمِيهِ', 'م', ' بِحِجَارَةٖ']],
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
        when: 'حرف يُدغم في ما بعده (كالنون الساكنة قبل اللام والراء)، أو حرف مكتوب لا يُقرأ.',
        how: 'تجاوزه في النطق وانتقل مباشرة إلى الحرف الذي بعده، ويُشدَّد الحرف التالي إن كان مدغماً فيه.',
        examples: [['مِّ', 'ن', ' رَّبِّهِمْ'], ['قَالُو', 'اْ', ''], ['قَ', 'د', ' تَّبَيَّنَ']],
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
        when: 'حروف الاستعلاء السبعة المجموعة في (خُصَّ ضَغْطٍ قِظْ)، والراء المفخّمة، واللام المغلّظة عند ورش.',
        how: 'ارفع مؤخرة اللسان نحو الحنك ليمتلئ الفم بالصوت. أعلى درجاته مع الفتح وبعده ألف، ثم الفتح، ثم الضم، ثم السكون، وأدناها مع الكسر.',
        examples: [['', 'قَا', 'لَ'], ['', 'صِ', 'رَٰطَ'], ['', 'طَّآ', 'ئِفَةٞ']],
      },
      {
        color: COLORS.qalqala,
        name: 'القلقلة',
        length: 'يُقلقَل',
        when: 'أحد حروف (قُطْبُ جَدٍّ) إذا كان ساكناً، في وسط الكلمة أو عند الوقف عليها.',
        how: 'انطق الحرف الساكن بنبرة خفيفة حتى يُسمع له صدى، دون أن تُحرّكه بفتح أو ضم أو كسر. وهي عند الوقف أقوى، كالوقف على «الفلق» و«أحد».',
        examples: [['قَ', 'دْ', ''], ['اِ۬لْفَلَ', 'قِ', ''], ['أَحَ', 'دٞ', '']],
      },
    ],
  },
  {
    id: 'warsh',
    title: 'من خصائص رواية ورش',
    intro:
      'لرواية ورش عن نافع من طريق الأزرق أصولٌ تميّزها عن رواية حفص، وبعضها يظهر في رسم هذا المصحف وضبطه. هذه أشهرها:',
    features: [
      ['النقل', 'تُنقل حركة الهمزة إلى الحرف الساكن قبلها وتُحذف الهمزة.', 'قَدَ اَفْلَحَ (قد أفلح)'],
      ['إبدال الهمز الساكن', 'تُبدل الهمزة الساكنة حرفَ مدّ من جنس حركة ما قبلها في مواضع كثيرة.', 'يُومِنُونَ (يؤمنون)'],
      ['صلة ميم الجمع', 'تُوصل ميم الجمع بواو إذا جاء بعدها همز قطع، وتُمدّ مدّاً منفصلاً.', 'عَلَيْهِمُۥٓ ءَآنذَرْتَهُمُۥٓ أَمْ لَمْ تُنذِرْهُمْ'],
      ['مدّ البدل', 'يُقرأ بالقصر أو التوسط أو الإشباع (2 أو 4 أو 6).', 'ءَامَنُواْ'],
      ['مدّ اللين المهموز', 'الياء أو الواو الساكنة بعد فتح وبعدها همز: توسط أو إشباع.', 'شَےْءٖ'],
      ['تغليظ اللام', 'تُفخَّم اللام المفتوحة إذا سبقتها صاد أو طاء أو ظاء مفتوحة أو ساكنة.', 'اَ۬لصَّلَوٰةَ'],
      ['ترقيق الراء', 'تُرقّق الراء المفتوحة أو المضمومة إذا سبقتها كسرة أو ياء ساكنة، بشروط.', 'خَبِيرٞ'],
      ['التقليل', 'نطق الألف بين الفتح والإمالة في مواضع مخصوصة، منها رؤوس آي بعض السور.', 'وَالضُّح۪ىٰ'],
    ],
    note: 'هذا دليل مبسّط لقراءة ألوان المصحف. لإتقان التلاوة برواية ورش يُنصح بالتلقي عن شيخ متقن.',
  },
];

// ---------- English ----------

// The same guide in English, in the same order as LEGEND and SECTIONS. The Quran examples
// (and the colours) are taken from the Arabic sections.
export const LEGEND_EN = [
  { name: 'Necessary madd', length: '6 counts, always' },
  { name: 'Full madd', length: '6 counts' },
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
      ['Shades of red: lengthen', 'The darker the red, the longer the madd; orange is a madd whose length you choose.'],
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
        name: 'Full madd (muttasil and munfasil)',
        length: '6 counts',
        when: 'A madd letter followed by a hamza: in the same word (muttasil) or at the start of the next word (munfasil).',
        how: 'Warsh reads both with full length: six counts.',
      },
      {
        name: 'Permitted madd (badal and ʿarid)',
        length: '2, 4 or 6',
        when: 'Badal: a hamza followed by a madd letter. ʿArid: a madd letter followed by a letter that becomes silent when you stop.',
        how: 'It may be short (2), medium (4) or long (6); the ʿarid only applies when stopping (as on «نستعين»). Choose one length and keep it for similar words throughout your recitation.',
      },
      {
        name: 'Natural madd',
        length: '2 counts',
        when: 'A madd letter with no hamza or sukun after it, including the joined ha of the pronoun between two voweled letters.',
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
        when: 'A letter that merges into the next one (like a silent nun before lam and ra), or a letter that is written but not read.',
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
        when: 'The seven raised letters gathered in «خُصَّ ضَغْطٍ قِظْ», the heavy ra, and in Warsh the heavy lam.',
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
    title: 'Features of the Warsh narration',
    intro:
      'The narration of Warsh from Nafi (by way of al-Azraq) has principles that set it apart from Hafs; some of them show in the writing of this mushaf. These are the best known:',
    features: [
      ['Naql (moving the hamza)', 'The vowel of a hamza moves to the silent letter before it, and the hamza is dropped.'],
      ['Easing the silent hamza', 'In many places a silent hamza becomes a madd letter matching the vowel before it.'],
      ['Joining the plural mim', 'The plural mim is joined with a waw when a hamza follows, and lengthened as a munfasil madd.'],
      ['Madd al-badal', 'Read short, medium or long (2, 4 or 6).'],
      ['Soft letter before hamza', 'A silent ya or waw after fatha and before a hamza: medium or long.'],
      ['Heavy lam', 'A lam with fatha is made heavy after a sad, ta or dha with fatha or sukun.'],
      ['Light ra', 'A ra with fatha or damma is made light after a kasra or a silent ya, under conditions.'],
      ['Taqlil', 'The alif is said between fatha and imala in certain places, including the ayah endings of some surahs.'],
    ],
    note: 'This is a simple guide to the colours of the mushaf. To master recitation in the Warsh narration, learn from a qualified teacher.',
  },
];

// ---------- French ----------
// Terms follow the French tajwid courses (Khaled Bouchafaa's course on IslamHouse; the «Règles de Tajwîd» notes on
// quran-uni.com): ikhfâ’ = dissimulation, idghâm = assimilation, iqlâb = substitution, ghunna = nasalisation,
// qalqala = agitation, madd = prolongation, ikhfâ’ chafawî = dissimulation labiale, noun sâkina / tanwîn.
// A «count» (haraka) is a «temps».

export const LEGEND_FR = [
  { name: 'Madd lâzim (nécessaire)', length: '6 temps, toujours' },
  { name: 'Madd complet', length: '6 temps' },
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
      ['Nuances de rouge : prolongez', 'Plus le rouge est foncé, plus le madd est long ; l’orange est un madd dont vous choisissez la durée.'],
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
        name: 'Madd complet (muttasil et munfasil)',
        length: '6 temps',
        when: 'Une lettre de madd suivie d’une hamza : dans le même mot (muttasil) ou au début du mot suivant (munfasil).',
        how: 'Warsh lit les deux avec la durée complète : six temps.',
      },
      {
        name: 'Madd permis (badal et ʿârid)',
        length: '2, 4 ou 6',
        when: 'Badal : une hamza suivie d’une lettre de madd. ʿÂrid : une lettre de madd suivie d’une lettre qui devient muette à l’arrêt.',
        how: 'Il peut être court (2), moyen (4) ou long (6) ; le ʿârid ne s’applique qu’à l’arrêt (comme sur «نستعين»). Choisissez une durée et gardez-la pour les mots semblables tout au long de votre récitation.',
      },
      {
        name: 'Madd aslî (d’origine)',
        length: '2 temps',
        when: 'Une lettre de madd sans hamza ni soukoun après elle, y compris le ha du pronom attaché entre deux lettres voyellées.',
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
        when: 'Une lettre qui se fond dans la suivante (comme un noun sâkin devant lam et ra), ou une lettre écrite mais non lue.',
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
        when: 'Les sept lettres d’élévation (emphatiques) réunies dans «خُصَّ ضَغْطٍ قِظْ», le ra emphatique et, chez Warsh, le lam emphatique.',
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
    title: 'Particularités de la lecture de Warsh',
    intro:
      'La lecture de Warsh d’après Nafiʿ (par la voie d’al-Azraq) a des principes qui la distinguent de celle de Hafs ; certains apparaissent dans l’écriture de ce mushaf. Voici les plus connus :',
    features: [
      ['Naql (transfert de la hamza)', 'La voyelle d’une hamza passe à la lettre sans voyelle qui la précède, et la hamza est supprimée.'],
      ['Adoucissement de la hamza sâkina', 'En de nombreux endroits, une hamza sans voyelle devient une lettre de madd qui correspond à la voyelle précédente.'],
      ['Liaison du mim du pluriel', 'Le mim du pluriel est lié à un waw lorsqu’une hamza suit, et prolongé comme un madd munfasil.'],
      ['Madd al-badal', 'Lu court, moyen ou long (2, 4 ou 6).'],
      ['Lettre de lîn devant une hamza', 'Un ya ou un waw sâkin après une fatha et devant une hamza : moyen ou long.'],
      ['Lam emphatique', 'Un lam avec fatha devient emphatique après un sad, un ta ou un dha avec fatha ou soukoun.'],
      ['Ra léger (tarqîq)', 'Un ra avec fatha ou damma devient léger après une kasra ou un ya sâkin, sous certaines conditions.'],
      ['Taqlîl', 'L’alif est dit entre la fatha et l’imâla à certains endroits, notamment à la fin des versets de certaines sourates.'],
    ],
    note: 'Ceci est un guide simple des couleurs du mushaf. Pour maîtriser la récitation selon Warsh, apprenez auprès d’un enseignant qualifié.',
  },
];
