// A change of language, at once (no restart): the new language is set and the app's root draws every
// screen again from the start (src/app/_layout.tsx) - its words, the direction of its lines and rows,
// its arrows - nothing left over from the other one. The screens open stay open (the settings, over
// the home screen), now in the new language.
import { setLanguage } from '@/i18n/i18n';

export function changeLanguage(lang: 'ar' | 'en' | 'fr') {
  setLanguage(lang);
}
