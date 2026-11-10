// A calendar to pick a date (no date-picker package, so no new native module): the month as a grid, Monday first, with
// arrows for the month; a tap on the month's name opens the months of the year, with arrows for the year. Dates are
// «YYYY-MM-DD» strings; days before `min` cannot be picked.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish, LOCALE } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import { WEEK_ORDER, fmtDate, monthName, num, weekdayName } from '@/lib/hifdh/labels';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m from 0

export function DateCalendar({ value, min, onChange, label }: { value: string; min: string; onChange: (day: string) => void; label: string }) {
  const { c } = useTheme();
  const h = useHome();
  const [shown, setShown] = useState(() => {
    const d = core.parseDay(value);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [months, setMonths] = useState(false); // the months of the year instead of the days
  const [minY, minM] = (() => {
    const d = core.parseDay(min);
    return [d.getFullYear(), d.getMonth()];
  })();
  const today: string = core.dayOf(new Date());

  const before = (y: number, m: number) => y < minY || (y === minY && m < minM); // a month wholly before `min`
  const goMonth = (n: number) => {
    const d = new Date(shown.y, shown.m + n, 1);
    if (!before(d.getFullYear(), d.getMonth())) setShown({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goYear = (n: number) => {
    const y = shown.y + n;
    if (y < minY) return;
    setShown({ y, m: y === minY ? Math.max(shown.m, minM) : shown.m });
  };

  // the weeks of the shown month, Monday first; null fills the days of the neighbouring months
  const first = new Date(shown.y, shown.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const length = new Date(shown.y, shown.m + 1, 0).getDate();
  const cells: (number | null)[] = [...new Array<null>(lead).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const title = new Date(shown.y, shown.m, 1).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
  // «previous» points to where the reader came from (right in Arabic, left in English / French), «next» the other way
  const arrow = (dir: -1 | 1, step: () => void, off: boolean, name: string) => (
    <Pressable onPress={step} disabled={off} hitSlop={6} accessibilityRole="button" accessibilityLabel={name} style={[styles.arrow, { backgroundColor: h.tile, opacity: off ? 0.35 : 1 }]}>
      <BackIcon color={h.tileInk} size={20} rtl={dir === -1 ? !isEnglish : isEnglish} />
    </Pressable>
  );

  return (
    <View style={styles.wrap} accessible={false} accessibilityLabel={`${label}: ${fmtDate(value)}`}>
      <Txt size={22} weight={800} center color={c.ink}>
        {fmtDate(value)}
      </Txt>

      <View style={styles.head}>
        {arrow(-1, () => (months ? goYear(-1) : goMonth(-1)), months ? shown.y <= minY : before(new Date(shown.y, shown.m - 1, 1).getFullYear(), new Date(shown.y, shown.m - 1, 1).getMonth()), '−')}
        <Pressable onPress={() => setMonths((v) => !v)} accessibilityRole="button" style={styles.title}>
          <Txt size={17} weight={700} center color={c.ink}>
            {months ? num(shown.y).replace(/[,٬\s]/g, '') : title}
          </Txt>
        </Pressable>
        {arrow(1, () => (months ? goYear(1) : goMonth(1)), false, '+')}
      </View>

      {months ? (
        <View style={styles.months}>
          {Array.from({ length: 12 }, (_, m) => {
            const off = before(shown.y, m);
            const on = shown.m === m;
            return (
              <Pressable
                key={m}
                disabled={off}
                onPress={() => (setShown({ y: shown.y, m }), setMonths(false))}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: off }}
                style={[styles.month, { backgroundColor: on ? h.forest : h.tile, opacity: off ? 0.35 : 1 }]}
              >
                <Txt size={15} weight={on ? 700 : 600} color={on ? h.forestInk : h.tileInk}>
                  {monthName(m)}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ gap: 4 }}>
          <View style={styles.week}>
            {WEEK_ORDER.map((d: number) => (
              <View key={d} style={styles.cell}>
                <Txt size={12} weight={600} center color={c.meta} numberOfLines={1}>
                  {weekdayName(d, 'short')}
                </Txt>
              </View>
            ))}
          </View>
          {weeks.map((w, k) => (
            <View key={k} style={styles.week}>
              {w.map((d, i) => {
                if (d == null) return <View key={i} style={styles.cell} />;
                const key = dayKey(shown.y, shown.m, d);
                const off = key < min;
                const on = key === value;
                return (
                  <View key={i} style={styles.cell}>
                    <Pressable
                      disabled={off}
                      onPress={() => onChange(key)}
                      accessibilityRole="button"
                      accessibilityLabel={fmtDate(key)}
                      accessibilityState={{ selected: on, disabled: off }}
                      style={[styles.day, on ? { backgroundColor: h.forest } : key === today ? { borderWidth: 1.5, borderColor: h.forest } : null, off && { opacity: 0.3 }]}
                    >
                      <Txt size={15.5} weight={on ? 800 : 600} center color={on ? h.forestInk : c.ink}>
                        {num(d)}
                      </Txt>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row' },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: '86%', aspectRatio: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  months: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  month: { width: '31.5%', minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
