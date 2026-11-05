// The bottom bar of the Plan screen (tabsHTML of the website): Listen · My plans · Recite. It is the Quran reading
// page's own bar (src/app/quran.tsx): full width along the bottom edge, each button an icon over its name, on the
// panel colour with a hairline above. «Recite» says «coming soon», as it does on the web.
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHif } from '@/components/hifdh/HifProvider';
import { MicIcon, NotebookIcon, PlayIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { HOME } from '@/i18n/home';
import { useTheme } from '@/theme/theme';

export const TABS_HEIGHT = 62; // the bar's height above the phone's own bottom edge (add the inset), as the Quran's BAR_H

export function HifTabs({ onPlans, onListen, onRecite }: { onPlans: () => void; onListen: () => void; onRecite: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: 'listen', label: HIF.tabListen(), Icon: PlayIcon, onPress: onListen },
    { key: 'plans', label: HIF.myPlans(), Icon: NotebookIcon, onPress: onPlans },
    { key: 'test', label: HIF.tabRecite(), Icon: MicIcon, onPress: onRecite },
  ];
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={HIF.tabsLabel()}
      style={[styles.bar, { height: TABS_HEIGHT + insets.bottom, paddingBottom: insets.bottom, backgroundColor: c.panel, borderTopColor: c.line }]}
    >
      {tabs.map(({ key, label, Icon, onPress }) => (
        <Pressable key={key} onPress={onPress} accessibilityRole="tab" accessibilityLabel={label} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.55 }]}>
          <Icon color={c.ink} size={22} />
          <Txt size={12.5} weight={500} color={c.tabInk} numberOfLines={1}>
            {label}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

// «Recite»: the web has no test page yet, it only says «coming soon»
export function useReciteSoon() {
  const { toast } = useHif();
  return () => toast(HOME.coming());
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: 4, borderTopWidth: StyleSheet.hairlineWidth },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
