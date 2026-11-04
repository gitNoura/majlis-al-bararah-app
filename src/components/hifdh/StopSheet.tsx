// «Where did you stop?»: opened by a long press on «Complete». One chip per ayah of the portion, under the
// name of its surah; the chosen ayah is the last one counted, the rest carries on to the next day.
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { surahName } from '@/i18n/i18n';
import * as core from '@/lib/hifdh/core';
import * as plan from '@/lib/hifdh/plan';
import { SURAHS } from '@/lib/quran';
import { useTheme } from '@/theme/theme';

export type Row = any;

type Group = { surah: string; ayat: { g: number; n: number }[] };

export function StopSheet({ row, onPick, onClose }: { row: Row | null; onPick: (g: number) => void; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const groups = useMemo<Group[]>(() => {
    if (!row) return [];
    const U = plan.units();
    const out: Group[] = [];
    let last = -1;
    for (const g of core.idsOf(row.segs) as number[]) {
      const sIdx = U.surahOf[g];
      if (sIdx !== last) {
        out.push({ surah: surahName(SURAHS[sIdx]), ayat: [] });
        last = sIdx;
      }
      out[out.length - 1].ayat.push({ g, n: U.ayahNumber(g) });
    }
    return out;
  }, [row]);

  return (
    <Modal visible={!!row} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]} onPress={onClose} accessibilityLabel={HIF.close()} />
        <View style={[styles.panel, { backgroundColor: c.panel, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.head}>
            <Txt serif size={20} weight={700} color={c.ink} style={{ flex: 1 }}>
              {HIF.stopTitle()}
            </Txt>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={HIF.close()}>
              <CloseIcon color={c.ink} size={22} />
            </Pressable>
          </View>
          <Txt size={13} color={c.meta} style={{ marginBottom: 10 }}>
            {HIF.stopHint()}
          </Txt>
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            {groups.map((grp, i) => (
              <View key={`${grp.surah}-${i}`} style={{ marginBottom: 10 }}>
                <Txt serif size={17} weight={700} color={c.ink} style={{ marginBottom: 6 }}>
                  {grp.surah}
                </Txt>
                <View style={styles.chips}>
                  {grp.ayat.map((a) => (
                    <Pressable
                      key={a.g}
                      onPress={() => onPick(a.g)}
                      accessibilityRole="button"
                      style={[styles.chip, { borderColor: c.chosenLine, backgroundColor: c.soft }]}
                    >
                      <Txt size={14.5} weight={600} color={c.ink}>
                        {a.n}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  panel: { maxHeight: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minWidth: 44, minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
