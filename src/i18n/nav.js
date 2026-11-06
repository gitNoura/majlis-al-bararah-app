// The words of the navigation skeleton (the tab stubs). Temporary: the stubs go away as each tab is rebuilt.
import { L } from './i18n.js';

export const NAV = {
  rebuilding: () => L('هذه الشاشة قيد إعادة البناء.', 'This screen is being rebuilt.', 'Cet écran est en cours de refonte.'),
  previous: () => L('الإصدار السابق', 'Previous version', 'Version précédente'),
  previousSub: () => L('الشاشة القديمة، إلى أن يكتمل الجديد', 'The old screen, until the new one is done', 'L’ancien écran, en attendant le nouveau'),
};
