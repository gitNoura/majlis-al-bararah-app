// HOME, the tiles: a bento of three. A tall soft-green tile for the streak (the one tinted block of the page), and beside it
// two small paper tiles: the pages read today and the juz read so far.
'use no memo'; // reads saved state (the days, the marker) when it draws, which the React Compiler cannot see change
import { StyleSheet, View } from 'react-native';

import { FlameIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { L } from '@/i18n/i18n';
import { streak } from '@/lib/activity';
import { readingView } from '@/lib/dashboard';
import { useHome } from '@/theme/home';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

export function StatTiles() {
  const h = useHome();
  const days = streak() as number;
  const r = readingView();
  const small = (value: number, label: string, of?: number) => (
    <View style={[styles.small, { backgroundColor: h.card, borderColor: h.cardLine, boxShadow: `0px 6px 16px ${h.shadow}` }]}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Txt size={24} weight={800} lineHeight={28} color={h.ink}>
          {digits(value)}
        </Txt>
        {of != null && (
          <Txt size={13} weight={500} color={h.meta}>
            {`/ ${digits(of)}`}
          </Txt>
        )}
      </View>
      <Txt size={13} color={h.meta} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
  return (
    <View style={styles.row}>
      <View style={[styles.tall, { backgroundColor: h.tile }]}>
        <View style={[styles.flame, { backgroundColor: h.tileInk }]}>
          <FlameIcon size={18} color={h.tile} />
        </View>
        <View>
          <Txt size={40} weight={800} lineHeight={46} color={h.tileInk}>
            {digits(days)}
          </Txt>
          <Txt size={14} weight={700} color={h.tileInk} style={{ opacity: 0.75 }}>
            {DASH.daysLabel()}
          </Txt>
        </View>
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        {small(r.pagesToday, DASH.pagesLabel())}
        {small(r.juzFull, DASH.juzLabel(), 30)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  tall: { flex: 1, borderRadius: 24, padding: 14, justifyContent: 'space-between', minHeight: 118 },
  flame: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  small: { flex: 1, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center' },
});
