// «What I've memorized»: the page behind the ring (memorizedHTML of the website). Marks go straight into the
// ledger as you tap, so there is no Save button; `refresh()` redraws the ring and the cards behind it.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useMemo } from 'react';
import { View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import { MemorizedPicker } from '@/components/hifdh/MemorizedPicker';
import { Hint } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

export function MemorizedScreen() {
  const { c } = useTheme();
  const { rev, refresh } = useHif();
  // the ledger as one 0/1 per ayah, rebuilt after every change (`rev`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bits = useMemo(() => core.rangesToBits(plan.get().ledger, plan.units().N), [rev]);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Txt size={22} weight={700} color={c.ink}>
          {HIF.memorizedQuestion()}
        </Txt>
        <Txt size={14} color={c.meta}>
          {HIF.memorizedSub()}
        </Txt>
      </View>
      <MemorizedPicker
        quick
        bits={bits}
        onSet={(from, to, on) => {
          if (on) plan.setNothingMemorized(false);
          plan.setLedger([[from, to]], on);
          refresh();
        }}
      />
      <Hint>{HIF.autoSaved()}</Hint>
    </View>
  );
}
