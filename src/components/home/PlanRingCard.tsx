// HOME, the memorization and revision cards: the plan's small label, its name in large type, its pace under it and one more line
// (memorized so far, or what today holds), with the progress ring at the far end. A tap anywhere goes on to the Hifdh tab.
// Rows run left to right on the screen in every language (ltr()), so in Arabic the words are at the right and the ring at the left.
import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/home/Glass';
import { HomeRing } from '@/components/home/HomeRing';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import type { PlanCardView } from '@/lib/planCard';
import { ltr, ltrStart } from '@/theme/ltr';
import { useSkin } from '@/theme/homeSkin';
import { space } from '@/theme/tokens';

type Props = PlanCardView & { label: string; onPress: () => void; a11y: string };

export function PlanRingCard({ label, title, pace, foot, percent, onPress, a11y }: Props) {
  const k = useSkin();
  const ring = <HomeRing key="ring" percent={percent} />;
  const words = (
    <View key="words" style={styles.words}>
      <Txt size={12} weight={700} color={k.meta} style={ltrStart()}>
        {label}
      </Txt>
      <Txt size={20} weight={800} lineHeight={28} color={k.pageInk} numberOfLines={2} style={ltrStart()}>
        {title}
      </Txt>
      <Txt size={12} weight={500} color={k.meta} numberOfLines={2} style={ltrStart()}>
        {pace}
      </Txt>
      <Txt size={13} weight={700} color={k.pageInk} numberOfLines={2} style={[ltrStart(), styles.foot]}>
        {foot}
      </Txt>
    </View>
  );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={({ pressed }) => pressed && { transform: [{ scale: 0.985 }] }}>
      <Glass gradient style={styles.card}>
        <View style={[styles.row, ltr()]}>{LANG === 'ar' ? [ring, words] : [words, ring]}</View>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  words: { flex: 1, gap: 2 },
  foot: { marginTop: space.sm },
});
