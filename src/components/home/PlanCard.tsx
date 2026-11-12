// HOME, one glass card for one thing to do: its small label, its name (the surah and ayat, say) in large type, a quiet line under it,
// and along the bottom its percentage with a thin progress bar that draws itself in once. A round arrow button sits at the far end;
// a tap anywhere on the card goes on to where the work is. Reading, Memorization and Revision are all this card.
// Rows run left to right on the screen in every language (ltr()), so in Arabic the text is at the right and the arrow at the left.
import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/home/Glass';
import { Grow } from '@/components/home/Grow';
import { ArrowIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { ltr, ltrStart } from '@/theme/ltr';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

type Props = {
  label: string;
  title: string;
  sub?: string;
  percent?: number | null; // 0 to 100; null or left out: no bar (nothing to measure yet)
  action?: string; // a solid button-pill under the words (first-run cards): what a tap does
  arrow?: boolean; // the round arrow button (default on); off for the first-run invitations, which are words only
  onPress: () => void;
  a11y: string;
};

const digits = (n: number) => n.toLocaleString('en');

export function PlanCard({ label, title, sub, percent = null, arrow: showArrow = true, action, onPress, a11y }: Props) {
  const k = useSkin();
  const ar = LANG === 'ar';
  const pct = percent == null ? 0 : Math.round(percent);

  const arrow = (
    <View key="arrow" style={[styles.go, { backgroundColor: k.glassBtn }]}>
      <ArrowIcon color={k.pageInk} rtl={ar} size={20} />
    </View>
  );
  const words = (
    <View key="words" style={styles.words}>
      <Txt size={12} weight={700} color={k.meta} style={ltrStart()}>
        {label}
      </Txt>
      <Txt size={18} weight={700} lineHeight={26} color={k.pageInk} numberOfLines={2} style={ltrStart()}>
        {title}
      </Txt>
      {!!sub && (
        <Txt size={12} weight={500} color={k.meta} numberOfLines={2} style={ltrStart()}>
          {sub}
        </Txt>
      )}
    </View>
  );
  const figure = (
    <Txt key="figure" size={13} weight={700} color={k.pageInk} style={styles.figure}>
      {`${digits(pct)}%`}
    </Txt>
  );
  const track = (
    <View key="track" style={[styles.track, ltr(), { backgroundColor: k.glassTrack, justifyContent: ar ? 'flex-end' : 'flex-start' }]}>
      {pct > 0 && <Grow axis="x" to={Math.max(pct, 4) / 100} delay={300} style={[styles.fill, { backgroundColor: k.hue, shadowColor: k.glow, shadowOpacity: k.glowOpacity, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }]} />}
    </View>
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={({ pressed }) => pressed && { transform: [{ scale: 0.985 }] }}>
      <Glass style={styles.card}>
        <View style={[styles.head, ltr()]}>{!showArrow ? words : ar ? [arrow, words] : [words, arrow]}</View>
        {!!action && (
          <View style={[styles.pill, { backgroundColor: k.goBg }]}>
            <Txt size={15} weight={700} color={k.goInk}>
              {action}
            </Txt>
          </View>
        )}
        {percent != null && <View style={[styles.meter, ltr()]}>{ar ? [figure, track] : [track, figure]}</View>}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 2 },
  go: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 12px rgba(20, 50, 38, 0.10)' },
  pill: { alignSelf: 'stretch', height: 40, borderRadius: 20, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  meter: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  figure: { minWidth: 34 },
  track: { flex: 1, height: 6, borderRadius: 3, flexDirection: 'row' },
  fill: { height: '100%', borderRadius: 3 },
});
