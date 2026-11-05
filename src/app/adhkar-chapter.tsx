// One chapter of Hisn al-Muslim: its name, «read as cards» (/adhkar-read), and its adhkar - each with
// ♡ (liked), + (add to a group, or a new one) and copy / share.
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { chapterTone } from '@/components/AdhkarArt';
import { DhikrCard, GroupSheet, PaintedHead } from '@/components/DhikrParts';
import { Note, ReadLangButton, useToast } from '@/components/HadithParts';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { ADHKAR } from '@/i18n/adhkar';
import { categoryOf, chapterTitle, loadChapter, loadIndex, type Chapter, type Dhikr, type Ref } from '@/lib/adhkar';
import { stopAudio } from '@/lib/adhkarAudio';
import { useReadLang } from '@/lib/hadith';
import { useTheme } from '@/theme/theme';

export default function AdhkarChapter() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const ch = Number(useLocalSearchParams<{ c: string }>().c);
  const lang = useReadLang();
  const [meta, setMeta] = useState<Chapter | null>(null);
  const [items, setItems] = useState<Dhikr[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState<Ref | null>(null);
  const [toast, showToast] = useToast();
  // the recording stops when the page is left
  useEffect(() => stopAudio, []);
  // its colour (the «3 times» marks; the morning and evening chapter: the dawn's)
  const tint = ch === 27 ? 'gold' : chapterTone(ch);

  useEffect(() => {
    Promise.all([loadIndex(), loadChapter(ch)])
      .then(([index, list]) => {
        setMeta(index.find((x) => x.id === ch) ?? null);
        setItems(list);
      })
      .catch(() => setFailed(true));
  }, [ch]);

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="" end={<ReadLangButton />} />
      {failed ? (
        <Note text={ADHKAR.offline()} />
      ) : !items ? (
        <ActivityIndicator color={c.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(d) => String(d.id)}
          extraData={lang}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            <PaintedHead
              daily={ch === 27 ? 'both' : undefined}
              painting={categoryOf(ch)}
              title={meta ? chapterTitle(meta) : ''}
              sub={ADHKAR.count(items.length)}
              label={ADHKAR.readCards()}
              onPress={() => router.push({ pathname: '/adhkar-read', params: { c: String(ch) } })}
            />
          }
          renderItem={({ item, index }) => <DhikrCard first={index === 0} d={item} r={{ c: ch, id: item.id }} lang={lang} tint={tint} onAdd={setAdding} onToast={showToast} />}
        />
      )}
      <GroupSheet r={adding} onClose={() => setAdding(null)} onToast={showToast} />
      {toast}
    </View>
  );
}

