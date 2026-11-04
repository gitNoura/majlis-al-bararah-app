// What the daily cards share: `rev` (bumped after every mark or plan change, so the summary and the cards
// redraw), the toast, the confetti, and the «where did you stop?» sheet. memorize.tsx wraps the screen in it.
// `startPlan` is the door to the plan setup, `listen` the door to Listen; each says «coming soon» when memorize.tsx gives none.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { useConfetti, type BurstOptions } from '@/components/hifdh/Confetti';
import { StopSheet, type Row } from '@/components/hifdh/StopSheet';
import { useToast } from '@/components/hifdh/Toast';
import { HIF } from '@/i18n/hifdh';
import { HOME } from '@/i18n/home';
import { available } from '@/lib/hifdh/listen';
import * as plan from '@/lib/hifdh/plan';

export type PlanType = 'memorize' | 'revise';

type Hif = {
  rev: number;
  refresh: () => void;
  toast: (text: string) => void;
  burst: (x?: number, y?: number, o?: BurstOptions) => void;
  openStop: (row: Row | null) => void;
  startPlan: (type: PlanType) => void;
  listen: (row: Row | null) => void;
};

const Ctx = createContext<Hif | null>(null);

export function useHif() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHif must be used inside HifProvider');
  return v;
}

export function HifProvider({
  children,
  onStartPlan,
  onListen,
}: {
  children: ReactNode;
  onStartPlan?: (type: PlanType) => void; // 3c: opens the plan setup
  onListen?: (row: Row | null) => void; // 3b: opens Listen at a portion (null: today's first one)
}) {
  const [rev, setRev] = useState(0);
  const [stopRow, setStopRow] = useState<Row | null>(null);
  const { toast, node: toastNode } = useToast();
  const { burst, node: confettiNode } = useConfetti();

  const refresh = useCallback(() => setRev((n) => n + 1), []);
  const comingSoon = useCallback(() => toast(HOME.coming()), [toast]);

  const pick = useCallback(
    (g: number) => {
      const row = stopRow;
      if (!row) return;
      plan.mark(row, 'partial', row.week != null ? { stop: g, day: plan.today() } : { stop: g });
      setStopRow(null);
      toast(HIF.stopSaved());
      refresh();
    },
    [stopRow, toast, refresh],
  );

  const value = useMemo<Hif>(
    () => ({
      rev,
      refresh,
      toast,
      burst,
      openStop: setStopRow,
      startPlan: onStartPlan ?? comingSoon,
      listen: (row) => (!onListen ? comingSoon() : available().length ? onListen(row) : toast(HIF.lsWarshSoon())), // Warsh has no reciter yet
    }),
    [rev, refresh, toast, burst, onStartPlan, onListen, comingSoon],
  );

  return (
    <Ctx.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <StopSheet row={stopRow} onPick={pick} onClose={() => setStopRow(null)} />
        {confettiNode}
        {toastNode}
      </View>
    </Ctx.Provider>
  );
}
