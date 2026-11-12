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
import { ltr } from '@/theme/ltr';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

type Props = {
  label: string;
  title: string;
  sub?: string;
  percent?: number | null; // 0 to 100; null or left out: no bar (nothing to measure yet)
  onPress: () => void;
  a11y: string;
};

const digits = (n: number) => n.toLocaleString('en');

export function PlanCard({ label, title, sub, percent = null, onPress, a11y }: Props) {
  const k = useSkin();
  const ar = LANG === 'ar';
  const pct = percent == null ? 0 : Math.round(percent);

  const arrow = (
    <View key="arrow" style={[styles.go, { backgroundColor: k.glassBtn, borderColor: k.glassEdge }]}>
      <ArrowIcon color={k.pageInk} rtl={ar} />
    </View>
  );
  const words = (
    <View key="words" style={styles.words}>
      <Txt size={12} weight={700} color={k.meta}>
        {label}
      </Txt>
      <Txt size={22} weight={800} lineHeight={32} color={k.pageInk} numberOfLines={2}>
        {title}
      </Txt>
      {!!sub && (
        <Txt size={13} weight={500} color={k.meta} numberOfLines={2}>
          {sub}
        </Txt>
      )}
    </View>
  );
  const figure = (
    <Txt key="figure" size={14} weight={700} color={k.pageInk} style={styles.figure}>
      {`${digits(pct)}%`}
    </Txt>
  );
  const track = (
    <View key="track" style={[styles.track, ltr(), { backgroundColor: k.glassTrack, justifyContent: ar ? 'flex-end' : 'flex-start' }]}>
      {pct > 0 && <Grow axis="x" to={Math.max(pct, 4) / 100} delay={300} style={[styles.fill, { backgroundColor: k.spark }]} />}
    </View>
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      <Glass style={styles.card}>
        <View style={[styles.head, ltr()]}>{ar ? [arrow, words] : [words, arrow]}</View>
        {percent != null && <View style={[styles.meter, ltr()]}>{ar ? [figure, track] : [track, figure]}</View>}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 2 },
  go: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 12px rgba(20, 50, 38, 0.10)' },
  meter: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  figure: { minWidth: 36 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', flexDirection: 'row' },
  fill: { height: '100%', borderRadius: 3 },
});
