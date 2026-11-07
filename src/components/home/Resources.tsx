// HOME, last: «Additional resources» - the two libraries, at the lowest visual weight (a quiet card, no icons, no button).
// Each opens the whole library, not one item of the day.
import { router } from 'expo-router';
import { View } from 'react-native';

import { Txt } from '@/components/Txt';
import { Card, Row } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export function Resources() {
  const { c } = useTheme();
  return (
    <View style={{ gap: space.sm }}>
      <Txt size={13} weight={700} color={c.meta}>
        {DASH.resources()}
      </Txt>
      <Card quiet style={{ paddingVertical: space.xs }}>
        <Row title={DASH.libAdhkar()} sub={DASH.libAdhkarSub()} chevron onPress={() => router.push('/adhkar')} />
        <Row title={DASH.libAhadith()} sub={DASH.libAhadithSub()} chevron onPress={() => router.push('/ahadith')} last />
      </Card>
    </View>
  );
}
