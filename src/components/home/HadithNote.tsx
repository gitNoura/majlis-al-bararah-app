// HOME, the closing note: the hadith of the reader («read and rise») and who told it. Plain words on the page, no box. In
// Arabic the hadith is set in Amiri (the app's face for the Prophet's words); in English and French in the interface face.
// The short marigold bar is the screen's last "you are here" mark, and the only decoration in the note.
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
      <View style={[styles.bar, { backgroundColor: k.spark }]} />
      <Txt {...T.small} color={k.meta}>
        {HOME.hadithIntro()}
      </Txt>
      {LANG === 'ar' ? (
        <Txt serif size={21} lineHeight={36} color={k.ink}>
          {HOME.hadith()}
        </Txt>
      ) : (
        <Txt {...T.body} color={k.ink}>
          {HOME.hadith()}
        </Txt>
      )}
      <Txt {...T.small} color={k.meta}>
        {HOME.heroSource()}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  bar: { width: 28, height: 3, borderRadius: 2, marginBottom: space.xs },
});
