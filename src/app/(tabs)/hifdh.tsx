// HIFDH tab: one screen with a segmented control, Today / Plan / Progress (no second bar).
//   Today     the week, today's portions (memorization) and the revision; each portion has a listen and a recite button
//             that open the Quran page in that mode on the portion's ayat (see the Quran tab's params)
//   Plan      My plans (modify / pause / delete / add) and «What I've memorized»
//   Progress  how far the plans are, and the past days
// Two screens open over it and step back to it: the plan setup (PlanSetup) and «What I've memorized».
// The data and logic are src/lib/hifdh (unchanged); `rev` in HifProvider redraws the cards after every mark.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HifHeader } from '@/components/hifdh/HifHeader';
import { HistoryScreen, ProgressSection } from '@/components/hifdh/HistoryScreen';
import { HifProvider, useHif, type PlanType } from '@/components/hifdh/HifProvider';
import { MemorizedScreen } from '@/components/hifdh/MemorizedScreen';
import { PlansList } from '@/components/hifdh/PlansList';
import { PlanSetup } from '@/components/hifdh/PlanSetup';
import { PlanSummary } from '@/components/hifdh/PlanSummary';
import { RevisionCard } from '@/components/hifdh/RevisionCard';
import type { Row } from '@/components/hifdh/StopSheet';
import { TodayCard } from '@/components/hifdh/TodayCard';
import { Txt } from '@/components/Txt';
import { SegmentedControl } from '@/components/ui';
import { HIF } from '@/i18n/hifdh';
import { markToday } from '@/lib/activity';
import { displayKeys } from '@/lib/ayahmap';
import { keyOf } from '@/lib/hifdh';
import * as plan from '@/lib/hifdh/plan';
import { keysOfSegs } from '@/lib/hifdh/recite';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Load = 'loading' | 'ready' | 'failed';
type Seg = 'today' | 'plan' | 'progress';
type Screen = 'tabs' | 'memorized' | 'pace';
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

function Content({ screen, setScreen, seg, setSeg, setup, open, exit }: { screen: Screen; setScreen: (s: Screen) => void; seg: Seg; setSeg: (s: Seg) => void; setup: Setup; open: (s: Setup) => void; exit: () => void }) {
  const insets = useSafeAreaInsets();
  const home = useHome();
  useHif(); // subscribing here redraws the whole screen when `rev` changes

  // the phone's back button steps out of «What I've memorized» (the plan setup has its own: it steps back through its questions)
  useEffect(() => {
    if (screen !== 'memorized') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (setScreen('tabs'), true));
    return () => sub.remove();
  }, [screen, setScreen]);

  if (screen === 'pace') return <PlanSetup type={setup.type} id={setup.id} onExit={exit} />;

  const pad = { padding: space.md, paddingBottom: space.lg + space.md, gap: 16 };
  if (screen === 'memorized') {
    return (
      <View style={{ flex: 1 }}>
        <HifHeader title={HIF.memorizedTitle()} onBack={() => setScreen('tabs')} />
        <ScrollView contentContainerStyle={pad} keyboardShouldPersistTaps="handled">
          <MemorizedScreen />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: insets.top + space.sm, paddingBottom: space.sm, gap: space.md }}>
        <Txt size={28} weight={800} lineHeight={36} color={home.ink} numberOfLines={1}>
          {HIF.title()}
        </Txt>
        <SegmentedControl
          pill
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'today', label: HIF.segToday() },
            { value: 'plan', label: HIF.segPlan() },
            { value: 'progress', label: HIF.progress() },
          ]}
        />
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

export default function HifdhTab() {
  const { c } = useTheme();
  const home = useHome();
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
    <View style={{ flex: 1, backgroundColor: home.screen }}>
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
          onMemorized={() => (plan.markMemorizedAsked(), setScreen('memorized'))}
        >
          <Content screen={screen} setScreen={setScreen} seg={seg} setSeg={setSeg} setup={setup} open={open} exit={exit} />
        </HifProvider>
      )}
    </View>
  );
}
