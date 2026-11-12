// Where the prayer times are for, asked from the home screen (its «+», or a tap on the place shown): a
// sheet from the bottom - use the phone's location, or choose a city from the list (the settings, its
// list of cities open). While the phone looks for the place, the button says so; if it cannot find it,
// the sheet says to choose a city.
import { Modal, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon, PinIcon } from '@/components/icons';
import { Sheen } from '@/components/home/Glass';
import { Txt } from '@/components/Txt';
import { isEnglish, t } from '@/i18n/i18n';
import { SETTINGS } from '@/i18n/settings';
import { READER } from '@/i18n/reader';
import { useTheme } from '@/theme/theme';

type Props = {
  open: boolean;
  busy: boolean; // looking for the phone's location
  failed: boolean;
  onClose: () => void;
  onLocate: () => void;
  onChooseCity: () => void;
};

export function PlaceSheet({ open, busy, failed, onClose, onLocate, onChooseCity }: Props) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.dim, { backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(25,24,19,0.18)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={READER.close()} />
        <View style={[styles.sheet, { backgroundColor: c.panel, paddingBottom: insets.bottom + 18 }]}>
          <Sheen topOnly radius={26} />
          <View style={[styles.grip, { backgroundColor: c.line }]} />
          <Txt size={20} weight={700} serif color={c.ink}>
            {t('qbAskTitle')}
          </Txt>
          <Txt size={14} color={failed ? '#a3243b' : c.meta} style={{ marginTop: 2, marginBottom: 14 }}>
            {failed ? t('calLocateFailed') : t('calPlaceAsk')}
          </Txt>
          <Pressable
            onPress={busy ? undefined : onLocate}
            style={({ pressed }) => [styles.main, { backgroundColor: c.on }, pressed && { opacity: 0.85 }]}
          >
            {busy ? <ActivityIndicator color={c.onInk} /> : <PinIcon color={c.onInk} size={20} />}
            <Txt size={16} weight={700} color={c.onInk}>
              {busy ? t('calLocating') : t('calUseLocation')}
            </Txt>
          </Pressable>
          <Pressable
            onPress={onChooseCity}
            style={({ pressed }) => [styles.second, { borderColor: c.chosenLine, backgroundColor: c.card }, pressed && { opacity: 0.7 }]}
          >
            <Txt size={16} weight={600} color={c.ink} style={{ flex: 1 }}>
              {SETTINGS.chooseCity()}
            </Txt>
            <BackIcon color={c.meta} size={18} rtl={isEnglish} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  main: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 16 },
  second: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
});
