// The misbaha's words, in Arabic, English and French.
import { L } from './i18n.js';

export const MISBAHA = {
  title: () => L('المسبحة', 'Misbaha', 'Misbaha'),
  sub: () => L('التسبيح والاستغفار والصلاة على النبي ﷺ', 'Tasbih, istighfar and prayers on the Prophet ﷺ', 'Tasbih, istighfar et prière sur le Prophète ﷺ'),
  reset: () => L('من جديد', 'Reset', 'Remettre à zéro'),
  tap: () => L('اضغط للتسبيح', 'Tap to count', 'Touchez pour compter'),
  noLimit: () => L('بلا حدّ', 'No limit', 'Sans limite'),
  rounds: (n) => L(`الدورات: ${n}`, `Rounds: ${n}`, `Tours : ${n}`),
  today: (n) => L(`اليوم: ${n}`, `Today: ${n}`, `Aujourd’hui : ${n}`),
};
