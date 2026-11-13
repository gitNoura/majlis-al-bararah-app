// «الأذكار» (Hisn al-Muslim). At the top the two daily ones as painted cards - the morning in a warm
// dawn, the evening in a deep dusk, each with its drawing and «start» to read it at once; under them
// «my groups» (the liked adhkar, the member's own groups, a new one) in a row that scrolls sideways;
// then the categories, each its whole painting in a rounded tile, three to a line. A tile opens its
// chapters (/adhkar-category), or its one chapter at once. The globe: Arabic, English or both.
import { GlassBack } from '@/components/home/Glass';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Art, tone } from '@/components/AdhkarArt';
import { AdhkarScene, MorningEvening } from '@/components/AdhkarScene';
import { CategoryPainting } from '@/components/CategoryPaintings';
import { NewGroupBox } from '@/components/DhikrParts';
import { Note, ReadLangButton } from '@/components/HadithParts';
import { BackIcon, HeartIcon, PlusIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { ADHKAR } from '@/i18n/adhkar';
import { MISBAHA } from '@/i18n/misbaha';
import { isEnglish } from '@/i18n/i18n';
import { categories, createGroup, fillDailyGroups, groupName, loadIndex, useAdhkarStore, type CategoryView, type Group } from '@/lib/adhkar';
import { useTheme } from '@/theme/theme';

// a category's painting is shown whole (the picture is 200 × 180), three tiles to a line
const RATIO = 180 / 200;

const openGroup = (id: string) => router.push({ pathname: '/adhkar-group', params: { g: id } });
const readGroup = (id: string) => router.push({ pathname: '/adhkar-read', params: { g: id } });

export default function Adhkar() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { groups, liked } = useAdhkarStore();
  const [cats, setCats] = useState<CategoryView[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [naming, setNaming] = useState(false);

  useEffect(() => {
    loadIndex()
      .then((index) => setCats(categories(index)))
      .catch(() => setFailed(true));
    fillDailyGroups().catch(() => {});
  }, []);

  const morning = groups.find((g) => g.kind === 'morning');
  const evening = groups.find((g) => g.kind === 'evening');
  const own = groups.filter((g) => g.kind === 'own');
  const rose = tone('rose', isDark);

  const openCategory = (cat: CategoryView) => {
    if (cat.chapters.length === 1) router.push({ pathname: '/adhkar-chapter', params: { c: String(cat.chapters[0].id) } });
    else router.push({ pathname: '/adhkar-category', params: { k: cat.key } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title={ADHKAR.title()} end={<ReadLangButton />} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* the morning and the evening */}
        <View style={styles.daily}>
          {morning && <DailyCard g={morning} />}
          {evening && <DailyCard g={evening} />}
        </View>

        {/* the misbaha: counting tasbih, istighfar, the prayer on the Prophet */}
        <Pressable
          onPress={() => router.push('/misbaha')}
          style={({ pressed }) => [styles.misbaha, pressed && { opacity: 0.8 }]}
        >
          <GlassBack radius={22} />
          <View style={[styles.misbahaRound, { borderColor: c.chosenLine }]}>
            <CategoryPainting name="misbaha" width={52} height={52} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size={16} weight={700} serif color={c.ink}>
              {MISBAHA.title()}
            </Txt>
            <Txt size={12.5} color={c.meta} numberOfLines={2}>
              {MISBAHA.sub()}
            </Txt>
          </View>
          <BackIcon color={c.meta} size={17} rtl={isEnglish} />
        </Pressable>

        {/* my groups, sideways */}
        <View style={styles.label}>
          <Txt size={15} weight={700} color={c.ink}>
            {ADHKAR.myGroups()}
          </Txt>
          <Pressable onPress={() => setNaming(true)} hitSlop={8} style={styles.labelLink}>
            <PlusIcon color={c.gold} size={16} />
            <Txt size={13.5} weight={600} color={c.gold}>
              {ADHKAR.newGroup()}
            </Txt>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groups}>
          <GroupChip
            wash={rose.wash}
            ink={rose.ink}
            icon={<HeartIcon color={rose.ink} on size={17} />}
            name={ADHKAR.liked()}
            sub={ADHKAR.count(liked.length)}
            onPress={() => openGroup('liked')}
          />
          {own.map((g) => (
            <OwnChip key={g.id} g={g} />
          ))}
          {own.length === 0 && (
            <Pressable onPress={() => setNaming(true)} style={({ pressed }) => [styles.chip, styles.newChip, { borderColor: c.chosenLine }, pressed && { opacity: 0.6 }]}>
              <PlusIcon color={c.gold} size={17} />
              <Txt size={13.5} weight={600} center color={c.gold}>
                {ADHKAR.newGroup()}
              </Txt>
            </Pressable>
          )}
        </ScrollView>

        {/* the categories */}
        <View style={styles.label}>
          <Txt size={15} weight={700} color={c.ink}>
            {ADHKAR.categories()}
          </Txt>
        </View>
        {failed ? (
          <Note text={ADHKAR.offline()} />
        ) : !cats ? (
          <ActivityIndicator color={c.gold} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            {cats.map((cat) => (
              <CategoryTile key={cat.key} cat={cat} onPress={() => openCategory(cat)} />
            ))}
          </View>
        )}
      </ScrollView>

      <NewGroupBox
        open={naming}
        onClose={() => setNaming(false)}
        onCreate={(name) => {
          setNaming(false);
          openGroup(createGroup(name));
        }}
      />
    </View>
  );
}

// the morning or the evening as a painted card, as the home screen's wird card: a whole little
// landscape (a soft dawn with the sun just risen, or the dusk with the crescent), its name over the sky
// and «start» at the bottom. A tap on the card opens the group; «start» reads it at once.
function DailyCard({ g }: { g: Group }) {
  const am = g.kind === 'morning';
  const [size, setSize] = useState({ w: 0, h: 0 });
  const ink = am ? '#5b3c17' : '#f4efff';
  const soft = am ? 'rgba(91,60,23,0.7)' : 'rgba(244,239,255,0.75)';
  return (
    <Pressable
      onPress={() => openGroup(g.id)}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={({ pressed }) => [styles.dailyCard, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {size.w > 0 && <AdhkarScene evening={!am} width={size.w} height={size.h} mirrored={!isEnglish} />}
      </View>
      <View style={{ gap: 1 }}>
        <Txt size={16} weight={700} serif color={ink} lineHeight={26}>
          {groupName(g)}
        </Txt>
        <Txt size={12} weight={600} color={soft}>
          {ADHKAR.count(g.items.length)}
        </Txt>
      </View>
      <Pressable
        onPress={() => g.items.length && readGroup(g.id)}
        hitSlop={6}
        style={({ pressed }) => [styles.startPill, { backgroundColor: am ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.18)' }, pressed && { opacity: 0.7 }]}
      >
        <Txt size={13} weight={700} color={ink}>
          {ADHKAR.begin()}
        </Txt>
      </Pressable>
    </Pressable>
  );
}

function OwnChip({ g }: { g: Group }) {
  const { isDark } = useTheme();
  const t = tone('green', isDark);
  return (
    <GroupChip
      wash={t.wash}
      ink={t.ink}
      icon={<Art name="beads" scene color={t.ink} size={19} />}
      name={groupName(g)}
      sub={ADHKAR.count(g.items.length)}
      onPress={() => openGroup(g.id)}
    />
  );
}

// a group as a slim pill: its sign, its name, how many
function GroupChip({ wash, ink, icon, name, sub, onPress }: { wash: string; ink: string; icon: React.ReactNode; name: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: wash }, pressed && { opacity: 0.75 }]}>
      {icon}
      <Txt size={14} weight={700} color={ink} numberOfLines={1}>
        {name}
      </Txt>
      <Txt size={12} color={ink} style={{ opacity: 0.7 }}>
        {sub}
      </Txt>
    </Pressable>
  );
}

// a category as the home screen's prayers: its little painting in a round (its sky, the hills, its
// subject), its name under it
function CategoryTile({ cat, onPress }: { cat: CategoryView; onPress: () => void }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const w = Math.floor((width - 32 - 2 * 12) / 3); // 16 at each side, 12 between the tiles
  const h = Math.round(w * RATIO);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, { width: w }, pressed && { opacity: 0.7 }]}>
      <View style={[styles.tileArt, { width: w, height: h, borderColor: c.chosenLine }]}>
        {cat.key === 'daily' ? (
          <MorningEvening width={w} height={h} mirrored={!isEnglish} />
        ) : (
          <CategoryPainting name={cat.key} width={w} height={h} mirrored={!isEnglish} />
        )}
      </View>
      <Txt size={13} weight={600} center color={c.text} numberOfLines={2} lineHeight={17}>
        {cat.name}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  misbaha: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 14, borderRadius: 22, padding: 12 },
  misbahaRound: { width: 54, height: 54, borderRadius: 16, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  daily: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 4 },
  dailyCard: { flex: 1, height: 132, borderRadius: 24, overflow: 'hidden', padding: 14, justifyContent: 'space-between', boxShadow: '0px 10px 22px rgba(60, 45, 30, 0.14)' },
  startPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999 },
  label: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 24, marginBottom: 10 },
  labelLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groups: { paddingHorizontal: 16, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, borderRadius: 22, paddingHorizontal: 16 },
  newChip: { borderWidth: 1.2, borderStyle: 'dashed' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, columnGap: 12, rowGap: 18 },
  tile: { alignItems: 'center', gap: 8 },
  tileArt: { borderRadius: 18, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
