// «Memorization» (الحفظ): the Plan screen of the Hifdh page, and the screens inside it. 3a: the head and the
// plan's summary (the week, the memorized ring, today's heading). 3b: the daily cards (today's memorization,
// the congratulation card once today is done, revision). 3c-1: «what I've memorized» (the ring opens it). 3c-2: the plan setup and edit
// (`PlanSetup`, opened by «Set up my plan» / «Start a revision plan»). 3c-3: «My plans» (`PlansList`, with modify / pause /
// delete / add plan), opened from the tile under the cards; editing a plan returns there.
// Listen (`ListenScreen`, the 'listen' view) opens from the Listen tab or a row's listen button and steps back here.
// «History» (`HistoryScreen`, the tile under the cards) lists the past days. Recite (`ReciteScreen`, the 'recite' view) hides the mushaf page and shows it back an ayah or a word at a time (the tab opens it).
// `rev` (in HifProvider) goes up after every mark, so the summary and the cards redraw.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { ActivityIndicator, BackHandler, ScrollView, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HifHeader } from '@/components/hifdh/HifHeader';
import { ListenScreen } from '@/components/hifdh/ListenScreen';
import { HistoryScreen, ProgressSection } from '@/components/hifdh/HistoryScreen';
import { HifTabs, TABS_HEIGHT } from '@/components/hifdh/HifTabs';
import { HifProvider, useHif, type PlanType } from '@/components/hifdh/HifProvider';
import { MemorizedScreen } from '@/components/hifdh/MemorizedScreen';
import { PlansList } from '@/components/hifdh/PlansList';
import { PlanSetup } from '@/components/hifdh/PlanSetup';
import { PlanSummary } from '@/components/hifdh/PlanSummary';
import { ReciteScreen } from '@/components/hifdh/ReciteScreen';
import { RevisionCard } from '@/components/hifdh/RevisionCard';
import { TodayCard } from '@/components/hifdh/TodayCard';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { markToday } from '@/lib/activity';
import { startKey } from '@/lib/hifdh/listen';
import * as plan from '@/lib/hifdh/plan';
import { HifTheme, useTheme } from '@/theme/theme';

type Load = 'loading' | 'ready' | 'failed';
// The screens inside the page: the plan (home), what I've memorized, My plans, and the plan setup / edit.
type Screen = 'home' | 'memorized' | 'plans' | 'pace' | 'listen' | 'history' | 'recite';
// What the plan setup was opened for: a new plan of a type (or none: ask), or an existing plan to edit.
type Setup = { type: PlanType | null; id: string | null; from: Screen }; // `from`: where to go back to

function Content({
  view,
  setup,
  go,
  open,
  exit,
  listenAt,
  reciteSegs,
  onRecite,
}: {
  view: Screen;
  setup: Setup;
  go: (v: Screen) => void;
  open: (s: Omit<Setup, 'from'>) => void;
  exit: () => void;
  listenAt: string | null; // the ayah Listen opens at
  reciteSegs: number[][] | null; // the portion Recite opens on
  onRecite: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { listen } = useHif(); // subscribing here redraws the whole screen (summary and cards) when `rev` changes

  // the phone's back button steps out of a screen inside the page before it leaves the page
  // (the plan setup has its own: it steps back through its questions first)
  useEffect(() => {
    if (view !== 'memorized' && view !== 'plans' && view !== 'history') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => (go('home'), true));
    return () => sub.remove();
  }, [view, go]);

  if (view === 'listen') return <ListenScreen start={listenAt} onBack={() => go('home')} />;
  if (view === 'recite') return <ReciteScreen segs={reciteSegs} onBack={() => go('home')} />;
  if (view === 'pace') return <PlanSetup type={setup.type} id={setup.id} onExit={exit} />;

  const pad = { padding: 16, paddingBottom: insets.bottom + 32, gap: 14 };
  return (
    <View style={{ flex: 1 }}>
      <HifHeader big={view === 'home'} title={view === 'memorized' ? HIF.memorizedTitle() : view === 'plans' ? HIF.myPlans() : view === 'history' ? HIF.progress() : HIF.title()} onBack={view === 'home' ? undefined : () => go('home')} />
      {view === 'memorized' ? (
        <ScrollView contentContainerStyle={pad} keyboardShouldPersistTaps="handled">
          <MemorizedScreen />
        </ScrollView>
      ) : view === 'history' ? (
        <ScrollView contentContainerStyle={pad}>
          <HistoryScreen />
        </ScrollView>
      ) : view === 'plans' ? (
        <ScrollView contentContainerStyle={pad}>
          <PlansList onEdit={(id) => open({ type: null, id })} onAdd={() => open({ type: null, id: null })} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ ...pad, paddingBottom: pad.paddingBottom + TABS_HEIGHT }}>
          <PlanSummary />
          <TodayCard />
          <RevisionCard />
          <ProgressSection onPress={() => go('history')} />
        </ScrollView>
      )}
      {view === 'home' && <HifTabs onPlans={() => go('plans')} onListen={() => listen(null)} onRecite={onRecite} />}
    </View>
  );
}

export default function Memorize() {
  return (
    <HifTheme>
      <MemorizePage />
    </HifTheme>
  );
}

function MemorizePage() {
  const { c } = useTheme();
  const [load, setLoad] = useState<Load>('loading');
  const [view, setView] = useState<Screen>('home');
  const [listenAt, setListenAt] = useState<string | null>(null);
  const [reciteSegs, setReciteSegs] = useState<number[][] | null>(null);
  const [setup, setSetup] = useState<Setup>({ type: null, id: null, from: 'home' });

  // opening it counts today in the streak (the flame on the home screen), as the Quran and the wird do
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

  const open = useCallback((s: Omit<Setup, 'from'>) => {
    setSetup({ ...s, from: view });
    setView('pace');
  }, [view]);
  const startPlan = useCallback((type: PlanType) => open({ type, id: null }), [open]);
  // «Listen»: open it at the first ayah of a portion (today's first one when none is given)
  const openListen = useCallback(
    (row: { segs?: number[][] } | null) => {
      const r = row ?? (plan.todayRows() as { segs?: number[][] }[]).find((x) => x.segs?.length);
      setListenAt(startKey(r?.segs?.[0]?.[0] ?? null));
      setView('listen');
    },
    [],
  );
  // «Recite»: opens on today's first portion (none: the page last read)
  const openRecite = useCallback(() => {
    const r = (plan.todayRows() as { segs?: number[][] }[]).find((x) => x.segs?.length);
    setReciteSegs(r?.segs ?? null);
    setView('recite');
  }, []);
  const exit = useCallback(() => setView(setup.from), [setup.from]); // back to where it was opened (home or My plans)

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      {load !== 'ready' && <HifHeader title={HIF.title()} />}
      {load === 'loading' && <ActivityIndicator color={c.meta} style={{ marginTop: 40 }} />}
      {load === 'failed' && (
        <Txt size={14} center color={c.meta} style={{ marginTop: 40 }}>
          {HIF.loadFailed()}
        </Txt>
      )}
      {load === 'ready' && (
        <HifProvider onStartPlan={startPlan} onListen={openListen} onMemorized={() => (plan.markMemorizedAsked(), setView('memorized'))}>
          <Content view={view} setup={setup} go={setView} open={open} exit={exit} listenAt={listenAt} reciteSegs={reciteSegs} onRecite={openRecite} />
        </HifProvider>
      )}
    </View>
  );
}
