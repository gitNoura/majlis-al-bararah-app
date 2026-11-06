// The Quran page's header: the surah(s), the juz and the page (a tap opens the Find sheet), and under it a thin bar
// of the khatma's progress (a tap opens the khatma sheet). No art; the colours and spacing come from the tokens.
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { ProgressStrip } from '@/components/ui';
import { surahName, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { surahsOn } from '@/lib/boxes';
import { khatmaShare } from '@/lib/position';
import { juzForPage, SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

// where a page is: its surah(s) and, under them, its juz and page number
export function placeOf(page: number) {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => surahName(SURAHS[n - 1]));
  const surahs = names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – ');
  return { surahs, extra: `${t('juz', juzForPage(page).number)}  •  ${t('pageShort', page)}` };
}

type Props = { page: number; onFind: () => void; onKhatma: () => void };

export function QuranHeader({ page, onFind, onKhatma }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const here = placeOf(page);
  const share = khatmaShare(page);
  return (
    <View style={[styles.box, { paddingTop: insets.top + space.sm }]}>
      <Pressable onPress={onFind} accessibilityRole="button" accessibilityLabel={QURAN.find()} style={styles.where}>
        <Txt size={20} weight={700} center color={c.ink} numberOfLines={1}>
          {here.surahs}
        </Txt>
        <Txt size={13} center color={c.meta} numberOfLines={1}>
          {here.extra}
        </Txt>
      </Pressable>
      <Pressable onPress={onKhatma} hitSlop={{ top: 10, bottom: 10 }} accessibilityRole="button" accessibilityLabel={QURAN.khatmaProgress(Math.round(share * 100))}>
        <ProgressStrip value={share} height={4} label={QURAN.khatma()} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: space.md, gap: space.sm },
  where: { alignItems: 'center', paddingVertical: space.xs },
});
