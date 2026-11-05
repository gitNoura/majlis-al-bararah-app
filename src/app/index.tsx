// The home screen, in the Hifdh page's look (src/theme/theme.tsx HifTheme): a near-white screen (dark grey at night),
// white cards with a hairline, forest green as the one colour, one font. From the top: the greeting («السلام عليكم»
// and the member's name, the Hijri date under it) with the member's round in the corner; the prayers card - the next
// prayer with the time left, today's five (the next one lit in green) and the place they are for (a tap, or the «+»,
// asks: the phone's location or a city); the wird card - the hadith «read and rise» with its source, its button
// going on with the wird and the days read in a row; the Quran's sections in tiles - the Quran, memorization,
// testing it, the majalis; and the bar along the bottom (src/components/BottomPanel.tsx) - the qibla, the ahadith,
// the adhkar, the calendar, and settings. The words read in their language's direction: in Arabic everything
// starts on the right, the prayers (al-Fajr first) too.
import { Image } from 'expo-image';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGreen } from '@/components/hifdh/Section';
import { PlaceSheet } from '@/components/PlaceSheet';
import type { Phase } from '@/components/PrayerSky';
import { MajalisTileIcon, MemorizeTileIcon, QuranTileIcon, TestTileIcon } from '@/components/HomeTileIcons';
import { AsrIcon, DhuhrIcon, FajrIcon, FlameIcon, IshaIcon, MaghribIcon, PinIcon, PlusIcon, SettingsIcon } from '@/components/icons';
import { BottomPanel, PANEL_H, PanelTab } from '@/components/BottomPanel';
import { GlassBackdrop } from '@/components/Glass';
import { Avatar } from '@/components/Avatar';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { isEnglish, LANG, t } from '@/i18n/i18n';
import { useAccount } from '@/lib/account';
import { streak } from '@/lib/activity';
import * as hijri from '@/lib/hijri';
import { clockTime, locate, nextPrayer, place, placeName, skyNow, skyTimes, times } from '@/lib/prayer';
import { stayInQuran } from '@/lib/riwaya';
import { readJSON, writeJSON } from '@/lib/storage';
import { HifTheme, useTheme } from '@/theme/theme';

const IMG = {
  adhkar: require('@/assets/images/home/icon-adhkar.svg'),
  ahadith: require('@/assets/images/home/icon-ahadith.svg'),
  qibla: require('@/assets/images/home/icon-qibla.svg'),
  calendar: require('@/assets/images/home/icon-calendar.svg'),
  read: require('@/assets/images/home/icon-read.svg'),
  memorize: require('@/assets/images/home/icon-memorize.svg'),
  test: require('@/assets/images/home/icon-test.svg'),
  majalis: require('@/assets/images/home/icon-majalis.svg'),
};

// the home screen's own colours, by day and by night
type HomeColours = {
  ink: string;
  text: string;
  meta: string;
  tile: string;
  tileEdge: string;
  heroInk: string;
  heroSoft: string;
  button: string;
  buttonInk: string;
  streak: string;
  shadow: string;
};
const HC: { light: HomeColours; dark: HomeColours } = {
  light: {
    ink: '#173f32',
    text: '#26372f',
    meta: '#6b7a70',
    tile: '#ffffff',
    tileEdge: 'rgba(23, 63, 50, 0.10)',
    heroInk: '#173f32',
    heroSoft: '#6b7a70',
    button: '#2f6650',
    buttonInk: '#ffffff',
    streak: 'rgba(47, 102, 80, 0.10)',
    shadow: '0px 0px 0px rgba(0, 0, 0, 0)',
  },
  dark: {
    ink: '#ece3cc',
    text: '#ddd3bb',
    meta: '#9fb2a8',
    tile: 'rgba(255, 255, 255, 0.06)',
    tileEdge: 'rgba(255, 255, 255, 0.10)',
    heroInk: '#ece3cc',
    heroSoft: '#9fb2a8',
    button: '#2f6650',
    buttonInk: '#ffffff',
    streak: 'rgba(111, 181, 151, 0.16)',
    shadow: '0px 0px 0px rgba(0, 0, 0, 0)',
  },
};

// ---------- the date, today's prayers, the wird ----------

function hijriDate() {
  try {
    const now = new Date();
    const h = hijri.hijri(hijri.noon(now));
    let day = now.toLocaleDateString(LANG, { weekday: 'long' });
    if (LANG === 'fr') day = day[0].toUpperCase() + day.slice(1);
    const month = hijri.monthName(h.m);
    return LANG === 'ar'
      ? `${day}، ${h.d} ${month} ${h.y} هـ`
      : LANG === 'fr'
        ? `${day} ${h.d} ${month} ${h.y} H`
        : `${day}, ${h.d} ${month} ${h.y} AH`;
  } catch {
    return '';
  }
}

const FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const PRAYER_ICON = {
  fajr: FajrIcon,
  dhuhr: DhuhrIcon,
  asr: AsrIcon,
  maghrib: MaghribIcon,
  isha: IshaIcon,
};
// The prayers' box takes the sky of the moment, whatever the app's day / night - worked out from the
// sun at the place (src/lib/prayer.js skyNow: the civil twilights, the sun 6° below the horizon): the
// night from the dusk's end to al-Fajr, the dawn's rose to a little after sunrise, the clear midday sky
// to al-Asr, the warm afternoon, and the sunset's glow from 40 minutes before sunset to the dusk's end
type Sky = { sky: readonly [string, string, string]; ink: string; soft: string; circle: string; next: string; nextIcon: string };
const LIGHT_INK = { ink: '#173f32', soft: '#5f6650', circle: 'rgba(23, 63, 50, 0.08)', next: '#173f32', nextIcon: '#fffdf5' };
const NIGHT_INK = { ink: '#f6eedb', soft: '#d6cbb0', circle: 'rgba(255, 255, 255, 0.12)', next: '#f3e2b0', nextIcon: '#1b2a33' };
const SKIES: Record<Phase, Sky> = {
  night: { sky: ['#101b26', '#1b2b38', '#2a3c45'], ...NIGHT_INK },
  dawn: { sky: ['#f3cfc4', '#f7e3d3', '#e6eef0'], ...LIGHT_INK },
  midday: { sky: ['#c9e1ec', '#e0eef0', '#eef3e6'], ...LIGHT_INK },
  afternoon: { sky: ['#f4d6b8', '#f3e6d2', '#e8ebdb'], ...LIGHT_INK }, // the wird card's sky
  sunset: { sky: ['#e69a6c', '#c97a6c', '#7a5a72'], ...NIGHT_INK, nextIcon: '#7a3f3a' },
};
// without a place: the sky by the clock
const skyByClock = (): Phase => {
  const h = new Date().getHours();
  return h < 6 || h >= 19 ? 'night' : h < 8 ? 'dawn' : h < 15 ? 'midday' : h < 17 ? 'afternoon' : 'sunset';
};

type Day = {
  list: {
    key: (typeof FIVE)[number];
    name: string;
    at: string;
    past: boolean;
    next: boolean;
  }[];
  next: string;
  left: string;
  sky: Sky;
  phase: Phase;
  sun: number; // how far the sun is through its day: 0 at sunrise, 1 at sunset (below 0 or above 1: under the horizon)
} | null;

function prayersNow(): Day {
  const p = place();
  if (!p) return null;
  const now = new Date();
  const today = times(now, p);
  const next = nextPrayer(p);
  if (!today || !next) return null;
  const s = Math.max(0, Math.floor((next.at.getTime() - now.getTime()) / 1000));
  const left = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  return {
    list: FIVE.map((k) => ({
      key: k,
      name: t(`pr_${k}`),
      at: clockTime(today[k]),
      past: today[k] < now && k !== next.key,
      next: k === next.key,
    })),
    next: t(`pr_${next.key}`),
    left,
    sky: SKIES[(skyNow(p) ?? skyByClock()) as Phase],
    phase: (skyNow(p) ?? skyByClock()) as Phase,
    sun: (() => {
      const st = skyTimes(now, p);
      return st ? (now.getTime() - st.sunrise.getTime()) / (st.sunset.getTime() - st.sunrise.getTime()) : 0.5;
    })(),
  };
}

const wirdStarted = () => !!readJSON('wird')?.stop?.page || !!readJSON('lastPage');

// ---------- the screen ----------

// The home screen wears the Hifdh page's look: a near-white screen, white cards with a hairline, forest green as the
// one colour, one font.
export default function Home() {
  return (
    <HifTheme>
      <HomeScreen />
    </HifTheme>
  );
}

function HomeScreen() {
  const { c, isDark } = useTheme();
  const g = useGreen();
  const panel = <Panel hc={isDark ? HC.dark : HC.light} go={(href: Href) => () => router.push(href)} />;
  const hc = isDark ? HC.dark : HC.light;
  const insets = useSafeAreaInsets();
  // the member signed in (their name and picture; kept on the phone, so shown at once)
  const account = useAccount();
  const member = account.profile ?? account.cached;
  const [date, setDate] = useState(hijriDate);
  const [day, setDay] = useState<Day>(prayersNow);
  const [days, setDays] = useState(() => streak());
  const [started, setStarted] = useState(wirdStarted);
  const [locating, setLocating] = useState(false);

  // after a change of narration the app opens again: straight back on the mushaf, at the same place
  useEffect(() => {
    const stay = stayInQuran();
    if (stay) {
      if (typeof stay === 'number') writeJSON('lastPage', stay);
      router.push('/quran');
    }
  }, []);

  // back on the home screen: everything as it is now (the wird read, a place chosen...)
  useFocusEffect(
    useCallback(() => {
      setDate(hijriDate());
      setDays(streak());
      setStarted(wirdStarted());
      setDay(prayersNow());
    }, []),
  );
  // the time left to the next prayer, every second
  useEffect(() => {
    const timer = setInterval(() => setDay(prayersNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  const go = (href: Href) => () => router.push(href);
  // where the prayer times are for: the phone's location, or a city from the list (the settings)
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeFailed, setPlaceFailed] = useState(false);
  const askPlace = () => {
    setPlaceFailed(false);
    setPlaceOpen(true);
  };
  const findPlace = () => {
    setLocating(true);
    locate()
      .then(() => {
        setDay(prayersNow());
        setPlaceOpen(false);
      })
      .catch(() => setPlaceFailed(true))
      .finally(() => setLocating(false));
  };
  const chooseCity = () => {
    setPlaceOpen(false);
    router.push({ pathname: '/settings', params: { cities: '1' } });
  };
  const here = place();
  const hereName = here ? (placeName(here) ?? t('calMyLocation')) : null;

  // the prayers card's colours: plain, with the green chips of the Hifdh cards (the next prayer lit in the green)
  const sky = { ink: hc.ink, soft: hc.meta, circle: g.chip, next: g.base, nextIcon: '#ffffff' };

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <GlassBackdrop glass={panel}>
        <ScreenBackground />
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + PANEL_H + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* the greeting, and the member's round in the corner */}
            <View style={styles.head}>
              <View style={styles.greeting}>
                <Txt size={19} weight={500} color={hc.text}>
                  {HOME.salam()}
                  {LANG === 'ar' ? '،' : ','}
                </Txt>
                <Txt size={32} weight={800} color={hc.ink} lineHeight={46} numberOfLines={1}>
                  {member?.display_name ?? HOME.guest()}
                </Txt>
                <Txt size={13.5} weight={500} color={hc.meta}>
                  {date}
                </Txt>
              </View>
              {/* signed in: the profile; else logging in / creating an account */}
              <Pressable
                onPress={go(account.user || member ? '/profile' : '/login')}
                accessibilityLabel={member ? member.display_name : HOME.login()}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Avatar name={member?.display_name} size={48} />
              </Pressable>
            </View>

            {/* the next prayer and the time left to it, then today's five, the next one lit; in the sky of
                the hour */}
            <Pressable onPress={go('/calendar')} style={({ pressed }) => [styles.prayersBox, pressed && styles.pressed]}>
              <View style={[styles.prayers, { backgroundColor: c.card, borderColor: c.line }]}>
                <View style={styles.prayersHead}>
                  <Txt size={18} weight={700} color={sky.ink} style={{ flex: 1 }} numberOfLines={1}>
                    {day ? `${HOME.nextPrayer()}: ${day.next}` : locating ? HOME.locating() : HOME.setPlace()}
                  </Txt>
                  {day ? (
                    <Txt size={17} weight={800} color={sky.ink}>
                      {day.left}
                    </Txt>
                  ) : (
                    <Pressable
                      onPress={askPlace}
                      hitSlop={8}
                      style={[styles.plus, { backgroundColor: sky.next }]}
                      accessibilityLabel={HOME.setPlace()}
                    >
                      <PlusIcon color={sky.nextIcon} size={18} />
                    </Pressable>
                  )}
                </View>
                {/* where the times are for (a tap changes it) */}
                {!!hereName && (
                  <Pressable onPress={askPlace} hitSlop={6} style={styles.place} accessibilityLabel={HOME.setPlace()}>
                    <PinIcon color={sky.soft} size={14} />
                    <Txt size={12.5} weight={600} color={sky.soft} numberOfLines={1}>
                      {hereName}
                    </Txt>
                  </Pressable>
                )}
                <View style={styles.five}>
                  {FIVE.map((k, i) => {
                    const p = day?.list[i];
                    const Icon = PRAYER_ICON[k];
                    return (
                      <View key={k} style={[styles.prayer, p?.past && { opacity: 0.5 }]}>
                        <View style={[styles.circle, { backgroundColor: p?.next ? sky.next : sky.circle }]}>
                          <Icon color={p?.next ? sky.nextIcon : sky.ink} size={22} />
                        </View>
                        <Txt size={11.5} weight={p?.next ? 700 : 600} center color={sky.ink} numberOfLines={1}>
                          {t(`pr_${k}`)}
                        </Txt>
                        <Txt size={11} weight={500} center color={sky.soft}>
                          {p ? p.at : '--:--'}
                        </Txt>
                      </View>
                    );
                  })}
                </View>
              </View>
            </Pressable>

            {/* the wird card: the hadith, and on with the wird */}
            <View style={[styles.hero, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#eff3ee', borderColor: c.line }]}>
              <View style={styles.heroText}>
                <Txt size={isEnglish ? 17 : 19} weight={700} color={hc.heroInk} lineHeight={isEnglish ? 26 : 34}>
                  {HOME.hadith()}
                </Txt>
                <Txt size={12} weight={500} color={hc.heroSoft} style={{ marginTop: 2 }}>
                  {HOME.heroSource()}
                </Txt>
              </View>
              {/* on with the wird, and the days read in a row beside it */}
              <View style={styles.heroFoot}>
                <Pressable
                  onPress={go({ pathname: '/quran', params: { wird: '1' } })}
                  style={({ pressed }) => [styles.heroGo, { backgroundColor: hc.button }, pressed && styles.pressed]}
                >
                  <Txt size={14} weight={700} color={hc.buttonInk}>
                    {started ? HOME.wirdGo() : HOME.wirdStart()}
                  </Txt>
                </Pressable>
                {days > 0 && (
                  <View style={[styles.streak, { backgroundColor: hc.streak }]}>
                    <FlameIcon color="#e8903a" size={14} />
                    <Txt size={12.5} weight={700} color={hc.heroInk}>
                      {HOME.days(days)}
                    </Txt>
                  </View>
                )}
              </View>
            </View>

            {/* the Quran's sections */}
            <View style={styles.tiles}>
              <Tile hc={hc} icon={<QuranTileIcon ink={g.base} />} label={HOME.tabQuran()} onPress={go('/quran')} />
              <Tile hc={hc} icon={<MemorizeTileIcon ink={g.base} />} label={HOME.memorize()} onPress={go('/memorize')} />
              <Tile hc={hc} icon={<TestTileIcon ink={g.base} />} label={HOME.testShort()} onPress={go('/test')} />
              <Tile hc={hc} icon={<MajalisTileIcon ink={g.base} />} label={HOME.tabMajalis()} onPress={go('/majalis')} />
            </View>
          </View>
        </ScrollView>
      </GlassBackdrop>
      <PlaceSheet
        open={placeOpen}
        busy={locating}
        failed={placeFailed}
        onClose={() => setPlaceOpen(false)}
        onLocate={findPlace}
        onChooseCity={chooseCity}
      />
    </View>
  );
}

// ---------- the parts ----------

// the panel along the bottom edge (src/components/BottomPanel.tsx, the same on every screen)
function Panel({ hc, go }: { hc: HomeColours; go: (href: Href) => () => void }) {
  return (
    <BottomPanel>
      <PanelTab label={HOME.qibla()} onPress={go('/qibla')} icon={<Image source={IMG.qibla} style={styles.tabImg} tintColor={hc.meta} />} />
      <PanelTab label={HOME.ahadith()} onPress={go('/ahadith')} icon={<Image source={IMG.ahadith} style={styles.tabImg} tintColor={hc.meta} />} />
      <PanelTab label={HOME.adhkar()} onPress={go('/adhkar')} icon={<Image source={IMG.adhkar} style={styles.tabImg} tintColor={hc.meta} />} />
      <PanelTab label={HOME.calendar()} onPress={go('/calendar')} icon={<Image source={IMG.calendar} style={styles.tabImg} tintColor={hc.meta} />} />
      <PanelTab label={HOME.tabSettings()} onPress={go('/settings')} icon={<SettingsIcon color={hc.meta} />} />
    </BottomPanel>
  );
}

function Tile({ hc, icon, label, onPress }: { hc: HomeColours; icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: hc.tile, borderColor: hc.tileEdge }, pressed && styles.pressed]}
    >
      {icon}
      <Txt size={12} weight={600} center color={hc.meta} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16 },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 22,
    marginBottom: 14,
  },
  greeting: { flex: 1 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  hero: { marginHorizontal: 16, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 18, gap: 16 },
  heroText: {},
  // the button at the line's start, the days in a row at its far end
  heroFoot: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heroGo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  tiles: { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
  tile: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  prayersBox: { marginHorizontal: 16 },
  prayers: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: -6, paddingHorizontal: 4 },
  prayersHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  plus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  five: { flexDirection: 'row', justifyContent: 'space-between' },
  prayer: { flex: 1, alignItems: 'center', gap: 4 },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // along the bottom edge, its top corners rounded
  tabImg: { width: 22, height: 22 },
});
