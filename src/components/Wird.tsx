// The wird's two moments over the mushaf (the website's #wird-quote and #wird-end):
// - WirdQuote: as the wird opens, for 5 seconds, «أحبّ الأعمال إلى الله أدومها وإن قلّ» over the dimmed
//   page, then its translation and source; it never blocks the page (a tap goes through, it fades away).
// - WirdEnd: the day's wird done - «May Allah accept your wird today», the hadith of the letters, the
//   khatma so far as 30 steps rising to a golden door (one per juz), tomorrow's ayah, «اقرأ وارتقِ»
//   and «Alhamdulillah». After a khatma: congratulations and the duaa of the khatm.
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { isEnglish, L, t } from '@/i18n/i18n';
import type { Done } from '@/lib/wird';
import { serif } from '@/theme/fonts';

const GOLD = '#e2c27a';
const VEIL = 'rgba(12, 16, 14, 0.95)';

const QUOTE_AR = 'أحبُّ الأعمالِ إلى اللهِ أدومُها وإنْ قلّ';
const quoteTr = () =>
  L('', 'The most beloved deeds to Allah are the most constant, even if small.', 'Les œuvres les plus aimées d’Allah sont les plus constantes, même si elles sont peu nombreuses.');
const QUOTE_SOURCE = () => ['رواه البخاري ومسلم', L('', 'al-Bukhari & Muslim', 'al-Bukhari et Muslim')];

const HASANAT_AR = 'مَن قرأ حرفًا من كتاب الله فله به حسنة، والحسنة بعشر أمثالها';
const hasanatTr = () =>
  L(
    '',
    '“Whoever reads a letter of the Book of Allah has a good deed for it, and each good deed is multiplied by ten.”',
    '« Quiconque lit une lettre du Livre d’Allah obtient une bonne action, et la bonne action est multipliée par dix. »',
  );
const HASANAT_SOURCE = () => ['رواه الترمذي', L('', 'at-Tirmidhi', 'at-Tirmidhi')];

// the duaa of the khatm, in Arabic in every language (its words and harakat as on the website)
const KHATMA_DUAA = [
  'اللَّهُمَّ ارْحَمْنِي بالقُرْءَانِ وَاجْعَلهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً',
  'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَانَسِيتُ وَعَلِّمْنِي مِنْهُ مَاجَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَارَبَّ العَالَمِينَ',
  'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ',
  'اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً وَمِيتَةً سَوِيَّةً وَمَرَدًّا غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلةِ وَخَيْرَ الدُّعَاءِ وَخَيْرَ النَّجَاحِ وَخَيْرَ العِلْمِ وَخَيْرَ العَمَلِ وَخَيْرَ  الثَّوَابِ وَخَيْرَ الحَيَاةِ وَخيْرَ المَمَاتِ وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي وَحَقِّقْ إِيمَانِي وَارْفَعْ دَرَجَتِي وَتَقَبَّلْ صَلاَتِي وَاغْفِرْ خَطِيئَاتِي وَأَسْأَلُكَ العُلَا مِنَ الجَنَّةِ',
  'اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ وَالسَّلاَمَةَ مِنْ كُلِّ إِثْمٍ وَالغَنِيمَةَ مِنْ كُلِّ بِرٍّ وَالفَوْزَ بِالجَنَّةِ وَالنَّجَاةَ مِنَ النَّارِ',
  'اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الأُمُورِ كُلِّهَا وَأجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الآخِرَةِ',
  'اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَاتَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعْصِيَتِكَ وَمِنْ طَاعَتِكَ مَاتُبَلِّغُنَا بِهَا جَنَّتَكَ وَمِنَ اليَقِينِ مَاتُهَوِّنُ بِهِ عَلَيْنَا مَصَائِبَ الدُّنْيَا وَمَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّتِنَا مَاأَحْيَيْتَنَا وَاجْعَلْهُ الوَارِثَ مِنَّا وَاجْعَلْ ثَأْرَنَا عَلَى مَنْ ظَلَمَنَا وَانْصُرْنَا عَلَى مَنْ عَادَانَا وَلاَ تجْعَلْ مُصِيبَتَنَا فِي دِينِنَا وَلاَ تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا وَلاَ تُسَلِّطْ عَلَيْنَا مَنْ لَا يَرْحَمُنَا',
  'اللَّهُمَّ لَا تَدَعْ لَنَا ذَنْبًا إِلَّا غَفَرْتَهُ وَلَا هَمَّا إِلَّا فَرَّجْتَهُ وَلَا دَيْنًا إِلَّا قَضَيْتَهُ وَلَا حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالآخِرَةِ إِلَّا قَضَيْتَهَا يَاأَرْحَمَ الرَّاحِمِينَ',
];
const KHATMA_DUAA_END =
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ وَصَلَّى اللهُ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ الأَخْيَارِ وَسَلَّمَ تَسْلِيمًا كَثِيراً.';

const arabic = { fontFamily: serif(700), writingDirection: 'rtl' as const };

// ---------- the opening hadith ----------

export function WirdQuote({ shown, onGone }: { shown: number; onGone: () => void }) {
  // `shown` changes each time the wird opens
  useEffect(() => {
    if (!shown) return;
    const gone = setTimeout(onGone, 5000);
    return () => clearTimeout(gone);
  }, [shown, onGone]);
  if (!shown) return null;
  const tr = quoteTr();
  return (
    <Animated.View key={shown} entering={FadeIn.duration(700)} exiting={FadeOut.duration(900)} style={[StyleSheet.absoluteFill, styles.quote]} pointerEvents="none">
      <Animated.View entering={FadeIn.delay(300).duration(900)}>
        <Star />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600).duration(1100)}>
        <Txt size={27} center color={GOLD} lineHeight={50} style={arabic}>
          {QUOTE_AR}
        </Txt>
      </Animated.View>
      {!!tr && (
        <Animated.View entering={FadeIn.delay(1600).duration(900)}>
          <Txt size={15} center color="rgba(255,255,255,0.86)" lineHeight={23}>
            {tr}
          </Txt>
        </Animated.View>
      )}
      <Animated.View entering={FadeIn.delay(2200).duration(900)}>
        <Source parts={QUOTE_SOURCE()} />
      </Animated.View>
    </Animated.View>
  );
}

// a hadith's source: in Arabic, and under it in the translation's language (two lines: mixed on one,
// the two directions muddle their order)
function Source({ parts: [ar, tr] }: { parts: string[] }) {
  return (
    <View style={{ alignItems: 'center', gap: 1 }}>
      <Txt size={12.5} center color="rgba(226,194,122,0.8)" style={{ writingDirection: 'rtl' }}>
        {ar}
      </Txt>
      {!!tr && (
        <Txt size={12} center color="rgba(226,194,122,0.65)" style={{ writingDirection: 'ltr' }}>
          {tr}
        </Txt>
      )}
    </View>
  );
}

// a small gold eight-pointed figure: two squares turned, and a round in them
function Star() {
  return (
    <Svg width={64} height={64} viewBox="0 0 200 200">
      <G fill="none" stroke={GOLD} strokeWidth={5} opacity={0.85}>
        <Rect x={45} y={45} width={110} height={110} />
        <Rect x={45} y={45} width={110} height={110} transform="rotate(45 100 100)" />
        <Circle cx={100} cy={100} r={34} />
      </G>
    </Svg>
  );
}

// ---------- the 30 steps of the khatma ----------

// rising to the left in Arabic (the way it is read), to the right in English and French: bright gold up
// to where the reader is, a light on that step, tomorrow's step brighter; a golden door at the top
function Stairs({ progress, khatma, rtl }: { progress: number; khatma: boolean; rtl: boolean }) {
  const steps = 30;
  const w = 10;
  const rise = 3.6;
  const base = 128;
  const top = (i: number) => base - (i + 1) * rise;
  const reached = khatma ? steps : Math.min(steps, (progress / 100) * steps);
  const here = Math.min(steps - 1, Math.floor(reached));
  const line = (n: number) => {
    let d = `M0 ${base}V${top(0).toFixed(1)}H${w}`;
    for (let i = 1; i < n; i++) d += `V${top(i).toFixed(1)}H${(i + 1) * w}`;
    return d;
  };
  const next = Math.min(steps - 1, here + 1);
  const dx = steps * w + 4;
  const floor = top(steps - 1);
  const dw = 18;
  const dh = 30;
  const arch = `M${dx} ${floor}V${floor - dh + dw / 2}A${dw / 2} ${dw / 2} 0 0 1 ${dx + dw} ${floor - dh + dw / 2}V${floor}Z`;
  const lx = here * w + w / 2;
  const ly = top(here) - 5;
  return (
    <Svg width="100%" height={150} viewBox={`-6 -24 346 ${base + 30}`}>
      <Defs>
        <ClipPath id="ws-door">
          <Path d={arch} />
        </ClipPath>
        <LinearGradient id="ws-gold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f6e3a8" />
          <Stop offset="0.5" stopColor="#c9a24a" />
          <Stop offset="1" stopColor="#8a6420" />
        </LinearGradient>
        <RadialGradient id="ws-halo">
          <Stop offset="0" stopColor="#ffe7a0" stopOpacity={0.9} />
          <Stop offset="0.45" stopColor="#d9b45e" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#d9b45e" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <G transform={rtl ? 'translate(334 0) scale(-1 1)' : undefined}>
        <Path d={`${line(steps)}H${dx + dw + 6}`} stroke="rgba(226,194,122,0.25)" strokeWidth={1.4} fill="none" />
        <Path d={`${line(here + 1)}${khatma ? `H${dx + dw / 2}` : ''}`} stroke={GOLD} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
        {!khatma && here < steps - 1 && <Path d={`M${next * w} ${top(next).toFixed(1)}H${(next + 1) * w}`} stroke="#fff3cf" strokeWidth={2.4} strokeLinecap="round" />}
        {!khatma && (
          <>
            <Circle cx={lx} cy={ly} r={13} fill="url(#ws-halo)" />
            <Circle cx={lx} cy={ly} r={3.6} fill="#fff6d8" />
          </>
        )}
        <Ellipse cx={dx + dw / 2} cy={floor - dh / 2} rx={dw * 1.4} ry={dh * 0.9} fill="url(#ws-halo)" opacity={khatma ? 1 : 0.5} />
        <G clipPath="url(#ws-door)">
          <Rect x={dx} y={floor - dh} width={dw} height={dh} fill="url(#ws-gold)" />
        </G>
        <Path d={arch} stroke="#f6e3a8" strokeWidth={1} fill="none" />
        <Path d={`M${dx + dw / 2} ${floor - dh + 2}V${floor}`} stroke="#8a6420" strokeWidth={0.8} />
      </G>
    </Svg>
  );
}

// ---------- the end of the day's wird ----------

export function WirdEnd({ done, onClose }: { done: Done | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!done) return null;
  const shown = done;
  const rtl = !isEnglish;
  const tr = hasanatTr();
  return (
    <Animated.View entering={FadeIn.duration(900)} exiting={FadeOut.duration(500)} style={[StyleSheet.absoluteFill, { backgroundColor: VEIL, zIndex: 20 }]}>
      <ScrollView contentContainerStyle={[styles.end, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {shown.khatma ? (
          <>
            <Animated.View entering={FadeIn.delay(300).duration(900)}>
              <Star />
            </Animated.View>
            <Txt size={22} weight={700} center color={GOLD} lineHeight={34} style={{ fontFamily: serif(700) }}>
              {t('wirdKhatmaCongrats', shown.khatmas)}
            </Txt>
            <View style={{ gap: 12, marginTop: 6 }}>
              {KHATMA_DUAA.map((p, i) => (
                <Txt key={i} size={18} center color="#f6efe0" lineHeight={34} style={{ ...arabic, fontFamily: serif(400) }}>
                  {`${p} `}
                  <Txt size={16} color={GOLD}>
                    ۞
                  </Txt>
                </Txt>
              ))}
              <Txt size={18} center color="#f6efe0" lineHeight={34} style={{ ...arabic, fontFamily: serif(400) }}>
                {KHATMA_DUAA_END}
              </Txt>
            </View>
            <Txt size={14} center color="rgba(255,255,255,0.8)" lineHeight={22} style={{ marginTop: 8 }}>
              {t('wirdKhatmaAgain')}
            </Txt>
          </>
        ) : (
          <>
            <Animated.View entering={FadeIn.delay(200).duration(900)} style={{ gap: 18, alignSelf: 'stretch' }}>
              <Txt size={22} weight={700} center color={GOLD} lineHeight={34} style={{ fontFamily: serif(700) }}>
                {t('wirdDone')}
              </Txt>
              <View style={styles.hadith}>
                <Txt size={19} center color="#f6efe0" lineHeight={34} style={arabic}>
                  {`«${HASANAT_AR}»`}
                </Txt>
                {!!tr && (
                  <Txt size={14} center color="rgba(255,255,255,0.8)" lineHeight={21}>
                    {tr}
                  </Txt>
                )}
                <Source parts={HASANAT_SOURCE()} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn.delay(900).duration(1000)} style={{ alignSelf: 'stretch', alignItems: 'center', gap: 6 }}>
              <Stairs progress={shown.progress} khatma={false} rtl={rtl} />
              <Txt size={15} weight={700} center color="#f6efe0">
                {`${t('wirdKhatmaSoFar', Math.round(shown.progress))}${shown.khatmas ? ` · ${t('wirdKhatmas', shown.khatmas)}` : ''}`}
              </Txt>
              <Txt size={14} center color="rgba(255,255,255,0.8)" lineHeight={22}>
                {shown.next}
              </Txt>
              <Txt size={20} center color={GOLD} lineHeight={36} style={[arabic, { marginTop: 6 }]}>
                «اقرأ وارتقِ»
              </Txt>
            </Animated.View>
          </>
        )}
        <Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed && { opacity: 0.8 }]}>
          <Txt size={15} weight={700} center color="#1b2a22">
            {shown.khatma ? t('ahBack') : t('wirdSeeYou')}
          </Txt>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quote: { backgroundColor: 'rgba(12, 16, 14, 0.78)', alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 30, zIndex: 20 },
  end: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24 },
  hadith: { gap: 8, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(226,194,122,0.3)', backgroundColor: 'rgba(255,255,255,0.04)' },
  close: { marginTop: 8, height: 48, minWidth: 200, paddingHorizontal: 28, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: GOLD },
});
