// The Quran page's header. One row: at the start corner a button that opens the tools menu (Find, Notes, Display), in
// the middle the surah(s), the juz and the page (a tap opens the Find sheet), and at the end corner - where the wird
// button was - the drop-down of the page's modes (Read, Listen, Recite). Under it a thin bar of the khatma's progress
// (a tap opens the khatma sheet). No art; the colours and spacing come from the tokens.
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { MenuIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { ProgressStrip } from '@/components/ui';
import { surahName, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { surahsOn } from '@/lib/boxes';
import { khatmaShare } from '@/lib/position';
import { juzForPage, SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const HEADER_ROW_H = 44;
// where a menu hanging from the header's buttons starts, from the top of the screen
export const menuTop = (insetTop: number) => insetTop + space.sm + HEADER_ROW_H + 4;

// where a page is: its surah(s) and, under them, its juz and page number
export function placeOf(page: number) {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => surahName(SURAHS[n - 1]));
  const surahs = names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – ');
  return { surahs, extra: `${t('juz', juzForPage(page).number)}  •  ${t('pageShort', page)}` };
}

function ChevronDown({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

type Props = { page: number; mode: string; onFind: () => void; onKhatma: () => void; onMode: () => void; onTools: () => void };

export function QuranHeader({ page, mode, onFind, onKhatma, onMode, onTools }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const here = placeOf(page);
  const share = khatmaShare(page);
  return (
    <View style={[styles.box, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.row}>
        <Pressable onPress={onTools} accessibilityRole="button" accessibilityLabel={QURAN.tools()} hitSlop={6} style={[styles.round, { backgroundColor: c.surface2 }]}>
          <MenuIcon color={c.ink} size={20} />
        </Pressable>
        <Pressable onPress={onFind} accessibilityRole="button" accessibilityLabel={QURAN.find()} style={styles.where}>
          <Txt size={19} weight={700} center color={c.ink} numberOfLines={1}>
            {here.surahs}
          </Txt>
          <Txt size={13} center color={c.meta} numberOfLines={1}>
            {here.extra}
          </Txt>
        </Pressable>
        <Pressable onPress={onMode} accessibilityRole="button" accessibilityLabel={mode} hitSlop={6} style={[styles.pill, { backgroundColor: c.surface2 }]}>
          <Txt size={14} weight={700} color={c.ink} numberOfLines={1}>
            {mode}
          </Txt>
          <ChevronDown color={c.ink} />
        </Pressable>
      </View>
      <Pressable onPress={onKhatma} hitSlop={{ top: 10, bottom: 10 }} accessibilityRole="button" accessibilityLabel={QURAN.khatmaProgress(Math.round(share * 100))}>
        <ProgressStrip value={share} height={4} label={QURAN.khatma()} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingBottom: space.sm, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: HEADER_ROW_H },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { minWidth: 40, height: 40, borderRadius: 20, paddingHorizontal: space.md - 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  where: { flex: 1, alignItems: 'center' },
});
