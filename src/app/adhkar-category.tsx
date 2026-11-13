// A category of adhkar (sleep, prayer, travel...): its panel in its colour with its icon, then its
// chapters of Hisn al-Muslim - each with its name and how many adhkar (no icons). A chapter opens its adhkar (/adhkar-chapter).
import { GlassBack } from '@/components/home/Glass';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaintedHead } from '@/components/DhikrParts';
import { Note } from '@/components/HadithParts';
import { BackIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { ADHKAR } from '@/i18n/adhkar';
import { isEnglish } from '@/i18n/i18n';
import { categories, chapterTitle, loadIndex, type CategoryView } from '@/lib/adhkar';
import { useTheme } from '@/theme/theme';

export default function AdhkarCategory() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const key = useLocalSearchParams<{ k: string }>().k;
  const [cat, setCat] = useState<CategoryView | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadIndex()
      .then((index) => setCat(categories(index).find((x) => x.key === key) ?? null))
      .catch(() => setFailed(true));
  }, [key]);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="" />
      {failed ? (
        <Note text={ADHKAR.offline()} />
      ) : !cat ? (
        <ActivityIndicator color={c.gold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
          <PaintedHead
            daily={cat.key === 'daily' ? 'both' : undefined}
            painting={cat.key}
            title={cat.name}
            sub={ADHKAR.chapters(cat.chapters.length)}
            label={ADHKAR.readAll()}
            onPress={() => router.push({ pathname: '/adhkar-read', params: { k: cat.key } })}
          />
          <View style={{ gap: 10 }}>
            {cat.chapters.map((ch) => {
              return (
                <Pressable
                  key={ch.id}
                  onPress={() => router.push({ pathname: '/adhkar-chapter', params: { c: String(ch.id) } })}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
                >
                  <GlassBack radius={20} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={15} weight={600} color={c.ink}>
                      {chapterTitle(ch)}
                    </Txt>
                    <Txt size={12.5} color={c.meta}>
                      {ADHKAR.count(ch.count)}
                    </Txt>
                  </View>
                  <BackIcon color={c.meta} size={16} rtl={isEnglish} />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 14 },
});
