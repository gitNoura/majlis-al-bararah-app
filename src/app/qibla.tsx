// «القبلة»: a compass towards the Kaaba (the website's src/home/qibla.js and qibla.css, rebuilt for the
// phone), on the home screen's background.
//
// The direction: the great-circle bearing from the member's place (src/lib/prayer.js, the same place as
// the prayer times) to the Kaaba. On a phone the dial turns with the phone (expo-location's heading), so
// the gold needle points to the qibla in the real world; without a compass (the web) the dial stays with
// north up and the needle shows the bearing. Within 5° the needle and the Kaaba glow. No place yet: the
// place sheet asks for it (the phone's location, or a city). Under the compass, on phones, how to
// calibrate it: a little phone going round a figure of eight, tilting as it goes.
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { BackIcon, PinIcon } from '@/components/icons';
import { PlaceSheet } from '@/components/PlaceSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { isEnglish, L, t } from '@/i18n/i18n';
import { locate, place, placeName } from '@/lib/prayer';
import { ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

const KAABA_IMG = require('@/assets/images/qibla/kaaba-medallion.webp');
const KAABA = { lat: 21.4225, lng: 39.8262 };
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const ALIGNED = 5; // degrees: within this the qibla is ahead

// the bearing from a place to the Kaaba, degrees clockwise from north
function bearing(p: { lat: number; lng: number }) {
  const f1 = rad(p.lat);
  const f2 = rad(KAABA.lat);
  const dl = rad(KAABA.lng - p.lng);
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
// the short way from one angle to another (-180..180)
const shortWay = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

// the dial's and the needle's colours (the website's --ix-ink, --quran-gold), by day and by night
const QC = {
  light: { ink: '#173f32', gold: '#c5a15a', face: 'rgba(255, 255, 255, 0.62)', headShade: '#b5862b', mark: '#b5862b', shadow: '0px 10px 24px rgba(68, 55, 43, 0.1)' },
  dark: { ink: '#ffffff', gold: '#c5a15a', face: 'rgba(44, 44, 44, 0.85)', headShade: '#c39436', mark: '#f3d78e', shadow: '0px 12px 30px rgba(0, 0, 0, 0.4)' },
};
type QColours = (typeof QC)['light'];

export default function Qibla() {
  const { c, isDark } = useTheme();
  const q = isDark ? QC.dark : QC.light;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [here, setHere] = useState(place);
  const [heading, setHeading] = useState<number | null>(null);
  const [placeOpen, setPlaceOpen] = useState(() => !place());
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);

  // back from the settings' list of cities: the place as it is now
  useFocusEffect(
    useCallback(() => {
      setHere(place());
    }, []),
  );

  const qibla = here ? bearing(here) : 0;

  // the phone's compass: the dial turns against the heading, so north on the dial is real north. The
  // readings are noisy: the dial glides towards each (always the short way round 0°/360°)
  const shown = useRef(0);
  const rotor = useSharedValue(0);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: Location.LocationSubscription | null = null;
    let gone = false;
    // the phone gives its compass only with the location permission: asked here too, since a member who
    // chose a city (and not «my location») has never been asked - without it the dial stood still
    Location.requestForegroundPermissionsAsync()
      .then(({ granted }) => {
        if (!granted || gone) return null;
        return Location.watchHeadingAsync((h) => {
          const v = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          if (Number.isNaN(v) || v < 0) return;
          setHeading(v);
        });
      })
      .then((s) => {
        if (!s) return;
        if (gone) s.remove();
        else sub = s;
      })
      .catch(() => {});
    return () => {
      gone = true;
      sub?.remove();
    };
  }, []);
  useEffect(() => {
    const target = heading ?? 0;
    shown.current += shortWay(shown.current, target);
    rotor.value = withTiming(-shown.current, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [heading, rotor]);
  // the qibla ahead: the needle and the Kaaba glow (a hint, not a lock)
  const aligned = !!here && heading !== null && Math.abs(shortWay(heading, qibla)) < ALIGNED;
  const rotorStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotor.value}deg` }] }));

  const findPlace = () => {
    setLocating(true);
    setFailed(false);
    locate()
      .then(() => {
        setHere(place());
        setPlaceOpen(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLocating(false));
  };
  const chooseCity = () => {
    setPlaceOpen(false);
    router.push({ pathname: '/settings', params: { cities: '1' } });
  };

  const placeLine = here ? (placeName(here) ?? t('calMyLocation')) : t('qbNoPlace');
  const size = Math.min(width * 0.84, 360);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <ScreenHeader title={HOME.qibla()} />
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        {/* the place: a card of glass (a tap changes it) */}
        <Pressable
          onPress={() => {
            setFailed(false);
            setPlaceOpen(true);
          }}
          style={({ pressed }) => [
            styles.place,
            { backgroundColor: isDark ? c.card : '#ffffff', boxShadow: q.shadow },
            pressed && styles.pressed,
          ]}
          accessibilityLabel={HOME.setPlace()}
        >
          <PinIcon color={q.gold} size={20} />
          <Txt size={16} weight={700} color={c.ink} numberOfLines={1} style={{ flex: 1 }}>
            {placeLine}
          </Txt>
          <BackIcon color={c.meta} size={18} rtl={isEnglish} />
        </Pressable>

        {/* the compass: the dial turns with the phone, the needle on it points to the qibla */}
        <View style={[styles.compass, { width: size, height: size }]}>
          <Animated.View style={[StyleSheet.absoluteFill, rotorStyle]}>
            <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, boxShadow: q.shadow }]} />
            <Dial q={q} size={size} />
            <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${qibla}deg` }], opacity: here ? 1 : 0 }]}>
              <Needle q={q} size={size} aligned={aligned} />
            </View>
          </Animated.View>
          <Image
            source={KAABA_IMG}
            style={[
              styles.kaaba,
              { width: size * 0.17, height: size * 0.17, borderRadius: size * 0.085, left: size * 0.415, top: size * 0.415 },
              { boxShadow: aligned ? '0px 0px 14px rgba(255, 226, 150, 0.85)' : '0px 4px 10px rgba(0, 0, 0, 0.25)' },
            ]}
          />
        </View>

        {here && Platform.OS !== 'web' && <Calibrate q={q} bg={c.screen} meta={c.meta} />}
      </ScrollView>

      <PlaceSheet
        open={placeOpen}
        busy={locating}
        failed={failed}
        onClose={() => setPlaceOpen(false)}
        onLocate={findPlace}
        onChooseCity={chooseCity}
      />
    </View>
  );
}

// ---------- the dial (drawn, so it is sharp at any size and follows the theme) ----------

const LETTER_AT = [
  [100, 40],
  [160, 100],
  [100, 160],
  [40, 100],
];

function Dial({ q, size }: { q: QColours; size: number }) {
  const letters = L(['ش', 'ق', 'ج', 'غ'], ['N', 'E', 'S', 'W'], ['N', 'E', 'S', 'O']) as string[];
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = i * 5;
    if (a % 90 === 0) continue; // the four diamonds instead
    const major = a % 30 === 0;
    ticks.push(
      <Line
        key={a}
        x1={100}
        y1={12}
        x2={100}
        y2={100 - (major ? 80 : 84)}
        stroke={q.ink}
        strokeWidth={major ? 1.1 : 0.5}
        strokeOpacity={major ? 0.75 : 0.4}
        transform={`rotate(${a} 100 100)`}
      />,
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
      <Circle cx={100} cy={100} r={96} fill="none" stroke={q.gold} strokeWidth={1.4} />
      <Circle cx={100} cy={100} r={92} fill={q.face} />
      <Circle cx={100} cy={100} r={27} fill="none" stroke={q.gold} strokeOpacity={0.45} strokeWidth={0.6} />
      {ticks}
      {[0, 90, 180, 270].map((a) => (
        <Path key={a} d="M100 9l3.4 9-3.4 9-3.4-9z" fill={q.gold} transform={`rotate(${a} 100 100)`} />
      ))}
      {letters.map((l, i) => (
        <SvgText
          key={l + i}
          x={LETTER_AT[i][0]}
          y={LETTER_AT[i][1] + 5}
          fill={q.ink}
          fontSize={15}
          fontFamily={ui(700)}
          textAnchor="middle"
        >
          {l}
        </SvgText>
      ))}
    </Svg>
  );
}

// the needle: a slim gold spear lit on one side (two tones, like cut metal), a fine green tail; and a
// gold marker on the rim where the qibla is
function Needle({ q, size, aligned }: { q: QColours; size: number; aligned: boolean }) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          filter: aligned
            ? 'drop-shadow(0px 0px 6px rgba(255, 226, 150, 0.95)) drop-shadow(0px 0px 16px rgba(228, 201, 120, 0.6))'
            : 'drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.25))',
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <G>
          <Path d="M100 8.5l-4-6.5h8z" fill={q.mark} />
          <Path d="M100 24L95.6 96L100 100z" fill="#f6dd95" />
          <Path d="M100 24L104.4 96L100 100z" fill={q.headShade} />
          <Path d="M100 100L97.4 103L100 148z" fill="#4a5346" />
          <Path d="M100 100L102.6 103L100 148z" fill={q.ink === '#ffffff' ? '#173f32' : q.ink} />
        </G>
      </Svg>
    </View>
  );
}

// ---------- calibrating the compass: a figure of eight, a little phone going round it ----------

// the eight, in a 200 × 100 box: the same curve for the line and for the phone's way
const eightAt = (s: number) => {
  'worklet';
  const a = s * 2 * Math.PI;
  return { x: 100 + 85 * Math.sin(a), y: 50 - 35 * Math.sin(2 * a) };
};
const EIGHT = (() => {
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const { x, y } = eightAt(i / 120);
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
})();
// the gold arrow on the line, at the top of the left loop, pointing the way the phone goes round
const ARROW = (() => {
  const at = 0.625;
  const { x, y } = eightAt(at);
  const n = eightAt(at + 0.002);
  const len = Math.hypot(n.x - x, n.y - y);
  const [ux, uy] = [(n.x - x) / len, (n.y - y) / len]; // along the way
  const [px, py] = [-uy, ux]; // across it
  const tip = [x + ux * 4, y + uy * 4];
  const back = [x - ux * 4, y - uy * 4];
  const f = (v: number) => v.toFixed(2);
  return `M${f(back[0] + px * 7)} ${f(back[1] + py * 7)}L${f(tip[0])} ${f(tip[1])}L${f(back[0] - px * 7)} ${f(back[1] - py * 7)}`;
})();
const PHONE_W = 18;
const PHONE_H = 30;

function Calibrate({ q, bg, meta }: { q: QColours; bg: string; meta: string }) {
  const still = useReducedMotion();
  const way = useSharedValue(0);
  const tilt = useSharedValue(-18);
  useEffect(() => {
    if (still) return;
    way.value = withRepeat(withTiming(1, { duration: 4800, easing: Easing.linear }), -1);
    tilt.value = withRepeat(withTiming(18, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [still, way, tilt]);
  const phone = useAnimatedStyle(() => {
    const { x, y } = eightAt(way.value);
    return {
      transform: [{ translateX: x - PHONE_W / 2 }, { translateY: y - PHONE_H / 2 }, { rotate: `${tilt.value}deg` }],
    };
  });
  return (
    <View style={styles.calib}>
      <View style={styles.eight}>
        <Svg width={200} height={100} viewBox="0 0 200 100" style={StyleSheet.absoluteFill}>
          <Path d={EIGHT} fill="none" stroke={q.ink} strokeWidth={5} strokeOpacity={0.8} strokeLinecap="round" strokeLinejoin="round" />
          <Path d={ARROW} fill="none" stroke={q.gold} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Animated.View style={[styles.phone, { borderColor: q.ink, backgroundColor: bg }, phone]}>
          <View style={[styles.phoneButton, { backgroundColor: q.ink }]} />
        </Animated.View>
      </View>
      <Txt size={13} center color={meta} lineHeight={21} style={{ maxWidth: 300 }}>
        {t('qbCalibrate')}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 460, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 4 },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  compass: { alignSelf: 'center', marginTop: 56, marginBottom: 26 },
  kaaba: { position: 'absolute' },
  calib: { alignItems: 'center', gap: 12, marginTop: 6 },
  eight: { width: 200, height: 100 },
  phone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PHONE_W,
    height: PHONE_H,
    borderWidth: 2.5,
    borderRadius: 5,
  },
  phoneButton: { position: 'absolute', bottom: 2, alignSelf: 'center', width: 4, height: 4, borderRadius: 2 },
});
