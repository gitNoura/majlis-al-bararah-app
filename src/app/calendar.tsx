// CALENDAR (التقويم), in Home's look (the flat page, the large heading, glass cards): a month at a time, in the Hijri calendar or the Gregorian, each day with the other date small
// under it; today lit; the occasions and the fasts marked; and what is coming. The data is src/lib/hijri.js (Umm al-Qura
// where the phone has it, the country's own start of the months, the ±1 day the reader sets in the Settings).
'use no memo'; // reads the Hijri settings (a module) when it draws, which the React Compiler cannot see change
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { Glass } from '@/components/home/Glass';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HifHeader } from '@/components/hifdh/HifHeader';
import { Txt } from '@/components/Txt';
import { DASH } from '@/i18n/dashboard';
import { isEnglish, L, LANG, t } from '@/i18n/i18n';
import * as hijri from '@/lib/hijri';
import { useSkin } from '@/theme/homeSkin';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Kind = 'hijri' | 'gregorian';
const num = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

type Cell = { date: Date; big: number; small: number; h: { y: number; m: number; d: number } };

// the days of the shown month, as cells (the big number is the shown calendar's, the small one the other's)
function monthCells(kind: Kind, y: number, m: number): Cell[] {
  if (kind === 'hijri') {
    return (hijri.monthDays(y, m) as Date[]).map((date, i) => ({ date, big: i + 1, small: date.getDate(), h: { y, m, d: i + 1 } }));
  }
  const n = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(y, m, i + 1, 12);
    const h = hijri.hijri(date);
    return { date, big: i + 1, small: h.d, h };
  });
}

export default function CalendarScreen() {
  const { isDark } = useTheme();
  const k = useSkin();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const todayH = hijri.hijri(hijri.noon(now));
  const [kind, setKind] = useState<Kind>('hijri');
  const [at, setAt] = useState({ y: todayH.y, m: todayH.m }); // Hijri: month 1-12; Gregorian: month 0-11
  const [selected, setSelected] = useState<Cell | null>(null);

  const switchKind = (k: Kind) => {
    setKind(k);
    setSelected(null);
    setAt(k === 'hijri' ? { y: todayH.y, m: todayH.m } : { y: now.getFullYear(), m: now.getMonth() });
  };
  const step = (dir: 1 | -1) => {
    setSelected(null);
    setAt(({ y, m }) => {
      const first = kind === 'hijri' ? 1 : 0;
      const last = kind === 'hijri' ? 12 : 11;
      const nm = m + dir;
      return nm > last ? { y: y + 1, m: first } : nm < first ? { y: y - 1, m: last } : { y, m: nm };
    });
  };
  const backToToday = () => switchKind(kind);

  const cells = monthCells(kind, at.y, at.m);
  const lead = cells.length ? cells[0].date.getDay() : 0; // Sunday first
  const rows: (Cell | null)[][] = [];
  const padded: (Cell | null)[] = [...Array<null>(lead).fill(null), ...cells];
  while (padded.length % 7) padded.push(null);
  for (let i = 0; i < padded.length; i += 7) rows.push(padded.slice(i, i + 7));

  const title = kind === 'hijri' ? `${hijri.monthName(at.m)} ${num(at.y)}` : new Date(at.y, at.m, 1).toLocaleDateString(LANG, { month: 'long', year: 'numeric' });
  // the other calendar's months over this one (e.g. «Oct – Nov 2026»)
  const other = (() => {
    if (!cells.length) return '';
    const a = cells[0].date;
    const b = cells[cells.length - 1].date;
    if (kind === 'hijri') {
      const fa = a.toLocaleDateString(LANG, { month: 'short' });
      const fb = b.toLocaleDateString(LANG, { month: 'short', year: 'numeric' });
      return fa === b.toLocaleDateString(LANG, { month: 'short' }) ? fb : `${fa} – ${fb}`;
    }
    const ha = hijri.hijri(a);
    const hb = hijri.hijri(b);
    return ha.m === hb.m ? `${hijri.monthName(ha.m)} ${num(ha.y)}` : `${hijri.monthName(ha.m)} – ${hijri.monthName(hb.m)} ${num(hb.y)}`;
  })();

  const days = DASH.weekdays() as unknown as string[];
  type Event = { key: string; h: { y: number; m: number; d: number }; date: Date; days: number };
  type Fast = { date: Date; fast: { key: string }; days: number };
  const events = (hijri.upcoming() as Event[]).slice(0, 4);
  const fasts = (hijri.upcomingFasts(45) as Fast[]).slice(0, 4);
  const shownDay = selected
    ? [`${num(selected.h.d)} ${hijri.monthName(selected.h.m)} ${num(selected.h.y)}`, selected.date.toLocaleDateString(LANG, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })]
    : null;
  const shownNote = selected
    ? [hijri.occasionOn(selected.h) ? t(hijri.occasionOn(selected.h) as string) : '', (() => { const f = hijri.fastOn(selected.h, selected.date); return f ? t(f.key) : ''; })()].filter(Boolean)
    : [];

  const when = (d: Date, n: number) => (n === 0 ? t('calIsToday') : t('calInDays', n)) + ` · ${d.toLocaleDateString(LANG, { day: 'numeric', month: 'short' })}`;

  const todayInk = isDark ? '#1d1d1d' : '#ffffff'; // the words on today's forest (parchment by night) square
  const kinds: { value: Kind; label: string }[] = [
    { value: 'hijri', label: t('calHijri') },
    { value: 'gregorian', label: t('calGregorian') },
  ];

  // a list inside a glass card: a row's title and the line under it, a hairline between rows
  const list = (items: { key: string; title: string; sub: string }[]) => (
    <Glass gradient style={{ paddingHorizontal: space.md, paddingVertical: space.xs }}>
      {items.map((it, i) => (
        <View key={it.key} style={[{ paddingVertical: 13, gap: 2 }, i < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: k.hairline }]}>
          <Txt size={16} weight={700} color={k.ink}>
            {it.title}
          </Txt>
          <Txt size={13.5} color={k.meta}>
            {it.sub}
          </Txt>
        </View>
      ))}
    </Glass>
  );

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <HomeBackdrop />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <HifHeader title={DASH.calendar()} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: insets.bottom + 28, gap: space.md }}>
        {/* Hijri / Gregorian: a track, the chosen one raised (as on the Plans page) */}
        <View style={[styles.tabs, { backgroundColor: k.well }]} accessibilityRole="tablist">
          {kinds.map((o) => (
            <Pressable key={o.value} onPress={() => switchKind(o.value)} accessibilityRole="tab" accessibilityState={{ selected: kind === o.value }} style={[styles.tab, kind === o.value && { backgroundColor: k.glass, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.14)' }]}>
              <Txt size={14.5} weight={kind === o.value ? 700 : 500} center color={kind === o.value ? k.ink : k.meta} numberOfLines={1}>
                {o.label}
              </Txt>
            </Pressable>
          ))}
        </View>

        <Glass gradient style={{ padding: space.md, gap: 14 }}>
          {/* the month, with arrows */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => step(-1)} hitSlop={10} accessibilityLabel={t('calPrev')} style={[styles.arrow, { backgroundColor: k.well }]}>
              <BackIcon color={k.ink} size={18} rtl={isEnglish} />
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Txt size={20} weight={800} lineHeight={28} color={k.ink} center>
                {title}
              </Txt>
              <Txt size={12.5} color={k.meta} center>
                {other}
              </Txt>
            </View>
            <Pressable onPress={() => step(1)} hitSlop={10} accessibilityLabel={t('calNext')} style={[styles.arrow, { backgroundColor: k.well, transform: [{ scaleX: -1 }] }]}>
              <BackIcon color={k.ink} size={18} rtl={isEnglish} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {days.map((d) => (
              <Txt key={d} size={12} weight={700} color={k.meta} center style={{ flex: 1 }}>
                {d}
              </Txt>
            ))}
          </View>
          <View style={{ gap: 4 }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 4 }}>
                {row.map((cell, j) => {
                  if (!cell) return <View key={j} style={{ flex: 1, aspectRatio: 1 }} />;
                  const isToday = sameDay(cell.date, now);
                  const isSel = !!selected && sameDay(cell.date, selected.date);
                  const occasion = !!hijri.occasionOn(cell.h);
                  const fast = hijri.fastOn(cell.h, cell.date);
                  const mark = occasion ? k.accent : fast ? (fast.fard ? k.accent : k.meta) : null;
                  return (
                    <Pressable
                      key={j}
                      onPress={() => setSelected(isSel ? null : cell)}
                      accessibilityLabel={`${cell.big}`}
                      style={[
                        { flex: 1, aspectRatio: 1, borderRadius: 13, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
                        isToday && { backgroundColor: k.fill },
                        !isToday && isSel && { backgroundColor: k.well, borderWidth: 1.5, borderColor: k.fill },
                      ]}
                    >
                      <Txt size={16} weight={isToday ? 800 : 600} color={isToday ? todayInk : k.ink} center>
                        {num(cell.big)}
                      </Txt>
                      <Txt size={9.5} color={isToday ? todayInk : k.meta} center style={{ opacity: 0.85 }}>
                        {num(cell.small)}
                      </Txt>
                      {!!mark && <View style={{ position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: isToday ? todayInk : mark }} />}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* the key, and back to today */}
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            {[
              [k.accent, `${t('calLegendOccasion')} · ${t('calLegendRamadan')}`],
              [k.meta, t('calLegendSunnah')],
            ].map(([col, label]) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col }} />
                <Txt size={12} color={k.meta}>
                  {label}
                </Txt>
              </View>
            ))}
          </View>
          <Pressable onPress={backToToday} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
            <Txt size={13.5} weight={700} color={k.accent}>
              {t('calBackToday')}
            </Txt>
          </Pressable>
        </Glass>

        {shownDay && (
          <Glass gradient style={{ padding: space.md, gap: 4 }}>
            <Txt size={17} weight={800} color={k.ink}>
              {shownDay[0]}
            </Txt>
            <Txt size={13.5} color={k.meta}>
              {shownDay[1]}
            </Txt>
            {shownNote.map((n) => (
              <Txt key={n} size={14} weight={600} color={k.ink}>
                {n}
              </Txt>
            ))}
          </Glass>
        )}

        <View style={{ gap: space.sm }}>
          <Txt size={15} weight={700} color={k.ink} style={{ paddingHorizontal: space.xs }}>
            {t('calEvents')}
          </Txt>
          {list(events.map((e) => ({ key: e.key, title: t(e.key), sub: `${when(e.date, e.days)} · ${num(e.h.d)} ${hijri.monthName(e.h.m)}` })))}
        </View>

        {fasts.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Txt size={15} weight={700} color={k.ink} style={{ paddingHorizontal: space.xs }}>
              {t('calFasting')}
            </Txt>
            {list(fasts.map((f) => ({ key: `${f.fast.key}${f.days}`, title: t(f.fast.key), sub: when(f.date, f.days) })))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderRadius: 16, borderCurve: 'continuous', padding: 3 },
  tab: { flex: 1, minHeight: 38, borderRadius: 13, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  arrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
