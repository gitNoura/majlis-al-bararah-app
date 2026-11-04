// «Memorization» (الحفظ): the Plan screen of the Hifdh page. 3a: the head and the plan's summary (the
// week, the memorized ring, today's heading). Still to come: the daily cards (3b) and the plan setup,
// edit and plans list (3c). Listen and Test are separate pages, not part of this screen.
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HifHeader } from '@/components/hifdh/HifHeader';
import { PlanSummary } from '@/components/hifdh/PlanSummary';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

type Load = 'loading' | 'ready' | 'failed';

export default function Memorize() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [load, setLoad] = useState<Load>('loading');

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

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <HifHeader title={HIF.title()} />
      {load === 'loading' && <ActivityIndicator color={c.meta} style={{ marginTop: 40 }} />}
      {load === 'failed' && (
        <Txt size={14} center color={c.meta} style={{ marginTop: 40 }}>
          {HIF.loadFailed()}
        </Txt>
      )}
      {load === 'ready' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 14 }}>
          <PlanSummary />
          {/* 3b: the daily cards (today's memorization, revision, ahead of schedule) */}
          {/* 3c: the plans list, the plan setup and edit, the memorized picker (onOpenMemorized) */}
        </ScrollView>
      )}
    </View>
  );
}
