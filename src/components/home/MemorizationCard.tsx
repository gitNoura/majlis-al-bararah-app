// HOME, card 3: memorization, as numbers (the tasks themselves are in the Hifdh tab, which this card opens): the juz
// memorized, a strip of the 30 juz by how much of each is memorized, and how many of today's portions are done.
'use no memo'; // reads the plan's own state (a module) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { View } from 'react-native';

import { Txt } from '@/components/Txt';
import { Card, Chevron, ProgressStrip } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { L } from '@/i18n/i18n';
import { hifdhToday, memorizedCells } from '@/lib/dashboard';
import { useTheme } from '@/theme/theme';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

export function MemorizationCard() {
  const { c } = useTheme();
  const cells = memorizedCells();
  const juz = Math.round(cells.reduce((a, b) => a + b, 0) * 10) / 10;
  const today = hifdhToday();
  const parts = [
    today.memorize.total ? `${DASH.newLabel()} ${digits(today.memorize.done)}/${digits(today.memorize.total)}` : '',
    today.revise.total ? `${DASH.revisionLabel()} ${digits(today.revise.done)}/${digits(today.revise.total)}` : '',
  ].filter(Boolean);
  return (
    <Card onPress={() => router.navigate('/hifdh')} accessibilityLabel={HOME.memorize()}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt size={13} weight={700} color={c.meta}>
          {HOME.memorize()}
        </Txt>
        <Chevron />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <Txt size={34} weight={800} lineHeight={42} color={c.ink}>
          {digits(juz)}
        </Txt>
        <Txt size={14} color={c.meta}>
          {DASH.memorizedOf()}
        </Txt>
      </View>
      <ProgressStrip cells={cells} height={8} label={DASH.memorizedOf()} />
      {today.hasPlan ? (
        <Txt size={14} weight={600} color={c.text}>
          {parts.length ? parts.join(' · ') : DASH.nothingToday()}
        </Txt>
      ) : (
        <View style={{ gap: 2 }}>
          <Txt size={14} weight={600} color={c.text}>
            {DASH.noPlan()}
          </Txt>
          <Txt size={13} color={c.meta}>
            {DASH.noPlanSub()}
          </Txt>
        </View>
      )}
    </Card>
  );
}
