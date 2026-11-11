// The tajweed guide (the website's «أحكام التجويد» window): the colour rules of the mushaf being read, explained step
// by step - the colour legend, how to read the colours, then each rule with when it applies, how to read it and
// examples from the Quran with the coloured part marked. A strip of tabs at the top jumps to a section and follows the
// section being read. Opened by a tap on the colour legend at the foot of any page, or by the Tajweed button in the
// reading bar. The content is src/lib/tajweed/ (Warsh or Hafs, as the reader reads).
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { LANG, L, t } from '@/i18n/i18n';
import { forDisplay } from '@/lib/search';
import { guideSub, legend, sections } from '@/lib/tajweed';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

type Rule = { color: string; name: string; length: string; when: string; how: string; examples: string[][] };
type Section = {
  id: string;
  title: string;
  intro?: string;
  steps?: string[][];
  rules?: Rule[];
  features?: string[][];
  note?: string;
};

const SECTIONS = sections as Section[];
const rtl = LANG === 'ar';

// «plain, coloured, plain, ...»: every second part in the rule's colour
function Example({ parts, color }: { parts: string[]; color: string }) {
  const { c } = useTheme();
  return (
    <Txt serif size={24} lineHeight={44} color={c.text} style={{ textAlign: textSide('right'), writingDirection: 'rtl' }}>
      {parts.map((part, i) => (
        <Txt key={i} serif size={24} lineHeight={44} color={i % 2 ? color : c.text}>
          {forDisplay(part)}
        </Txt>
      ))}
    </Txt>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.soft, borderStartColor: rule.color }]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: rule.color }]} />
        <Txt size={16} weight={700} color={c.ink} style={{ flex: 1 }}>
          {rule.name}
        </Txt>
        <Txt size={12.5} weight={700} color={c.meta}>
          {rule.length}
        </Txt>
      </View>
      <Txt size={14} weight={700} color={c.meta}>
        {t('tjWhen')}
      </Txt>
      <Txt size={15} lineHeight={25} color={c.text} style={{ textAlign: textSide(rtl ? 'right' : 'left') }}>
        {rule.when}
      </Txt>
      <Txt size={14} weight={700} color={c.meta}>
        {t('tjHow')}
      </Txt>
      <Txt size={15} lineHeight={25} color={c.text} style={{ textAlign: textSide(rtl ? 'right' : 'left') }}>
        {rule.how}
      </Txt>
      <View style={{ gap: 2, marginTop: 4 }}>
        {rule.examples.map((e, i) => (
          <Example key={i} parts={e} color={rule.color} />
        ))}
      </View>
    </View>
  );
}

export function TajweedGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [rise] = useState(() => new Animated.Value(0));
  const [active, setActive] = useState(SECTIONS[0].id);
  const body = useRef<ScrollViewInstance>(null);
  const tabs = useRef<ScrollViewInstance>(null);
  const tabX = useRef<Record<string, { x: number; w: number }>>({});
  const tops = useRef<Record<string, number>>({}); // each section's top inside the scrolled content
  const locked = useRef(false); // a tab was just tapped: let its own scroll finish first
  const sheetH = Math.round(height * 0.9);

  useEffect(() => {
    if (open) Animated.timing(rise, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [open, rise]);
  const close = () => Animated.timing(rise, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());

  const goTo = (id: string) => {
    locked.current = true;
    setTimeout(() => (locked.current = false), 900);
    setActive(id);
    body.current?.scrollTo({ y: Math.max(0, (tops.current[id] ?? 0) - 6), animated: true });
  };
  // the tab of the section being read follows the scroll (the last section whose top passed a line 35% down)
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (locked.current) return;
    const line = e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height * 0.35;
    let found = SECTIONS[0].id;
    for (const s of SECTIONS) if ((tops.current[s.id] ?? 0) <= line) found = s.id;
    if (found !== active) {
      setActive(found);
      const tab = tabX.current[found];
      if (tab) tabs.current?.scrollTo({ x: Math.max(0, tab.x - 40), animated: true });
    }
  };

  const textAlign = textSide(rtl ? 'right' : 'left');

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.dim, opacity: rise }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={L('رجوع', 'Back', 'Retour')} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetH, backgroundColor: c.panel, paddingBottom: insets.bottom + 8, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [sheetH, 0] }) }] },
        ]}
      >
        <View style={[styles.grip, { backgroundColor: c.line }]} />
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Txt size={18} weight={700} color={c.ink} numberOfLines={1}>
              {t('tajweed')}
            </Txt>
            <Txt size={13} color={c.meta} numberOfLines={1}>
              {guideSub}
            </Txt>
          </View>
          <Pressable onPress={close} style={[styles.round, { backgroundColor: c.soft }]} accessibilityLabel={L('إغلاق', 'Close', 'Fermer')}>
            <CloseIcon color={c.ink} size={20} />
          </Pressable>
        </View>

        <ScrollView ref={tabs} horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={t('tjSections')} style={styles.tabs} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => goTo(s.id)}
              onLayout={(e) => (tabX.current[s.id] = { x: e.nativeEvent.layout.x, w: e.nativeEvent.layout.width })}
              style={[styles.tab, { backgroundColor: active === s.id ? c.on : c.soft }]}
            >
              <Txt size={14} weight={active === s.id ? 700 : 500} color={active === s.id ? c.onInk : c.tabInk}>
                {s.title}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView ref={body} style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 14, gap: 26 }} onScroll={onScroll} scrollEventThrottle={32}>
          {SECTIONS.map((s) => (
            <View key={s.id} style={{ gap: 12 }} onLayout={(e) => (tops.current[s.id] = e.nativeEvent.layout.y)}>
              <Txt size={19} weight={700} color={c.ink} style={{ textAlign }}>
                {s.title}
              </Txt>
              {!!s.intro && (
                <Txt size={15} lineHeight={25} color={c.text} style={{ textAlign }}>
                  {s.intro}
                </Txt>
              )}
              {s.id === 'colors' && (
                <View style={{ gap: 8 }}>
                  {legend.map((l) => (
                    <View key={l.name} style={styles.row}>
                      <View style={[styles.dot, { backgroundColor: l.color }]} />
                      <Txt size={15} weight={700} color={c.ink} style={{ flex: 1 }}>
                        {l.name}
                      </Txt>
                      <Txt size={13} color={c.meta}>
                        {l.length}
                      </Txt>
                    </View>
                  ))}
                </View>
              )}
              {s.steps?.map(([title, text], i) => (
                <View key={i} style={styles.row}>
                  <View style={[styles.num, { backgroundColor: c.soft }]}>
                    <Txt size={13} weight={700} color={c.ink} center>
                      {i + 1}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size={15} weight={700} color={c.ink} style={{ textAlign }}>
                      {title}
                    </Txt>
                    <Txt size={14} lineHeight={22} color={c.meta} style={{ textAlign }}>
                      {text}
                    </Txt>
                  </View>
                </View>
              ))}
              {s.rules?.map((r) => <RuleCard key={r.name} rule={r} />)}
              {s.features?.map(([title, text, example]) => (
                <View key={title} style={[styles.card, { backgroundColor: c.soft, borderStartColor: c.line }]}>
                  <Txt size={16} weight={700} color={c.ink} style={{ textAlign }}>
                    {title}
                  </Txt>
                  <Txt size={15} lineHeight={25} color={c.text} style={{ textAlign }}>
                    {text}
                  </Txt>
                  <Example parts={[example]} color={c.text} />
                </View>
              ))}
              {!!s.note && (
                <Txt size={14} lineHeight={23} color={c.meta} style={{ textAlign }}>
                  {s.note}
                </Txt>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 6 },
  round: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexGrow: 0 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  card: { gap: 4, padding: 14, borderRadius: 16, borderStartWidth: 4 },
});
