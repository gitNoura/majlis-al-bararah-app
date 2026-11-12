// The one surface of every round button and bar on the Quran page and of the main bottom bar: the paper card of Home's round
// buttons (the Quran header's back / index / search buttons), with its hairline and soft shadow. The tab bar, Read's bar,
// Listen's bar and Recite's bar all wear it, so they match the buttons at the top.
import { StyleSheet } from 'react-native';

import { useHome } from './home';

export function useBarLook(shadow = '0px 4px 12px') {
  const h = useHome();
  return {
    backgroundColor: h.card,
    borderColor: h.cardLine,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: `${shadow} ${h.shadow}`,
  } as const;
}
