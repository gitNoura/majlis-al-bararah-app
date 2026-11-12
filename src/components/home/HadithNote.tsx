// HOME, the hadith of the reader («read and rise») and who told it. Plain words on the page, no box, centred. «The Prophet said» is
// set exactly like the date above it (same size, same colour).
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { LANG } from '@/i18n/i18n';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { space } from '@/theme/tokens';

export function HadithNote() {
  const k = useSkin();
  return (
    <View style={styles.wrap}>
      <Txt {...T.date} color={k.meta} center>
        {HOME.hadithIntro()}
      </Txt>
      <Txt size={LANG === 'ar' ? 17 : 15} weight={500} lineHeight={LANG === 'ar' ? 32 : 24} color={k.ink} center>
        {HOME.hadith()}
      </Txt>
      <Txt {...T.small} color={k.meta} center>
        {HOME.heroSource()}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs, paddingHorizontal: space.xs, paddingVertical: space.sm },
});
