// A row kept left to right in every language (the layout stays the English one; only the words change):
// the phones' «direction»; in the browser preview, whose page is right to left in Arabic, the row
// turned round
import { Platform } from 'react-native';

import { isEnglish } from '@/i18n/i18n';

export const ltr = () =>
  Platform.OS === 'web' ? ({ flexDirection: isEnglish ? 'row' : 'row-reverse' } as const) : ({ direction: 'ltr' } as const);

// Text lined up on one side of the screen. Android swaps «left» and «right» for text in the Arabic
// layout (right to left) - so a plain «right» shows on the left there - while the iPhone and the
// browser preview do not: textSide() gives the value that puts it on that side everywhere. Text that
// simply starts its language's line needs no alignment at all: it starts on the right in Arabic and on
// the left in English, on every phone. (Text fields are not swapped: they take «left» / «right» as is.)
export const textSide = (side: 'left' | 'right') =>
  Platform.OS === 'android' && !isEnglish ? (side === 'left' ? 'right' : 'left') : side;
