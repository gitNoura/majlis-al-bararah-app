// A group of adhkar (the morning or evening adhkar, the liked ones, or the member's own): its name, how
// many, «start reading» (/adhkar-read), and its adhkar - each with ♡, remove, copy / share. At the end:
// back to Hisn al-Muslim's original (morning / evening), or rename and delete (the member's groups).
// Adhkar are added from the categories with + (any chapter).
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Tone } from '@/components/AdhkarArt';
import { DhikrCard, NewGroupBox, Opening, PaintedHead, ToneButton } from '@/components/DhikrParts';
import { Note, ReadLangButton, useToast } from '@/components/HadithParts';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { ADHKAR } from '@/i18n/adhkar';
import { deleteGroup, groupName, loadRefs, removeFromGroup, renameGroup, resetGroup, useAdhkarStore, type Dhikr, type Ref } from '@/lib/adhkar';
import { stopAudio } from '@/lib/adhkarAudio';
import { useReadLang } from '@/lib/hadith';
import { useTheme } from '@/theme/theme';

const NONE: Ref[] = [];

export default function AdhkarGroup() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const id = useLocalSearchParams<{ g: string }>().g;
  const lang = useReadLang();
  const { groups, liked } = useAdhkarStore();
  const group = groups.find((g) => g.id === id);
  const refs = id === 'liked' ? liked : (group?.items ?? NONE);
  const [items, setItems] = useState<(Dhikr & Ref)[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [toast, showToast] = useToast();
  // the recording stops when the page is left
  useEffect(() => stopAudio, []);

  // the adhkar again whenever the group changes (one removed, the original restored...)
  useEffect(() => {
    loadRefs(refs)
      .then(setItems)
      .catch(() => setFailed(true));
  }, [refs]);

  const name = id === 'liked' ? ADHKAR.liked() : group ? groupName(group) : '';
  // its colour and drawing: the dawn, the dusk, a heart's rose, the member's green
  const tint: Tone = id === 'liked' ? 'rose' : group?.kind === 'morning' ? 'gold' : group?.kind === 'evening' ? 'indigo' : 'green';
  const art = id === 'liked' ? 'twoHearts' : group?.kind === 'morning' ? 'sunrise' : group?.kind === 'evening' ? 'sunset' : 'dhikr';

  const start = () => router.push({ pathname: '/adhkar-read', params: { g: id } });

  const askDelete = () =>
    Alert.alert(ADHKAR.deleteAsk(), name, [
      { text: ADHKAR.cancel(), style: 'cancel' },
      {
        text: ADHKAR.delete(),
        style: 'destructive',
        onPress: () => {
          router.back();
          deleteGroup(id);
        },
      },
    ]);

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
          keyExtractor={(d) => `${d.c}-${d.id}`}
          extraData={lang}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            group?.kind === 'morning' || group?.kind === 'evening' ? (
              <PaintedHead daily={group.kind} title={name} sub={ADHKAR.count(items.length)} label={items.length ? ADHKAR.start() : undefined} onPress={start} />
            ) : (
              <Opening tint={tint} art={art} scene={id === 'liked'} title={name} sub={ADHKAR.count(items.length)}>
                {items.length > 0 && <ToneButton tint={tint} label={ADHKAR.start()} onPress={start} />}
              </Opening>
            )
          }
          ListEmptyComponent={<Note text={id === 'liked' ? ADHKAR.emptyLiked() : ADHKAR.emptyGroup()} />}
          renderItem={({ item, index }) => (
            <DhikrCard first={index === 0} d={item} r={{ c: item.c, id: item.id }} lang={lang} tint={tint} morning={group?.kind === 'morning'} evening={group?.kind === 'evening'} onRemove={(r) => removeFromGroup(id, r)} onToast={showToast} />
          )}
          ListFooterComponent={
            group ? (
              <View style={styles.foot}>
                {group.kind === 'own' ? (
                  <>
                    <FootButton label={ADHKAR.rename()} onPress={() => setRenaming(true)} />
                    <FootButton label={ADHKAR.delete()} danger onPress={askDelete} />
                  </>
                ) : (
                  <FootButton label={ADHKAR.reset()} onPress={() => resetGroup(id)} />
                )}
              </View>
            ) : undefined
          }
        />
      )}
      <NewGroupBox
        open={renaming}
        initial={group?.name ?? ''}
        title={ADHKAR.rename()}
        onClose={() => setRenaming(false)}
        onCreate={(n) => {
          renameGroup(id, n);
          setRenaming(false);
        }}
      />
      {toast}
    </View>
  );
}

function FootButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.footBtn, pressed && { opacity: 0.5 }]}>
      <Txt size={14.5} weight={600} color={danger ? '#c2483c' : c.meta}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  foot: { alignItems: 'center', gap: 4, marginTop: 8 },
  footBtn: { paddingVertical: 10, paddingHorizontal: 16 },
});
