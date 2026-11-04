// The bottom tabs of the Plan screen (tabsHTML of the website): Listen · My plans · Recite, a floating dock
// that always reads left to right, as on the web. «Recite» says «coming soon», as it does on the web.
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHif } from '@/components/hifdh/HifProvider';
import { MicIcon, NotebookIcon, PlayIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { HOME } from '@/i18n/home';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export const TABS_HEIGHT = 48 + 12; // the dock's height and its gap above the bottom edge (add the inset)

export function HifTabs({ onPlans, onListen, onRecite }: { onPlans: () => void; onListen: () => void; onRecite: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: 'listen', label: HIF.tabListen(), Icon: PlayIcon, onPress: onListen },
    { key: 'plans', label: HIF.myPlans(), Icon: NotebookIcon, onPress: onPlans },
    { key: 'test', label: HIF.tabRecite(), Icon: MicIcon, onPress: onRecite },
  ];
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.wrap, { paddingBottom: insets.bottom + 12 }]}>
      <View
        accessibilityRole="tablist"
        accessibilityLabel={HIF.tabsLabel()}
        style={[styles.dock, { backgroundColor: c.card, borderColor: c.line }]}
      >
        {tabs.map(({ key, label, Icon, onPress }) => (
          <Pressable key={key} onPress={onPress} accessibilityRole="tab" accessibilityLabel={label} style={styles.tab}>
            <Icon color={c.ink} size={23} strokeWidth={1.8} />
            <Txt size={11} weight={700} color={c.ink} numberOfLines={1}>
              {label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// «Recite»: the web has no test page yet, it only says «coming soon»
export function useReciteSoon() {
  const { toast } = useHif();
  return () => toast(HOME.coming());
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end', alignItems: 'center' },
  dock: {
    flexDirection: 'row',
    direction: 'ltr',
    gap: 2,
    padding: 4,
    minWidth: 280,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
  },
  tab: { flex: 1, height: 48, borderRadius: radius.button * 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
