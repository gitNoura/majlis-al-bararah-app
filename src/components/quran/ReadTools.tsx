// The Read mode's tools, under the page: Find, Notes, Display. An icon over a name each, in the bar's own surface.
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ContrastIcon, NotebookIcon, SearchIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { QURAN } from '@/i18n/quran';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

type Props = { onFind: () => void; onNotes: () => void; onDisplay: () => void; onLayout?: (e: LayoutChangeEvent) => void };

export function ReadTools({ onFind, onNotes, onDisplay, onLayout }: Props) {
  const { c } = useTheme();
  const tools = [
    { label: QURAN.find(), icon: <SearchIcon color={c.ink} size={22} />, onPress: onFind },
    { label: QURAN.notes(), icon: <NotebookIcon color={c.ink} size={22} />, onPress: onNotes },
    { label: QURAN.display(), icon: <ContrastIcon color={c.ink} size={22} />, onPress: onDisplay },
  ];
  return (
    <View onLayout={onLayout} style={[styles.row, { borderTopColor: c.line }]}>
      {tools.map((tool) => (
        <Pressable key={tool.label} onPress={tool.onPress} accessibilityRole="button" accessibilityLabel={tool.label} style={({ pressed }) => [styles.tool, pressed && { opacity: 0.6 }]}>
          {tool.icon}
          <Txt size={12.5} weight={500} color={c.text} center numberOfLines={1}>
            {tool.label}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: space.md, paddingVertical: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  tool: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.xs },
});
