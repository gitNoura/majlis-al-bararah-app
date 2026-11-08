// The reader's marks, one list per button of Read's bottom bar: the pages with a bookmark (and, first, where the reader
// stopped), the highlighted ayat, or the ayat with a comment. A tap on a row goes to its page. The ayat and pages are
// listed in mushaf order.
'use no memo'; // reads saved marks (modules) when it draws, which the React Compiler cannot see change
import { Pressable, StyleSheet, View } from 'react-native';

import { CloseIcon } from '@/components/icons';
import { FlagIcon } from '@/components/quran/MenuIcons';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { Sheet } from '@/components/ui';
import { L, surahTitle, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { highlightList, hlColor, noteColor, noteList, pageMarkList, togglePageMark, useMarks, type Listed } from '@/lib/marks';
import { SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export type Tab = 'pages' | 'highlights' | 'comments';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));
const ayahTitle = (s: number, a: number) => t('ayahTitle', surahTitle(SURAHS[s - 1]).replace(/^سورة /, ''), a);

function Item({ lead, title, sub, lines = 1, onPress, end }: { lead: React.ReactNode; title: string; sub?: string; lines?: number; onPress: () => void; end?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.item, { backgroundColor: c.surface2 }, pressed && { opacity: 0.7 }]}>
      <View style={styles.lead}>{lead}</View>
      <View style={styles.text}>
        <Txt size={15.5} weight={700} color={c.ink} numberOfLines={1}>
          {title}
        </Txt>
        {!!sub && (
          <Txt size={13.5} color={c.meta} numberOfLines={lines}>
            {sub}
          </Txt>
        )}
      </View>
      {end}
    </Pressable>
  );
}

export function MarksSheet({ open, tab, onClose, onGo, pin }: { open: boolean; tab: Tab; onClose: () => void; onGo: (page: number) => void; pin: { page: number; shown: string } | null }) {
  const { c } = useTheme();
  useMarks(); // draws again when a mark changes

  const go = (page: number | null) => page != null && onGo(page);
  const dot = (color: string) => <View style={[styles.dot, { backgroundColor: color }]} />;
  const ayat = (list: Listed[], colorOf: (id: string) => string, lines: number) =>
    list.map((x) => <Item key={`${x.s}:${x.a}`} lead={dot(colorOf(x.color))} title={ayahTitle(x.s, x.a)} sub={x.text} lines={lines} onPress={() => go(x.page)} />);
  const empty = (text: string) => (
    <Txt size={14} center color={c.meta} style={{ paddingVertical: space.lg }}>
      {text}
    </Txt>
  );

  const pages = pageMarkList();
  const [ps, pa] = (pin?.shown ?? '').split(':').map(Number);
  const highlights = highlightList();
  const comments = noteList();

  return (
    <Sheet open={open} onClose={onClose} title={{ pages: QURAN.marksPages(), highlights: QURAN.marksHighlights(), comments: QURAN.marksComments() }[tab]}>
      <View style={styles.list}>
        {tab === 'pages' && (
          <>
            {pin && ps > 0 && <Item lead={<FlagIcon color={c.accent} size={22} />} title={QURAN.stopRow()} sub={ayahTitle(ps, pa)} onPress={() => go(pin.page)} />}
            {pages.map((p) => (
              <Item
                key={p}
                lead={
                  <Txt size={14} weight={800} color={c.accent}>
                    {digits(p)}
                  </Txt>
                }
                title={placeOf(p).surahs}
                sub={placeOf(p).extra}
                onPress={() => go(p)}
                end={
                  <Pressable onPress={() => togglePageMark(p)} hitSlop={10} accessibilityRole="button" accessibilityLabel={QURAN.unmarkPage()} style={styles.remove}>
                    <CloseIcon color={c.meta} size={16} />
                  </Pressable>
                }
              />
            ))}
            {!pin && !pages.length && empty(QURAN.noPages())}
          </>
        )}
        {tab === 'highlights' && (highlights.length ? ayat(highlights, (id) => hlColor(id).dot, 1) : empty(QURAN.noHighlights()))}
        {tab === 'comments' && (comments.length ? ayat(comments, (id) => noteColor(id).dot, 2) : empty(QURAN.noComments()))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm, paddingTop: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: space.md - 2, borderRadius: 16 },
  lead: { width: 28, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  remove: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
