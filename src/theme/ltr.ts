// A row kept left to right in every language (the layout stays the English one; only the words change):
// the phones' «direction»; in the browser preview, whose page is right to left in Arabic, the row
// turned round
import { Platform } from 'react-native';

import { isEnglish, LANG } from '@/i18n/i18n';

export const ltr = () =>
  Platform.OS === 'web' ? ({ flexDirection: isEnglish ? 'row' : 'row-reverse' } as const) : ({ direction: 'ltr' } as const);

// Text lined up on one side of the screen. Android swaps «left» and «right» for text in the Arabic
// layout (right to left) - so a plain «right» shows on the left there - while the iPhone and the
// browser preview do not: textSide() gives the value that puts it on that side everywhere. Text that
// simply starts its language's line needs no alignment at all: it starts on the right in Arabic and on
// the left in English, on every phone. (Text fields are not swapped: they take «left» / «right» as is.)
export const textSide = (side: 'left' | 'right') =>
  Platform.OS === 'android' && !isEnglish ? (side === 'left' ? 'right' : 'left') : side;

// A row's words, lined up at the start of the layout's line (the right in Arabic, whatever script the words are in).
// On the iPhone a plain «right» in the Arabic layout is swapped to the left (the settings' rows came out scooted to
// the left, away from their titles' side), so there the line's own direction decides: the words start where the
// language's line starts. Elsewhere it is textSide as before.
export const lineStart = () =>
  Platform.OS === 'ios'
    ? ({ textAlign: 'auto', writingDirection: isEnglish ? 'ltr' : 'rtl' } as const)
    : ({ textAlign: textSide(isEnglish ? 'left' : 'right') } as const);

// Text at the start of its language's line (the right in Arabic) INSIDE a row kept left to right with ltr(): there the layout is plainly
// left to right, so «right» is the right on every phone. (lineStart and textSide are for text in the app's own, possibly swapped,
// layout; used in an ltr() row on Android they put the Arabic at the left.)
export const ltrStart = () => (LANG === 'ar' ? ({ textAlign: 'right', writingDirection: 'rtl' } as const) : ({ textAlign: 'left', writingDirection: 'ltr' } as const));
