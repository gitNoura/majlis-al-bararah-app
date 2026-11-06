// The home screen, in the Hifdh page's look (src/theme/theme.tsx HifTheme): a near-white screen, white cards with a
// hairline and 20 px corners, one green, one font. From the top: the greeting with the menu button (the member's
// account and the settings); the prayers card in the sky of the moment - the next prayer, the time left, today's
// five, and the way to the qibla and the calendar; the wird card (the hadith, where the reader stopped, and the
// button that goes on with the wird); the Quran's sections (the Quran, memorization, testing it, the majalis); and
// the tools (adhkar, ahadith). No bar along the bottom: everything is on this screen.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { useGreen } from '@/components/hifdh/Section';
import { AsrIcon, DhuhrIcon, FajrIcon, FlameIcon, IshaIcon, MaghribIcon, MenuIcon, PersonIcon, PinIcon, PlusIcon, SettingsIcon } from '@/components/icons';
import { lanternBox } from '@/components/Lantern';
import { PlaceSheet } from '@/components/PlaceSheet';
import { PrayerSky, type Phase } from '@/components/PrayerSky';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { L, LANG, surahName, t } from '@/i18n/i18n';
import { useAccount } from '@/lib/account';
import { streak } from '@/lib/activity';
import * as hijri from '@/lib/hijri';
import { clockTime, locate, nextPrayer, place, placeName, skyNow, skyTimes, times } from '@/lib/prayer';
import { SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { stayInQuran } from '@/lib/riwaya';
import { readJSON, writeJSON } from '@/lib/storage';
import { wirdStop } from '@/lib/wird';
import { HifTheme, useTheme } from '@/theme/theme';

const IMG = {
  qibla: require('@/assets/images/home/icon-qibla.svg'),
  calendar: require('@/assets/images/home/icon-calendar.svg'),
};
const LAMP_W = 40; // the wird card's lantern at night

// the words this screen adds (the rest are in src/i18n/home.js)
const S = {
  quranSub: () => L('اقرأ المصحف واستمع', 'Read the mushaf and listen', 'Lisez le mushaf et écoutez'),
  wirdContinue: () => L('أكمل من حيث توقفت', 'Continue where you stopped', 'Reprenez où vous vous êtes arrêté'),
  wirdPage: (n: number) => L(`الصفحة ${n}`, `Page ${n}`, `Page ${n}`),
  wirdContinueBtn: () => L('متابعة القراءة', 'Continue reading', 'Continuer la lecture'),
  wirdStartBtn: () => L('ابدأ القراءة', 'Start reading', 'Commencer la lecture'),
  sections: () => L('الأقسام', 'Sections', 'Sections'),
  tools: () => L('أدوات', 'Tools', 'Outils'),
  adhkarSub: () => L('أذكار الصباح والمساء وغيرها', 'Morning, evening and more', 'Matin, soir et plus'),
  ahadithSub: () => L('تصفّح كتب الحديث', 'Browse the hadith books', 'Parcourir les livres de hadith'),
  account: () => L('حسابي', 'My account', 'Mon compte'),
  menu: () => L('الحساب والإعدادات', 'Account and settings', 'Compte et paramètres'),
};


// the home screen's own colours, by day and by night
type HomeColours = { ink: string; text: string; meta: string; card: string; line: string; wash: string; screen: string; shadow: string; hadithBg: [string, string] };
// Darker text and a tinted screen under white cards, so the cards stand out and the words read easily
const HC: { light: HomeColours; dark: HomeColours } = {
  light: { ink: '#123629', text: '#1f2e27', meta: '#4a5a51', card: '#ffffff', line: 'rgba(23, 63, 50, 0.16)', wash: '#e2ece4', screen: '#eff2ed', hadithBg: ['#cbdecf', '#e7f0e9'], shadow: '0px 1px 2px rgba(23, 63, 50, 0.06), 0px 6px 16px rgba(23, 63, 50, 0.07)' },
  dark: { ink: '#f2ead6', text: '#e6dcc4', meta: '#b4c4bb', card: 'rgba(255, 255, 255, 0.07)', line: 'rgba(255, 255, 255, 0.14)', wash: 'rgba(255, 255, 255, 0.08)', screen: '', hadithBg: ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.05)'], shadow: '0px 0px 0px rgba(0, 0, 0, 0)' },
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

const wirdPage = (): number | null => Number(readJSON('wird')?.stop?.page ?? readJSON('lastPage')) || null;
const wirdStarted = () => wirdPage() != null;

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
  const hc = isDark ? HC.dark : HC.light;
  const insets = useSafeAreaInsets();
  // the member signed in (their name and picture; kept on the phone, so shown at once)
  const account = useAccount();
  const member = account.profile ?? account.cached;
  const [date, setDate] = useState(hijriDate);
  const [day, setDay] = useState<Day>(prayersNow);
  const [days, setDays] = useState(() => streak());
  const [started, setStarted] = useState(wirdStarted);
  const [wirdAt, setWirdAt] = useState(wirdPage);
  const [stop, setStop] = useState(wirdStop); // the ayah where the reader stopped, once they have read
  const [locating, setLocating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
const [heroH, setHeroH] = useState(0); // the wird card's height; the picture fills it
const { width } = useWindowDimensions();
const heroW = Math.min(width, 560) - 32;
const lamp = lanternBox(LAMP_W);
const isEnglish = LANG === 'en';

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
      setWirdAt(wirdPage());
      setStop(wirdStop());
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

  const sky = day?.sky ?? SKIES[skyByClock()]; // the prayers card takes the sky of the moment
  // the wird card: before any reading «begin your khatma from al-Fatiha»; after it the surah the reader stopped in,
  // its ayah and page, and how much of the khatma is read
  const [stopSurah, stopAyah] = stop ? stop.shown.split(':').map(Number) : [0, 0];
  const readPage = stop?.page ?? wirdAt ?? 0;
  const khatmaPct = readPage ? Math.min(100, Math.round((readPage / TOTAL_PAGES) * 100)) : 0;
  const wirdTitle = stopSurah ? HOME.surah(surahName(SURAHS[stopSurah - 1])) : started && wirdAt ? HOME.wirdContinue() : HOME.wirdBegin();
  const wirdSub = stopSurah ? HOME.ayahPage(stopAyah, readPage) : started && wirdAt ? S.wirdPage(wirdAt) : null;
  const deepGreen = isDark ? '#2f6650' : '#173f32'; // the lit prayer's circle
  const hero = isDark
  ? { ink: '#f3ead2', soft: 'rgba(243, 234, 210, 0.62)', pill: 'rgba(20, 30, 26, 0.55)', button: '#ead9a6', buttonInk: '#173f32' }
  : { ink: '#173f32', soft: 'rgba(23, 63, 50, 0.62)', pill: 'rgba(255, 253, 245, 0.78)', button: '#173f32', buttonInk: '#fffdf5' };
  const heading = (text: string) => (
    <Txt size={18} weight={800} color={hc.ink} style={styles.heading}>
      {text}
    </Txt>
  );

  return (
    <View style={{ flex: 1, backgroundColor: hc.screen || c.screen }}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {/* the greeting, and the menu button in the corner: the account and the settings */}
          <View style={styles.head}>
            <View style={styles.greeting}>
              <Txt size={19} weight={500} color={hc.text}>
                {HOME.salam()}
                {LANG === 'ar' ? '،' : ','}
              </Txt>
              <Txt size={32} weight={800} color={hc.ink} lineHeight={46} numberOfLines={1}>
                {member?.display_name ?? HOME.guest()}
              </Txt>
              <Txt size={14} weight={600} color={hc.meta}>
                {date}
              </Txt>
            </View>
            <Pressable
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={S.menu()}
              style={({ pressed }) => [styles.menuBtn, { backgroundColor: hc.card, borderColor: hc.line, boxShadow: hc.shadow }, pressed && styles.pressed]}
            >
              <MenuIcon color={hc.ink} size={24} />
            </Pressable>
          </View>

          {/* the next prayer and the time left to it, today's five (the next one lit), and the qibla and the calendar;
              in the sky of the hour */}
          <Pressable onPress={go('/calendar')} style={({ pressed }) => [styles.prayersBox, pressed && styles.pressed]}>
            <LinearGradient colors={sky.sky} style={styles.prayers}>
              <PrayerSky phase={day?.phase ?? skyByClock()} sun={day?.sun ?? 0.5} />
              <View style={styles.prayersHead}>
                <Txt size={18} weight={700} color={sky.ink} style={{ flex: 1 }} numberOfLines={1}>
                  {day ? `${HOME.nextPrayer()}: ${day.next}` : locating ? HOME.locating() : HOME.setPlace()}
                </Txt>
                {day ? (
                  <Txt size={17} weight={800} color={sky.ink}>
                    {day.left}
                  </Txt>
                ) : (
                  <Pressable onPress={askPlace} hitSlop={8} style={[styles.plus, { backgroundColor: sky.next }]} accessibilityLabel={HOME.setPlace()}>
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
                    <View key={k} style={[styles.prayer, p?.past && { opacity: 0.62 }]}>
                      <View style={[styles.circle, { backgroundColor: p?.next ? sky.next : sky.circle }]}>
                        <Icon color={p?.next ? sky.nextIcon : sky.ink} size={22} />
                      </View>
                      <Txt size={11.5} weight={p?.next ? 700 : 600} center color={sky.ink} numberOfLines={1}>
                        {t(`pr_${k}`)}
                      </Txt>
                      <Txt size={12} weight={700} center color={sky.ink} style={{ opacity: 0.8 }}>
                        {p ? p.at : '--:--'}
                      </Txt>
                    </View>
                  );
                })}
              </View>
              <View style={styles.quick}>
                {[
                  { label: HOME.qibla(), img: IMG.qibla, href: '/qibla' as Href },
                  { label: HOME.calendar(), img: IMG.calendar, href: '/calendar' as Href },
                ].map((q) => (
                  <Pressable key={q.label} onPress={go(q.href)} style={({ pressed }) => [styles.quickBtn, { backgroundColor: sky.circle }, pressed && styles.pressed]}>
                    <Image source={q.img} style={styles.quickImg} tintColor={sky.ink} />
                    <Txt size={13.5} weight={700} color={sky.ink}>
                      {q.label}
                    </Txt>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          </Pressable>

          {/* the wird card, as the Hifdh page's week card (a green wash), kept short: the title with the days read; the surah
              (or «begin from al-Fatiha») with its ayah and page, and the button beside it; how much of the khatma is read;
              and the hadith as plain text. The whole card goes on with the wird. */}
          <Pressable
  onPress={go({ pathname: '/quran', params: { wird: '1' } })}
  accessibilityRole="button"
  accessibilityLabel={`${HOME.wirdLabel()}: ${wirdTitle}`}
  style={({ pressed }) => [styles.card, { borderColor: hc.line, boxShadow: hc.shadow }, pressed && styles.pressed]}
>
{/* the background: soft colour blobs under a frosted glass layer */}
<View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden', backgroundColor: isDark ? '#1d2a25' : '#e6eee4' }]} pointerEvents="none">
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Defs>
      <RadialGradient id="blobGreen" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={isDark ? '#3f7d63' : '#7fb095'} stopOpacity={isDark ? 0.55 : 0.7} />
        <Stop offset="1" stopColor={isDark ? '#3f7d63' : '#7fb095'} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient id="blobGold" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor="#f0c878" stopOpacity={isDark ? 0.3 : 0.65} />
        <Stop offset="1" stopColor="#f0c878" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={LANG === 'ar' ? '12%' : '88%'} cy="5%" r={130} fill="url(#blobGold)" />
    <Circle cx={LANG === 'ar' ? '85%' : '15%'} cy="100%" r={150} fill="url(#blobGreen)" />
  </Svg>
  {/* the frosted glass */}
  <LinearGradient
    colors={isDark ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.05)'] : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={StyleSheet.absoluteFill}
  />
  {/* the light catching the top edge */}
  <LinearGradient
    colors={['rgba(255,255,255,0)', isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5 }}
  />
</View>

  <View style={styles.cardHead}>
    <Txt size={15} weight={700} color={hc.ink} style={{ flex: 1 }}>
      {HOME.wirdLabel()}
    </Txt>
    {days > 0 && (
      <View style={styles.streak}>
        <FlameIcon color="#e8903a" size={14} />
        <Txt size={13} weight={600} color={hc.meta}>
          {HOME.days(days)}
        </Txt>
      </View>
    )}
  </View>
  <View style={styles.wirdRow}>
    <View style={{ flex: 1 }}>
      <Txt size={22} weight={800} color={hc.ink} lineHeight={30} numberOfLines={2}>
        {wirdTitle}
      </Txt>
      {!!wirdSub && (
        <Txt size={13} weight={600} color={hc.meta} numberOfLines={1}>
          {wirdSub}
        </Txt>
      )}
    </View>
    <View style={[styles.button, { backgroundColor: deepGreen }]}>
      <Txt size={14.5} weight={700} color="#fffdf5">
        {started ? S.wirdContinueBtn() : S.wirdStartBtn()}
      </Txt>
      <Arrow color="#fffdf5" size={16} line />
    </View>
  </View>
  <View style={styles.khatma}>
    <View style={[styles.track, { backgroundColor: g.chip }]}>
      <View style={[styles.fill, { backgroundColor: g.base, width: `${khatmaPct}%` }]} />
    </View>
    <Txt size={12.5} weight={700} color={hc.meta}>
      {HOME.khatma(khatmaPct)}
    </Txt>
  </View>
  <Txt size={13} weight={500} color={hc.text} lineHeight={21}>
    <Txt size={13} weight={800} color={hc.ink}>
      {HOME.hadithIntro()}{' '}
    </Txt>
    {HOME.hadith()}
    <Txt size={11.5} weight={500} color={hc.meta}>
      {'  '}
      {HOME.heroSource()}
    </Txt>
  </Txt>
</Pressable>

          {/* the app's four sections */}
          {heading(S.sections())}
          <View style={styles.tiles}>
            <Tile hc={hc} g={g} label={HOME.tabQuran()} sub={S.quranSub()} onPress={go('/quran')} />
            <Tile hc={hc} g={g} label={HOME.memorize()} sub={HOME.memorizeSub()} onPress={go('/memorize')} />
            <Tile hc={hc} g={g} label={HOME.testShort()} sub={HOME.testSub()} soon onPress={go('/test')} />
            <Tile hc={hc} g={g} label={HOME.tabMajalis()} sub={HOME.majalisSub()} soon onPress={go('/majalis')} />
          </View>

          {/* the tools */}
          {heading(S.tools())}
          <View style={styles.tiles}>
            <Tile hc={hc} g={g} label={HOME.adhkar()} sub={S.adhkarSub()} compact onPress={go('/adhkar')} />
            <Tile hc={hc} g={g} label={HOME.ahadith()} sub={S.ahadithSub()} compact onPress={go('/ahadith')} />
          </View>
        </View>
      </ScrollView>
      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        hc={hc}
        name={member?.display_name}
        email={account.user?.email}
        signedIn={!!(account.user || member)}
        onAccount={() => {
          setMenuOpen(false);
          router.push(account.user || member ? '/profile' : '/login');
        }}
        onSettings={() => {
          setMenuOpen(false);
          router.push('/settings');
        }}
      />
      <PlaceSheet open={placeOpen} busy={locating} failed={placeFailed} onClose={() => setPlaceOpen(false)} onLocate={findPlace} onChooseCity={chooseCity} />
    </View>
  );
}

// ---------- the parts ----------

// The forward arrow, drawn (not a text character, so the direction never depends on how the text is laid out):
// pointing left in Arabic, right in English. «line» is the longer arrow for buttons, otherwise a chevron.
function Arrow({ color, size = 18, line }: { color: string; size?: number; line?: boolean }) {
  const ar = LANG === 'ar';
  const d = line ? (ar ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6') : ar ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

// A section or tool: a card with its name, one line about it, and a quiet arrow (or «soon» where it is still to come)
function Tile({ hc, g, label, sub, soon, compact, onPress }: { hc: HomeColours; g: ReturnType<typeof useGreen>; label: string; sub: string; soon?: boolean; compact?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, compact && styles.tileCompact, { backgroundColor: hc.card, borderColor: hc.line, boxShadow: hc.shadow }, pressed && styles.pressed]}>
      <View style={styles.tileTop}>
        <Txt size={compact ? 16 : 18} weight={700} color={hc.ink} numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </Txt>
        {soon ? (
          <View style={[styles.soon, { backgroundColor: g.chip }]}>
            <Txt size={11} weight={700} color={g.base}>
              {HOME.soon()}
            </Txt>
          </View>
        ) : (
          <Arrow color={hc.meta} />
        )}
      </View>
      <Txt size={13.5} weight={500} color={hc.meta} numberOfLines={2}>
        {sub}
      </Txt>
    </Pressable>
  );
}

// The menu button's sheet: the member's account (or logging in) and the settings
function MenuSheet({ open, onClose, hc, name, email, signedIn, onAccount, onSettings }: { open: boolean; onClose: () => void; hc: HomeColours; name?: string | null; email?: string | null; signedIn: boolean; onAccount: () => void; onSettings: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const row = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.menuRow, { backgroundColor: hc.card, borderColor: hc.line }, pressed && styles.pressed]}>
      {icon}
      <Txt size={16} weight={700} color={hc.ink} style={{ flex: 1 }}>
        {title}
      </Txt>
      <Arrow color={hc.meta} />
    </Pressable>
  );
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: c.screen, paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.sheetHead}>
            <Avatar name={name} size={52} />
            <View style={{ flex: 1 }}>
              <Txt size={19} weight={800} color={hc.ink} numberOfLines={1}>
                {name ?? HOME.guest()}
              </Txt>
              {!!email && (
                <Txt size={13} color={hc.meta} numberOfLines={1}>
                  {email}
                </Txt>
              )}
            </View>
          </View>
          {row(<PersonIcon color={hc.ink} size={20} />, signedIn ? S.account() : HOME.login(), onAccount)}
          {row(<SettingsIcon color={hc.ink} size={20} />, HOME.tabSettings(), onSettings)}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: { alignSelf: 'center', borderRadius: 28, overflow: 'hidden' },
heroOver: { paddingTop: 22, paddingBottom: 20, paddingHorizontal: 22, gap: 18, alignItems: 'flex-start' },
heroText: { maxWidth: '78%' },
wirdLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
wirdChip: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
heroFoot: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
heroGo: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 20, borderRadius: 999 },
mirror: { transform: [{ scaleX: -1 }] },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 22, marginBottom: 10 },
  greeting: { flex: 1 },
  menuBtn: { width: 46, height: 46, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  heading: { marginHorizontal: 18, marginTop: 4 },
  // the wird card: as the Hifdh page's cards (20 px corners, a hairline), its wash green
  card: { marginHorizontal: 16, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
  wirdRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  khatma: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  button: { height: 42, paddingHorizontal: 16, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 16 },
  tile: { flexBasis: '47%', flexGrow: 1, minHeight: 108, gap: 4, padding: 16, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  tileCompact: { minHeight: 0, paddingVertical: 14 },
  tileTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  soon: { paddingHorizontal: 9, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  // the prayers card: its sky (clouds, stars) cut to its round corners
  prayersBox: { marginHorizontal: 16, borderRadius: 26 },
  prayers: { borderRadius: 26, overflow: 'hidden', paddingTop: 16, paddingBottom: 14, paddingHorizontal: 14, gap: 12 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: -6, paddingHorizontal: 4 },
  prayersHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  plus: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 253, 245, 0.92)' },
  five: { flexDirection: 'row', justifyContent: 'space-between' },
  prayer: { flex: 1, alignItems: 'center', gap: 4 },
  circle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  quick: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1, height: 40, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  quickImg: { width: 18, height: 18 },
  // the menu sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, gap: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
});