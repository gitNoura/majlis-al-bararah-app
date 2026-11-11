// The tajweed guide of the mushaf being read (the website's src/reader/tajweed.js): the colour rules of the Warsh mushaf
// (warsh.js) or of the Hafs mushaf (hafs.js), each with its own legend, lengths, rules and examples. Arabic is the
// source; English (also shown for French) puts its text over the Arabic sections' colours and examples.
import { isEnglish } from '../../i18n/i18n.js';
import { HAFS } from '../riwaya.js';
import * as HAFS_GUIDE from './hafs.js';
import * as WARSH_GUIDE from './warsh.js';

const { LEGEND, SECTIONS, LEGEND_EN, SECTIONS_EN, SUB } = HAFS ? HAFS_GUIDE : WARSH_GUIDE;

export const guideSub = isEnglish ? SUB.en : SUB.ar;

/** @type {{ color: string, name: string, length: string }[]} */
export const legend = isEnglish ? LEGEND.map((l, i) => ({ ...l, ...LEGEND_EN[i] })) : LEGEND;

// [{ id, title, intro?, steps?, rules?, features?, note? }]
export const sections = isEnglish
  ? SECTIONS.map((s, i) => {
      const e = SECTIONS_EN[i];
      return {
        ...s,
        title: e.title,
        intro: e.intro,
        steps: e.steps,
        note: e.note,
        rules: s.rules?.map((r, j) => ({ ...r, ...e.rules[j] })),
        features: s.features?.map((f, j) => [e.features[j][0], e.features[j][1], f[2]]),
      };
    })
  : SECTIONS;
