// The tajweed guide of the mushaf being read (the website's src/reader/tajweed.js): the colour rules of the Warsh mushaf
// (warsh.js) or of the Hafs mushaf (hafs.js), each with its own legend, lengths, rules and examples. Arabic is the
// source; English and French put their text over the Arabic sections' colours and examples.
//
// The language is read when the guide is asked for (getGuide), not when this file loads: the app's language can be
// restored or changed after the imports ran, and a guide built at import time then stayed in the wrong language.
import { isEnglish, isFrench } from '../../i18n/i18n.js';
import { HAFS } from '../riwaya.js';
import * as HAFS_GUIDE from './hafs.js';
import * as WARSH_GUIDE from './warsh.js';

const GUIDE = HAFS ? HAFS_GUIDE : WARSH_GUIDE;

// puts one language's words (legend, titles, texts) over the Arabic sections' colours and examples
function translated(legendText, sectionsText) {
  const legend = GUIDE.LEGEND.map((l, i) => ({ ...l, ...legendText[i] }));
  const sections = GUIDE.SECTIONS.map((s, i) => {
    const e = sectionsText[i];
    return {
      ...s,
      title: e.title,
      intro: e.intro,
      steps: e.steps,
      note: e.note,
      rules: s.rules?.map((r, j) => ({ ...r, ...e.rules[j] })),
      features: s.features?.map((f, j) => [e.features[j][0], e.features[j][1], f[2]]),
    };
  });
  return { legend, sections };
}

const built = {};

/**
 * The guide in the language the app is in right now.
 * @returns {{ guideSub: string, legend: { color: string, name: string, length: string }[], sections: { id: string, title: string, intro?: string, steps?: string[][], rules?: any[], features?: string[][], note?: string }[] }}
 */
export function getGuide() {
  const lang = isFrench && GUIDE.SECTIONS_FR ? 'fr' : isEnglish ? 'en' : 'ar';
  if (!built[lang]) {
    if (lang === 'ar') built[lang] = { guideSub: GUIDE.SUB.ar, legend: GUIDE.LEGEND, sections: GUIDE.SECTIONS };
    else built[lang] = { guideSub: GUIDE.SUB[lang], ...(lang === 'fr' ? translated(GUIDE.LEGEND_FR, GUIDE.SECTIONS_FR) : translated(GUIDE.LEGEND_EN, GUIDE.SECTIONS_EN)) };
  }
  return built[lang];
}
