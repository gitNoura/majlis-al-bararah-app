// The Home screen's type scale, as props for <Txt>. One face (Tajawal) in two weights: 500 for quiet words, 700 for names and
// figures. Sizes are the app's everyday ones (12 to 26): Home is a screen to scan, so nothing shouts. The Arabic of the Quran
// (the surah's name, the hadith) is set in Amiri where it appears, never here. No letter-spacing anywhere: it would break
// the joined Arabic letters.
export const T = {
  greeting: { size: 22, weight: 700, lineHeight: 28 },
  date: { size: 12, weight: 500, lineHeight: 17 },
  big: { size: 26, weight: 700, lineHeight: 32 }, // a plan's percentage
  figure: { size: 15, weight: 700, lineHeight: 20 }, // the time left, "3 of 7", the reading's percentage
  title: { size: 15, weight: 700, lineHeight: 20 },
  body: { size: 14, weight: 500, lineHeight: 22 },
  small: { size: 12, weight: 500, lineHeight: 17 },
  smallBold: { size: 12, weight: 700, lineHeight: 17 },
  button: { size: 15, weight: 700, lineHeight: 20 },
} as const;
