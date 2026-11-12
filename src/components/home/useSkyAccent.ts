// The colour of the progress marks (the ring, the reading bar). By day it follows the prayer card: a deeper tone of the sky of the
// moment, so the marks change with every prayer and always sit well with the card above them. At night (dark mode) it is the
// parchment yellow of the Quran's night pages, with a soft glow of the same colour.
import { prayerView, skyByClock, type PrayerView } from '@/lib/dashboard';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

type Phase = NonNullable<PrayerView>['phase'];

// a richer tone of each sky's colours (SKIES in src/lib/dashboard.ts)
const BY_PHASE: Record<Phase, string> = {
  dawn: '#D9806C', // the rose of the dawn
  midday: '#3E93B8', // the clear blue
  afternoon: '#D8963F', // the warm amber
  sunset: '#D2694B', // the sunset's glow
  night: '#5B84A6', // the night's steel blue
};

export function useSkyAccent(): { color: string; glow: string } {
  const k = useSkin();
  const { isDark } = useTheme();
  if (isDark) return { color: k.vivid, glow: k.halo };
  const color = BY_PHASE[prayerView()?.phase ?? skyByClock()];
  return { color, glow: `${color}80` }; // the same colour at 50 %
}
