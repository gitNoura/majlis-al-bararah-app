// «القبلة»: a compass towards the Kaaba, in Home's look: the flat page, the large heading, plain cards with a small
// caption over a bold figure, forest green for the needle and nothing ornamental (no gold, no photograph).
//
// The direction: the great-circle bearing from the member's place (src/lib/prayer.js, the same place as
// the prayer times) to the Kaaba. On a phone the dial turns with the phone (expo-location's heading), so
// the gold needle points to the qibla in the real world; without a compass (the web) the dial stays with
// north up and the needle shows the bearing. Within 5° the needle and the Kaaba glow. No place yet: the
// place sheet asks for it (the phone's location, or a city). Under the compass, on phones, how to
// calibrate it: a little phone going round a figure of eight, tilting as it goes.
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
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { BackIcon } from '@/components/icons';
import { Glass } from '@/components/home/Glass';
import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HifHeader } from '@/components/hifdh/HifHeader';
import { PlaceSheet } from '@/components/PlaceSheet';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { isEnglish, L, t } from '@/i18n/i18n';
import { locate, place, placeName } from '@/lib/prayer';
import { ui } from '@/theme/fonts';
import { useSkin } from '@/theme/homeSkin';
import { lineStart } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

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

// the dial's colours come from Home's own palette (useSkin); only the Kaaba's black and its band are fixed
type QColours = { ink: string; meta: string; ring: string; needle: string; tail: string; spark: string; cube: string; band: string };

export default function Qibla() {
  const { isDark } = useTheme();
  const k = useSkin();
  const q: QColours = { ink: k.ink, meta: k.meta, ring: k.track, needle: k.fill, tail: k.markSoft, spark: k.spark, cube: isDark ? '#0d0d0d' : '#1a1a1a', band: '#c5a15a' };
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
  const size = Math.min(width - 4 * space.md, 300);
  const degrees = Math.round(qibla);

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <HomeBackdrop />
      <HifHeader title={HOME.qibla()} />
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        {/* the place: a card (a tap changes it) */}
        <Pressable
          onPress={() => {
            setFailed(false);
            setPlaceOpen(true);
          }}
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityRole="button"
          accessibilityLabel={HOME.setPlace()}
        >
          <Glass radius={24} style={styles.place}>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt size={12} weight={500} color={k.meta} style={lineStart()}>
                {L('المكان', 'Place', 'Lieu')}
              </Txt>
              <Txt size={16} weight={700} color={k.ink} numberOfLines={1} style={lineStart()}>
                {placeLine}
              </Txt>
            </View>
            <BackIcon color={k.meta} size={18} rtl={isEnglish} />
          </Glass>
        </Pressable>

        {/* the compass: the dial turns with the phone, the needle on it points to the qibla */}
        <Glass style={styles.card}>
          <View style={styles.figures}>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt size={12} weight={500} color={k.meta} style={lineStart()}>
                {L('اتجاه القبلة', 'Qibla direction', 'Direction de la qibla')}
              </Txt>
              <Txt size={26} weight={700} lineHeight={32} color={aligned ? k.spark : k.ink} style={lineStart()}>
                {here ? `${degrees.toLocaleString(L('ar', 'en', 'fr'))}°` : '—'}
              </Txt>
            </View>
            {aligned && (
              <View style={[styles.pill, { backgroundColor: k.pill }]}>
                <Txt size={13} weight={700} color={k.accent}>
                  {L('القبلة أمامك', 'Qibla ahead', 'Qibla en face')}
                </Txt>
              </View>
            )}
          </View>
          <View style={[styles.compass, { width: size, height: size }]}>
            <Animated.View style={[StyleSheet.absoluteFill, rotorStyle]}>
              <Dial q={q} size={size} aligned={aligned} />
              <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${qibla}deg` }], opacity: here ? 1 : 0 }]}>
                <Needle q={q} size={size} aligned={aligned} />
              </View>
            </Animated.View>
          </View>
        </Glass>

        {here && Platform.OS !== 'web' && (
          <Glass style={styles.calibCard}>
            <Txt size={12} weight={500} color={k.meta} style={lineStart()}>
              {L('معايرة البوصلة', 'Calibrate the compass', 'Calibrer la boussole')}
            </Txt>
            <Calibrate q={q} bg={k.surface} meta={k.meta} />
          </Glass>
        )}
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

function Dial({ q, size, aligned }: { q: QColours; size: number; aligned: boolean }) {
  const letters = L(['ش', 'ق', 'ج', 'غ'], ['N', 'E', 'S', 'W'], ['N', 'E', 'S', 'O']) as string[];
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = i * 5;
    const major = a % 30 === 0;
    ticks.push(
      <Line key={a} x1={100} y1={13} x2={100} y2={major ? 22 : 18} stroke={q.meta} strokeWidth={major ? 1.4 : 0.8} strokeOpacity={major ? 0.8 : 0.45} strokeLinecap="round" transform={`rotate(${a} 100 100)`} />,
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
      <Circle cx={100} cy={100} r={96} fill="none" stroke={aligned ? q.spark : q.ring} strokeWidth={aligned ? 2.4 : 2} />
      {ticks}
      {letters.map((l, i) => (
        <SvgText key={l + i} x={LETTER_AT[i][0]} y={LETTER_AT[i][1] + 5} fill={i === 0 ? q.ink : q.meta} fontSize={i === 0 ? 16 : 14} fontFamily={ui(700)} textAnchor="middle">
          {l}
        </SvgText>
      ))}
    </Svg>
  );
}

// the needle: a slim forest line from the centre to the Kaaba (a small black cube with its gold band) on the rim, a pale tail behind
function Needle({ q, size, aligned }: { q: QColours; size: number; aligned: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, { filter: aligned ? 'drop-shadow(0px 0px 6px rgba(15, 107, 88, 0.45))' : 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12))' }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Line x1={100} y1={100} x2={100} y2={128} stroke={q.tail} strokeWidth={3} strokeLinecap="round" />
        <Line x1={100} y1={100} x2={100} y2={44} stroke={aligned ? q.spark : q.needle} strokeWidth={3.4} strokeLinecap="round" />
        <Rect x={91} y={24} width={18} height={18} rx={3.5} fill={q.cube} />
        <Rect x={91} y={29.5} width={18} height={3.2} fill={q.band} />
        <Circle cx={100} cy={100} r={7} fill={aligned ? q.spark : q.needle} />
        <Circle cx={100} cy={100} r={2.6} fill="#ffffff" />
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
          <Path d={EIGHT} fill="none" stroke={q.meta} strokeWidth={4} strokeOpacity={0.45} strokeLinecap="round" strokeLinejoin="round" />
          <Path d={ARROW} fill="none" stroke={q.needle} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Animated.View style={[styles.phone, { borderColor: q.meta, backgroundColor: bg }, phone]}>
          <View style={[styles.phoneButton, { backgroundColor: q.meta }]} />
        </Animated.View>
      </View>
      <Txt size={13} center color={meta} lineHeight={21} style={{ maxWidth: 300 }}>
        {t('qbCalibrate')}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 460, alignSelf: 'center', paddingHorizontal: space.md, paddingTop: space.xs, gap: space.md },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 18, paddingVertical: 10 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  card: { padding: space.md, gap: space.md },
  figures: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { minHeight: 32, borderRadius: 16, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  compass: { alignSelf: 'center', marginBottom: space.xs },
  calibCard: { padding: space.md, gap: space.sm },
  calib: { alignItems: 'center', gap: 12 },
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
