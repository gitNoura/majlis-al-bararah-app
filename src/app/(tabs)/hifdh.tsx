// HIFDH tab: one screen with a segmented control, Today / Plan / Progress (no second bar).
//   Today     the week, today's portions (memorization) and the revision; each portion has a listen and a recite button
//             that open the Quran page in that mode on the portion's ayat (see the Quran tab's params)
//   Plan      My plans (modify / pause / delete / add)
//   Progress  how far the plans are, and the past days
// One screen opens over it and steps back to it: the plan setup (PlanSetup).
// The data and logic are src/lib/hifdh (unchanged); `rev` in HifProvider redraws the cards after every mark.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_H } from '@/components/ui/TabBar';
import { HifdhTint } from '@/theme/home';

import { HomeBackdrop } from '@/components/home/HomeBackdrop';
import { HistoryScreen, ProgressSection } from '@/components/hifdh/HistoryScreen';
import { HifProvider, useHif, type PlanType } from '@/components/hifdh/HifProvider';
import { PlansList } from '@/components/hifdh/PlansList';
import { PlanSetup } from '@/components/hifdh/PlanSetup';
import { PlanSummary } from '@/components/hifdh/PlanSummary';
import { RevisionCard } from '@/components/hifdh/RevisionCard';
import type { Row } from '@/components/hifdh/StopSheet';
import { TodayCard } from '@/components/hifdh/TodayCard';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { markToday } from '@/lib/activity';
import { displayKeys } from '@/lib/ayahmap';
import { keyOf } from '@/lib/hifdh';
import * as plan from '@/lib/hifdh/plan';
import { keysOfSegs } from '@/lib/hifdh/recite';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Load = 'loading' | 'ready' | 'failed';
type Seg = 'today' | 'plan' | 'progress';
type Screen = 'tabs' | 'pace';
type Setup = { type: PlanType | null; id: string | null };

// Opens the Quran page in Listen or Recite on a portion (none: today's first one). The page reads the params.
function openQuran(mode: 'listen' | 'recite', row: Row | null) {
  const r = row ?? (plan.todayRows() as Row[]).find((x) => x.segs?.length);
  const keys: string[] = r?.segs?.length ? keysOfSegs(r.segs, keyOf, displayKeys) : [];
  router.navigate({
    pathname: '/quran',
    params: { mode, from: keys[0] ?? '', to: keys[keys.length - 1] ?? '', back: 'hifdh', n: String(Date.now()) },
  });
}

function Content({ screen, seg, setSeg, setup, open, exit }: { screen: Screen; seg: Seg; setSeg: (s: Seg) => void; setup: Setup; open: (s: Setup) => void; exit: () => void }) {
  const insets = useSafeAreaInsets();
  const k = useSkin();
  useHif(); // subscribing here redraws the whole screen when `rev` changes

  if (screen === 'pace') return <View style={{ flex: 1, paddingBottom: TAB_BAR_H + insets.bottom }}><PlanSetup type={setup.type} id={setup.id} onExit={exit} /></View>;

  const pad = { padding: space.md, paddingBottom: TAB_BAR_H + insets.bottom + space.md, gap: space.md };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: insets.top + space.lg, paddingBottom: space.sm, gap: space.md }}>
        <Txt {...T.greeting} size={26} lineHeight={34} color={k.ink} numberOfLines={1}>
          {HIF.title()}
        </Txt>
        <View style={[styles.tabs, { backgroundColor: k.well }]} accessibilityRole="tablist">
          {(
            [
              ['today', HIF.segToday()],
              ['plan', HIF.segPlan()],
              ['progress', HIF.progress()],
            ] as [Seg, string][]
          ).map(([v, label]) => (
            <Pressable key={v} onPress={() => setSeg(v)} accessibilityRole="tab" accessibilityState={{ selected: seg === v }} style={[styles.tab, seg === v && { backgroundColor: k.glass, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.14)' }]}>
              <Txt {...T.button} size={14} weight={seg === v ? 700 : 500} color={seg === v ? k.ink : k.meta}>
                {label}
              </Txt>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={pad} keyboardShouldPersistTaps="handled">
        {seg === 'today' && (
          <>
            <PlanSummary />
            <TodayCard />
            <RevisionCard />
          </>
        )}
        {seg === 'plan' && <PlansList onEdit={(id) => open({ type: null, id })} onAdd={() => open({ type: null, id: null })} />}
        {seg === 'progress' && (
          <>
            <ProgressSection plain onPress={() => {}} />
            <HistoryScreen />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// the Hifdh tab: Home's look in dark mode; in light mode Home's too but with neutral greys instead of pale green (see HifdhTint)
export default function HifdhTab() {
  return (
    <HifdhTint>
      <HifdhScreen />
    </HifdhTint>
  );
}

function HifdhScreen() {
  const { c } = useTheme();
  const k = useSkin();
  const [load, setLoad] = useState<Load>('loading');
  const [screen, setScreen] = useState<Screen>('tabs');
  const [seg, setSeg] = useState<Seg>('today');
  const [setup, setSetup] = useState<Setup>({ type: null, id: null });

  // opening it counts today in the streak, as the Quran and the wird do
  useEffect(() => markToday('quran'), []);

  useEffect(() => {
    let live = true;
    plan
      .ready()
      .then(() => live && setLoad('ready'))
      .catch(() => live && setLoad('failed'));
    return () => {
      live = false;
    };
  }, []);

  const open = useCallback((s: Setup) => {
    setSetup(s);
    setScreen('pace');
  }, []);
  const startPlan = useCallback((type: PlanType) => open({ type, id: null }), [open]);
  const exit = useCallback(() => setScreen('tabs'), []); // back to the segment it was opened from

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <HomeBackdrop />
      {load === 'loading' && <ActivityIndicator color={c.meta} style={{ marginTop: 80 }} />}
      {load === 'failed' && (
        <Txt size={14} center color={c.meta} style={{ marginTop: 80 }}>
          {HIF.loadFailed()}
        </Txt>
      )}
      {load === 'ready' && (
        <HifProvider
          onStartPlan={startPlan}
          onListen={(row) => openQuran('listen', row)}
          onRecite={(row) => openQuran('recite', row)}
        >
          <Content screen={screen} seg={seg} setSeg={setSeg} setup={setup} open={open} exit={exit} />
        </HifProvider>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderRadius: 16, borderCurve: 'continuous', padding: 3 },
  tab: { flex: 1, minHeight: 38, borderRadius: 13, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
