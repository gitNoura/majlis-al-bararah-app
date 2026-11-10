// The named text styles of the Home cards, on the Tailwind type scale (12 / 14 / 16 / 18 / 20 / 24 / 30 / 36), each with the
// line height its step carries. Spread one into <Txt {...type.heading4}>: a text never gets a loose size and weight. The weights
// are the app's own faces (Tajawal has 400, 500, 700 and a 800 that the Home does not use: nothing is bolder than bold).
// Heading: the numbers and names that lead a card.  Title: the label that leads a block.  Body: running text.
// Button: the words inside a button.  Caption: fine print, days, letters.
const w = { regular: 400, medium: 500, bold: 700 } as const;

export const type = {
  heading3: { size: 36, lineHeight: 40, weight: w.bold },
  heading4: { size: 30, lineHeight: 36, weight: w.bold },
  heading5: { size: 24, lineHeight: 32, weight: w.bold },
  heading6: { size: 20, lineHeight: 28, weight: w.bold },
  title2: { size: 18, lineHeight: 28, weight: w.medium },
  title3: { size: 16, lineHeight: 24, weight: w.medium },
  title4: { size: 14, lineHeight: 20, weight: w.bold },
  body5: { size: 14, lineHeight: 20, weight: w.medium },
  body6: { size: 14, lineHeight: 20, weight: w.regular },
  // the hadith carries vowel marks, which need more room than the 20 of its step
  hadith: { size: 14, lineHeight: 24, weight: w.medium },
  buttonMd: { size: 16, lineHeight: 24, weight: w.bold },
  caption3: { size: 12, lineHeight: 16, weight: w.bold },
  caption4: { size: 12, lineHeight: 16, weight: w.medium },
} as const;
