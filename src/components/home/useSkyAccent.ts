// The colour of the progress marks (the ring, the reading bar). By day it is the deep forest green of the «Complete» button on the Hifdh
// page (goBg), which sits well under every sky of the prayer card (its own words are forest too). At night (dark mode) it is the
// parchment yellow of the Quran's night pages. Each comes with a soft glow of the same colour.
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';

export function useSkyAccent(): { color: string; glow: string } {
  const k = useSkin();
  const { isDark } = useTheme();
  if (isDark) return { color: k.vivid, glow: k.halo };
  return { color: k.goBg, glow: 'rgba(9, 74, 61, 0.5)' };
}
