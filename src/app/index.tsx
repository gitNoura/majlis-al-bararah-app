// The home screen (the website's src/home/home.html and home.js, rebuilt for the phone): the arch
// with its two lanterns, the greeting and the Hijri date, the next prayer and the time left, today's
// wird, the Quran's sections two by two, the tools, and the floating panel with the settings.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookIcon, ClockIcon, FlameIcon, SettingsIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { isEnglish, LANG, surahName, t } from '@/i18n/i18n';
import { streak } from '@/lib/activity';
import { displayKeys } from '@/lib/ayahmap';
import * as hijri from '@/lib/hijri';
import { clockTime, nextPrayer, place } from '@/lib/prayer';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { readJSON } from '@/lib/storage';
import { useTheme } from '@/theme/theme';

const IMG = {
  archLight: require('@/assets/images/home/za-arch-light.svg'),
  archDark: require('@/assets/images/home/za-arch-dark.svg'),
  lanternLight: require('@/assets/images/home/za-lantern.svg'),
  lanternDark: require('@/assets/images/home/za-lantern-dark.svg'),
  star: require('@/assets/images/home/card-star.svg'),
  read: require('@/assets/images/home/icon-read.svg'),
  memorize: require('@/assets/images/home/icon-memorize.svg'),
  test: require('@/assets/images/home/icon-test.svg'),
  majalis: require('@/assets/images/home/icon-majalis.svg'),
  adhkar: require('@/assets/images/home/icon-adhkar.svg'),
  ahadith: require('@/assets/images/home/icon-ahadith.svg'),
  qibla: require('@/assets/images/home/icon-qibla.svg'),
  calendar: require('@/assets/images/home/icon-calendar.svg'),
};

// the home screen's own colours (the website's home.css), by day and by night
type Colours = readonly [string, string, ...string[]];
type HomeColours = {
  bg: Colours;
  text: string;
  name: string;
  feat: Colours;
  featEdge: string;
  gold: string;
  wirdGold: string;
  wg: string;
  cardBg: string;
  cardEdge: string;
  cardName: string;
  cardGold: string;
  cardShadow: string;
};
const HC: { light: HomeColours; dark: HomeColours } = {
  light: {
    bg: ['#f1e4cd', '#f0e3cb', '#f6ebd8'],
    text: '#052a20',
    name: '#8a6a22',
    feat: ['#1d4d3d', '#0f3d2f'],
    featEdge: '#d4af55',
    gold: '#f3d77e',
    wirdGold: '#f0d27a',
    wg: '#b8913a',
    cardBg: '#fffdf5',
    cardEdge: '#cfa84a',
    cardName: '#031f17',
    cardGold: '#b8913a',
    cardShadow: 'rgba(120, 90, 20, 0.18)',
  },
  dark: {
    bg: ['#222523', '#1b1e1c', '#1b1e1c'],
    text: '#ffe9a8',
    name: '#e2b44c',
    feat: ['#2d4639', '#2d4639'],
    featEdge: 'rgba(196, 154, 69, 0.42)',
    gold: '#f3d77e',
    wirdGold: '#e8c566',
    wg: '#e4c978',
    cardBg: '#343a35',
    cardEdge: '#7a6638',
    cardName: '#f3ead2',
    cardGold: '#e4c978',
    cardShadow: 'rgba(0, 0, 0, 0.32)',
  },
};

// ---------- the date, the next prayer, today's wird ----------

function hijriDate() {
  try {
    const now = new Date();
    const h = hijri.hijri(hijri.noon(now));
    let day = now.toLocaleDateString(LANG, { weekday: 'long' });
    if (LANG === 'fr') day = day[0].toUpperCase() + day.slice(1);
    const month = hijri.monthName(h.m);
    return LANG === 'ar' ? `${day}، ${h.d} ${month} ${h.y} هـ` : LANG === 'fr' ? `${day} ${h.d} ${month} ${h.y} H` : `${day}, ${h.d} ${month} ${h.y} AH`;
  } catch {
    return '';
  }
}

type Prayer = { name: string; at: string; left: number } | null;

function prayerNow(): Prayer {
  const next = place() ? nextPrayer() : null;
  if (!next) return null;
  return { name: t(`pr_${next.key}`), at: clockTime(next.at), left: Math.max(0, Math.floor((next.at - Date.now()) / 1000)) };
}

function wirdNow() {
  const w = readJSON('wird');
  const stop = w?.stop;
  const shown = stop?.key ? displayKeys(String(stop.key))[0] : null; // numbered as in this narration
  const [sn, an] = shown ? shown.split(':').map(Number) : [];
  const page = stop?.page ?? 0;
  const pct = page ? Math.min(100, Math.round((page / TOTAL_PAGES) * 100)) : 0;
  return {
    main: sn ? HOME.surah(surahName(SURAHS[sn - 1])) : HOME.wirdBegin(),
    sub: sn ? HOME.ayahPage(an, page) : '',
    pct,
  };
}

// ---------- the screen ----------

export default function Home() {
  const { c, isDark, mode, setMode } = useTheme();
  const hc = isDark ? HC.dark : HC.light;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [date, setDate] = useState(hijriDate);
  const [prayer, setPrayer] = useState<Prayer>(prayerNow);
  const [wird, setWird] = useState(wirdNow);
  const [days, setDays] = useState(() => streak());

  // back on the home screen: everything as it is now (the wird read, a place chosen...)
  useFocusEffect(
    useCallback(() => {
      setDate(hijriDate());
      setWird(wirdNow());
      setDays(streak());
      setPrayer(prayerNow());
    }, []),
  );
  // the time left to the next prayer, every second
  useEffect(() => {
    const timer = setInterval(() => setPrayer(prayerNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  const go = (href: Href) => () => router.push(href);
  const archW = Math.min(620, width - 8);
  const lanternW = 38;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={hc.bg} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        {/* the band at the top: the arch and the two lanterns */}
        <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0, height: 300 }} pointerEvents="none">
          {!isDark && <LinearGradient colors={['#c7d7bb', 'rgba(199,215,187,0)']} style={{ height: 24 }} />}
          <Image
            source={isDark ? IMG.archDark : IMG.archLight}
            style={{ position: 'absolute', top: 0, left: (width - archW) / 2, width: archW, height: 300, opacity: isDark ? 0.3 : 1 }}
            contentFit="fill"
          />
          <Image source={isDark ? IMG.lanternDark : IMG.lanternLight} style={[styles.lantern, { left: 4, width: lanternW }]} contentFit="contain" />
          <Image source={isDark ? IMG.lanternDark : IMG.lanternLight} style={[styles.lantern, { right: 4, width: lanternW }]} contentFit="contain" />
        </View>

        <View style={styles.inner}>
          {/* the greeting and the Hijri date, under the arch */}
          <View style={styles.head}>
            <Txt size={19} weight={700} center color={hc.text}>
              {HOME.salam()}
              {LANG === 'ar' ? '، ' : ', '}
              <Txt size={19} weight={700} color={hc.name}>
                {HOME.guest()}
              </Txt>
            </Txt>
            <Txt size={12.5} weight={500} center color={hc.text} style={{ opacity: 0.8, marginTop: 2 }}>
              {date}
            </Txt>
          </View>

          {/* the next prayer, and the time left */}
          <Pressable onPress={go('/calendar')} style={({ pressed }) => [pressed && styles.pressed]}>
            <LinearGradient colors={isDark ? hc.feat : ['#17493a', '#0f3d2f']} style={[styles.strip, { borderColor: hc.featEdge }]}>
              <View style={styles.stripIcon}>
                <ClockIcon color={hc.gold} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={12} weight={600} color="#f6f1e0">
                  {HOME.nextPrayer()}
                </Txt>
                <View style={styles.row}>
                  <Txt size={17} weight={800} color={hc.gold}>
                    {prayer ? prayer.name : HOME.setPlace()}
                  </Txt>
                  {prayer && (
                    <Txt size={17} weight={800} color={hc.gold}>
                      {prayer.at}
                    </Txt>
                  )}
                </View>
              </View>
              {prayer && <Countdown seconds={prayer.left} color={isDark ? '#ffe9a8' : hc.gold} />}
            </LinearGradient>
          </Pressable>

          {/* today's wird */}
          <Pressable onPress={go('/quran')} style={({ pressed }) => [pressed && styles.pressed]}>
            <LinearGradient colors={hc.feat} style={[styles.feature, { borderColor: hc.featEdge }]}>
              <View style={styles.row}>
                <BookIcon color={hc.wirdGold} />
                <Txt size={13.5} weight={700} color={hc.wirdGold}>
                  {HOME.wirdLabel()}
                </Txt>
                {days > 0 && (
                  <View style={[styles.streak, { marginStart: 'auto' }]}>
                    <FlameIcon color="#e8903a" />
                    <Txt size={12} weight={700} color={hc.wirdGold}>
                      {HOME.days(days)}
                    </Txt>
                  </View>
                )}
              </View>
              <View style={[styles.row, { justifyContent: 'space-between', gap: 10 }]}>
                <View style={{ flexShrink: 1, gap: 2 }}>
                  <Txt size={18} weight={700} color="#fff6d8">
                    {wird.main}
                  </Txt>
                  {!!wird.sub && (
                    <Txt size={13} weight={500} color="#f4ecd2">
                      {wird.sub}
                    </Txt>
                  )}
                </View>
                <View style={[styles.go, { backgroundColor: hc.wg }]}>
                  <Txt size={14} weight={700} color="#0f3d2f">
                    {HOME.wirdGo()} {LANG === 'ar' ? '←' : '→'}
                  </Txt>
                </View>
              </View>
              <View style={[styles.row, { gap: 10 }]}>
                <View style={styles.bar}>
                  <View style={{ width: `${wird.pct}%`, height: '100%', borderRadius: 4, backgroundColor: hc.wg }} />
                </View>
                <Txt size={12.5} weight={700} color={hc.wirdGold}>
                  {HOME.khatma(wird.pct)}
                </Txt>
              </View>
              <View style={styles.hadith}>
                <Txt size={12.5} weight={500} center color="#f4ecd2" lineHeight={21}>
                  <Txt size={12.5} weight={700} color={hc.wirdGold}>
                    {HOME.hadithIntro()}{' '}
                  </Txt>
                  {HOME.hadith()}
                </Txt>
              </View>
            </LinearGradient>
          </Pressable>

          {/* the Quran's sections, two by two (in Arabic the Quran on the right) */}
          <View style={{ gap: 10 }}>
            <Txt size={14} weight={700} color={hc.text} style={{ marginHorizontal: 4 }}>
              {HOME.secQuran()}
            </Txt>
            <View style={styles.grid}>
              <Card hc={hc} icon={IMG.read} title={HOME.read()} sub={HOME.readSub()} onPress={go('/quran')} />
              <Card hc={hc} icon={IMG.memorize} title={HOME.memorize()} sub={HOME.memorizeSub()} soon />
            </View>
            <View style={styles.grid}>
              <Card hc={hc} icon={IMG.test} title={HOME.test()} sub={HOME.testSub()} soon />
              <Card hc={hc} icon={IMG.majalis} title={HOME.majalis()} sub={HOME.majalisSub()} soon />
            </View>
          </View>

          {/* the tools */}
          <View style={{ gap: 10 }}>
            <Txt size={14} weight={700} color={hc.text} style={{ marginHorizontal: 4 }}>
              {HOME.secTools()}
            </Txt>
            <View style={styles.grid}>
              <Tool hc={hc} icon={IMG.adhkar} label={HOME.adhkar()} onPress={go('/adhkar')} />
              <Tool hc={hc} icon={IMG.ahadith} label={HOME.ahadith()} onPress={go('/ahadith')} />
              <Tool hc={hc} icon={IMG.qibla} label={HOME.qibla()} onPress={go('/qibla')} />
              <Tool hc={hc} icon={IMG.calendar} label={HOME.calendar()} onPress={go('/calendar')} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* the floating panel: the settings (and, for now, day / night at a touch) */}
      <View style={[styles.panel, ltr(), { bottom: insets.bottom + 12, backgroundColor: c.glass, borderColor: c.line }]}>
        <Pressable onPress={go('/settings')} style={styles.panelBtn}>
          <SettingsIcon color={c.ink} />
          <Txt size={13} weight={700} color={c.ink}>
            {HOME.settings()}
          </Txt>
        </Pressable>
        <Pressable onPress={() => setMode(isDark ? 'light' : 'dark')} style={styles.panelBtn} hitSlop={8}>
          <Txt size={18} color={c.ink}>
            {isDark ? '☀' : '☾'}
          </Txt>
          <Txt size={11} weight={500} color={c.meta}>
            {mode === 'auto' ? 'auto' : ''}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

// ---------- the parts ----------

// a row kept left to right in every language (the phones' «direction»; in the browser preview, whose
// page is right to left in Arabic, the row turned round)
const ltr = () =>
  Platform.OS === 'web' ? ({ flexDirection: isEnglish ? 'row' : 'row-reverse' } as const) : ({ direction: 'ltr' } as const);

function Countdown({ seconds, color }: { seconds: number; color: string }) {
  const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, '0'));
  const units = HOME.units();
  // always left to right: hours, minutes, seconds
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: 2 }, ltr()]}>
      {/* (left to right in Arabic too) */}
      {parts.map((p, i) => (
        <View key={i} style={[{ flexDirection: 'row' }, ltr()]}>
          {i > 0 && (
            <Txt size={15} weight={700} color={color} style={{ opacity: 0.6 }}>
              :
            </Txt>
          )}
          <View style={{ alignItems: 'center', minWidth: 28 }}>
            <Txt size={17} weight={800} color={color} lineHeight={20}>
              {p}
            </Txt>
            <Txt size={9} weight={600} color="#f6f1e0" style={{ opacity: 0.8 }}>
              {units[i]}
            </Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

function Card({ hc, icon, title, sub, soon, onPress }: { hc: HomeColours; icon: number; title: string; sub: string; soon?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={soon ? undefined : onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: hc.cardBg, borderColor: hc.cardEdge, shadowColor: hc.cardShadow }, pressed && !soon && styles.pressed]}
    >
      <View style={[styles.art, soon && { opacity: 0.6 }]}>
        <Image source={IMG.star} style={StyleSheet.absoluteFill} tintColor={hc === HC.dark ? hc.cardGold : undefined} />
        <Image source={icon} style={{ width: 20, height: 20 }} tintColor={hc === HC.dark ? hc.cardGold : undefined} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={15} weight={800} color={hc.cardName} lineHeight={20} style={soon && { opacity: 0.6 }}>
          {title}
        </Txt>
        <Txt size={12} weight={500} color={hc.cardName} style={{ opacity: 0.72 }}>
          {sub}
        </Txt>
      </View>
      {soon && (
        <View style={[styles.soon, { borderColor: hc.cardEdge }]}>
          <Txt size={10} weight={600} color={hc.cardGold}>
            {HOME.soon()}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

function Tool({ hc, icon, label, onPress }: { hc: HomeColours; icon: number; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tool, { backgroundColor: hc.cardBg, borderColor: hc.cardEdge, shadowColor: hc.cardShadow }, pressed && styles.pressed]}
    >
      <Image source={icon} style={{ width: 30, height: 30 }} tintColor={hc.cardGold} />
      <Txt size={12.5} weight={700} center color={hc.cardName}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 18, paddingTop: 72, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  head: { alignItems: 'center', paddingHorizontal: 6 },
  lantern: { position: 'absolute', top: 0, aspectRatio: 80 / 150 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1.5, borderRadius: 18 },
  stripIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#d4af55', alignItems: 'center', justifyContent: 'center' },
  feature: { gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1.5, borderRadius: 20 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(243, 215, 126, 0.35)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  go: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 14 },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.16)' },
  hadith: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(243, 215, 126, 0.28)',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  grid: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 96,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  art: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  soon: { position: 'absolute', top: 8, start: 10, paddingHorizontal: 7, paddingVertical: 1, borderWidth: 1, borderRadius: 999 },
  tool: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 82,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  panel: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
  },
  panelBtn: { alignItems: 'center', gap: 2, minWidth: 56 },
});
