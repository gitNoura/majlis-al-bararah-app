// HOME, the hadith of the reader («read and rise») and who told it. Plain words on the page, no box, centred. «The Prophet said» runs
// on into the hadith on the same line, in the same font and size; only its colour differs (the date's grey).
import { StyleSheet, Text, View } from 'react-native';

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
      <Txt size={LANG === 'ar' ? 14 : 13} weight={500} lineHeight={LANG === 'ar' ? 24 : 20} color={k.ink} center>
        <Text style={{ color: k.meta }}>{`${HOME.hadithIntro()} `}</Text>
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
