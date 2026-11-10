// The Home screen's type scale, as props for <Txt>. One face (Tajawal) in three weights: 500 for quiet words, 700 for
// names and small figures, 800 for the few big ones. No letter-spacing anywhere: it would break the joined Arabic letters.
export const T = {
  greeting: { size: 30, weight: 800, lineHeight: 38 },
  date: { size: 14, weight: 500, lineHeight: 20 },
  display: { size: 38, weight: 800, lineHeight: 46 }, // the next prayer
  hero: { size: 28, weight: 800, lineHeight: 38 }, // the surah
  big: { size: 40, weight: 800, lineHeight: 46 }, // a plan's percentage
  figure: { size: 20, weight: 800, lineHeight: 28 }, // the time left, "5 of 7"
  title: { size: 17, weight: 700, lineHeight: 24 },
  body: { size: 15, weight: 500, lineHeight: 24 },
  small: { size: 13, weight: 500, lineHeight: 19 },
  smallBold: { size: 13, weight: 700, lineHeight: 19 },
  button: { size: 16, weight: 800, lineHeight: 22 },
} as const;
