// The Quran page's header: a row of buttons, and under it the name of what is being read.
//   row    at the start the index (the fahras), the search and the full screen; at the end - where the wird button was -
//          the notes and the drop-down of the page's modes (Read, Listen, Recite)
//   name   the surah(s) and the juz, just above the page (the page's own number is printed on the page)
// No art; the colours and spacing come from the tokens.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ExpandIcon, MenuIcon, NotebookIcon, SearchIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { surahName, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { surahsOn } from '@/lib/boxes';
import { juzForPage, SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export const HEADER_ROW_H = 44;
// where a menu hanging from the header's buttons starts, from the top of the screen
export const menuTop = (insetTop: number) => insetTop + space.sm + HEADER_ROW_H + 4;

// where a page is: its surah(s) and, under them, its juz
export function placeOf(page: number) {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => surahName(SURAHS[n - 1]));
  const surahs = names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – ');
  return { surahs, extra: t('juz', juzForPage(page).number) };
}

function ChevronDown({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

type Props = {
  page: number;
  mode: string; // the name of the mode shown (Read)
  onIndex: () => void;
  onSearch: () => void;
  onFull: () => void;
  onNotes: () => void;
  onMode: () => void;
};

// one of the round buttons at the start of the row
function Tool({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4} style={[styles.round, { backgroundColor: c.surface2 }]}>
      {children}
    </Pressable>
  );
}

export function QuranHeader({ page, mode, onIndex, onSearch, onFull, onNotes, onMode }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const here = placeOf(page);
  return (
    <View style={[styles.box, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.row}>
        <View style={styles.group}>
          <Tool label={QURAN.index()} onPress={onIndex}>
            <MenuIcon color={c.ink} size={20} />
          </Tool>
          <Tool label={QURAN.search()} onPress={onSearch}>
            <SearchIcon color={c.ink} size={20} />
          </Tool>
          <Tool label={READER.fullscreen()} onPress={onFull}>
            <ExpandIcon color={c.ink} size={20} />
          </Tool>
        </View>
        <View style={styles.group}>
          <Tool label={QURAN.notes()} onPress={onNotes}>
            <NotebookIcon color={c.ink} size={20} />
          </Tool>
          <Pressable onPress={onMode} accessibilityRole="button" accessibilityLabel={mode} hitSlop={6} style={[styles.pill, { backgroundColor: c.surface2 }]}>
            <Txt size={14} weight={700} color={c.ink} numberOfLines={1}>
              {mode}
            </Txt>
            <ChevronDown color={c.ink} />
          </Pressable>
        </View>
      </View>
      <View style={styles.name}>
        <Txt size={19} weight={700} center color={c.ink} numberOfLines={1}>
          {here.surahs}
        </Txt>
        <Txt size={13} center color={c.meta} numberOfLines={1}>
          {here.extra}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, paddingBottom: space.sm, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: HEADER_ROW_H },
  group: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { minWidth: 40, height: 40, borderRadius: 20, paddingHorizontal: space.md - 2, flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { alignItems: 'center', paddingVertical: space.xs },
});
