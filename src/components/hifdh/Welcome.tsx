// The first time on the Hifdh page (no plan yet): what the page is for, how it works in three steps, one clear
// button to start, and the two things that can be done without a plan (listen, record what is memorized).
// The web page had no such screen: it opened on an empty week card and a bare «Set up my plan».
import { Pressable, StyleSheet, View } from 'react-native';

import { BookOpenIcon, PlayIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isEnglish, isFrench } from '@/i18n/i18n';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Props = { onSetup: () => void; onListen: () => void; onMemorized: () => void };

function Tile({ icon, title, body, onPress }: { icon: React.ReactNode; title: string; body: string; onPress: () => void }) {
  const { c } = useTheme();
  const rtl = !isEnglish && !isFrench;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.tile, { backgroundColor: c.card, borderColor: c.line }]}>
      <View style={[styles.badge, { backgroundColor: c.soft }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Txt size={16} weight={700} color={c.ink}>
          {title}
        </Txt>
        <Txt size={13} color={c.meta}>
          {body}
        </Txt>
      </View>
      <Txt size={22} color={c.meta} style={rtl ? { transform: [{ scaleX: -1 }] } : undefined}>
        ›
      </Txt>
    </Pressable>
  );
}

export function Welcome({ onSetup, onListen, onMemorized }: Props) {
  const { c } = useTheme();
  const steps = [
    { title: HIF.how1(), body: HIF.how1d() },
    { title: HIF.how2(), body: HIF.how2d() },
    { title: HIF.how3(), body: HIF.how3d() },
  ];
  return (
    <View style={{ gap: 16 }}>
      <View style={[styles.hero, { backgroundColor: c.on }]}>
        <Txt serif size={27} weight={700} color={c.onInk} lineHeight={42}>
          {HIF.welcomeTitle()}
        </Txt>
        <Txt size={15} color="rgba(255, 255, 255, 0.84)">
          {HIF.welcomeSub()}
        </Txt>
        <Pressable onPress={onSetup} accessibilityRole="button" style={[styles.cta, { backgroundColor: c.gold }]}>
          <Txt size={16.5} weight={700} color="#173f32">
            {HIF.setUpPlan()}
          </Txt>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
        <Txt serif size={18} weight={700} color={c.ink}>
          {HIF.howTitle()}
        </Txt>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={[styles.num, { backgroundColor: c.soft, borderColor: c.chosenLine }]}>
              <Txt size={14} weight={700} color={c.ink}>
                {String(i + 1)}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={15.5} weight={700} color={c.ink}>
                {s.title}
              </Txt>
              <Txt size={13.5} color={c.meta}>
                {s.body}
              </Txt>
            </View>
          </View>
        ))}
      </View>

      <Txt serif size={18} weight={700} color={c.ink} style={{ marginTop: 2 }}>
        {HIF.alsoHere()}
      </Txt>
      <Tile icon={<PlayIcon color={c.ink} size={20} />} title={HIF.tabListen()} body={HIF.listenTile()} onPress={onListen} />
      <Tile icon={<BookOpenIcon color={c.ink} size={20} />} title={HIF.memorizedTitle()} body={HIF.memorizedTile()} onPress={onMemorized} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 26, padding: 22, gap: 12 },
  cta: { minHeight: 54, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  num: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  badge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
