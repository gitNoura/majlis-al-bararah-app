// What the Adhkar screens share: a dhikr's card (its Arabic, the morning / evening variant, how many
// times, the English; ♡, + and copy / share - or «remove» in a group), the sheet to add a dhikr to a
// group (or make a new one), and the small box to name a new group.
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Art, tone, type Tone } from '@/components/AdhkarArt';
import { AdhkarScene, MorningEvening } from '@/components/AdhkarScene';
import { CategoryPainting, isNightPainting } from '@/components/CategoryPaintings';
import { PaintedScene } from '@/components/PaintedScene';
import { CheckIcon, CloseIcon, CopyIcon, HeartIcon, ListenPauseIcon, ListenPlayIcon, PlusIcon, ShareIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { ADHKAR } from '@/i18n/adhkar';
import { isEnglish } from '@/i18n/i18n';
import {
  arabicParts,
  createGroup,
  englishOf,
  groupName,
  inGroup,
  isLiked,
  repeatOf,
  toggleInGroup,
  toggleLiked,
  useAdhkarStore,
  type Dhikr,
  type Ref,
} from '@/lib/adhkar';
import { cycleSpeed, toggleAudio, useAdhkarAudio } from '@/lib/adhkarAudio';
import { EVENING } from '@/lib/adhkar-evening';
import { type ReadLang } from '@/lib/hadith';
import { serif, ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

// Arabic: right to left, justified, its last line on the right (its own direction: see hadith-kitab)
export function ArabicText({ text, size = 20, color }: { text: string; size?: number; color: string }) {
  return (
    <Txt
      size={size}
      color={color}
      lineHeight={size * 1.9}
      style={{
        fontFamily: serif(400),
        direction: 'rtl',
        writingDirection: 'rtl',
        textAlign: 'justify',
      }}
    >
      {text}
    </Txt>
  );
}

export function EnglishText({ text, size = 15.5, color }: { text: string; size?: number; color: string }) {
  return (
    <Txt
      size={size}
      color={color}
      lineHeight={size * 1.65}
      style={{
        direction: 'ltr',
        writingDirection: 'ltr',
        textAlign: 'justify',
      }}
    >
      {text}
    </Txt>
  );
}

// The body of a dhikr as it is read: the Arabic and its variant notes, the English, or both.
// `morning`: in the morning adhkar, without the evening's wording («وإذا أمسى قال…»); `evening`: in the
// evening adhkar, the evening wording itself in the morning one's place («أمسينا…» for «أصبحنا…»)
export function DhikrBody({ d, lang, big, morning, evening }: { d: Dhikr; lang: ReadLang; big?: boolean; morning?: boolean; evening?: boolean }) {
  const { c } = useTheme();
  const { main, notes, en } = partsFor(d, morning, evening);
  const arabic = lang !== 'en' || !en;
  const english = lang !== 'ar' && !!en;
  return (
    <View style={{ gap: 8 }}>
      {arabic && <ArabicText text={main} size={big ? 23 : 20} color={c.ink} />}
      {arabic && notes.map((n, i) => <ArabicText key={i} text={n} size={big ? 16 : 15} color={c.meta} />)}
      {english && (
        <View style={arabic ? [styles.enLine, { borderTopColor: c.divider }] : undefined}>
          <EnglishText text={en} size={big ? 17 : 15.5} color={arabic ? c.text : c.ink} />
        </View>
      )}
    </View>
  );
}

// a variant said in the evening («وإذا أمسى قال: …»)
const isEveningNote = (n: string) => /امس/.test(n.replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا'));

// what a dhikr says in the morning adhkar, in the evening ones, or anywhere else (both wordings)
function partsFor(d: Dhikr, morning?: boolean, evening?: boolean) {
  const night = evening ? EVENING[d.id] : undefined;
  if (night) return { main: night.ar, notes: [] as string[], en: night.en };
  const parts = arabicParts(d);
  const notes = morning ? parts.notes.filter((n) => !isEveningNote(n)) : parts.notes;
  return { main: parts.main, notes, en: englishOf(d, morning) };
}

const textOf = (d: Dhikr, lang: ReadLang, morning?: boolean, evening?: boolean) => {
  const ar = partsFor(d, morning, evening);
  const en = ar.en;
  const arabic = [ar.main, ...ar.notes].join('\n');
  return lang === 'ar' || !en ? arabic : lang === 'en' ? en : `${arabic}\n\n${en}`;
};

// A dhikr as on a page of a Hisn al-Muslim booklet - no box: a small gold flourish before it (`first`:
// none), how many times in small gold words, its text on the page, and its buttons quietly under it.
// `onRemove`: in a group, a remove button instead of +
export function DhikrCard({
  d,
  r,
  lang,
  onAdd,
  onRemove,
  onToast,
  morning,
  evening,
  tint,
  first,
}: {
  d: Dhikr;
  r: Ref;
  lang: ReadLang;
  morning?: boolean;
  evening?: boolean;
  // the chapter's colour family (the «3 times» badge)
  tint?: Tone;
  first?: boolean;
  onAdd?: (r: Ref) => void;
  onRemove?: (r: Ref) => void;
  onToast: (text: string) => void;
}) {
  const { c, isDark } = useTheme();
  const { liked } = useAdhkarStore();
  const on = isLiked(liked, r);
  const times = repeatOf(d);
  const t = tone(tint ?? 'gold', isDark);
  return (
    <View style={styles.entry}>
      {!first && <Flourish color={c.gold} />}
      {times > 1 && (
        <Txt size={12.5} weight={700} center color={t.ink} style={{ marginBottom: 6, letterSpacing: 0.3 }}>
          {ADHKAR.times(times)}
        </Txt>
      )}
      <DhikrBody d={d} lang={lang} morning={morning} evening={evening} />
      <View style={styles.foot}>
        <View style={styles.actions}>
          <ListenButton audio={d.audio} size={32} />
          <Act label={ADHKAR.like()} onPress={() => toggleLiked(r)}>
            <HeartIcon color={on ? '#d0596e' : c.meta} on={on} size={20} />
          </Act>
          {onRemove ? (
            <Act label={ADHKAR.remove()} onPress={() => onRemove(r)}>
              <CloseIcon color={c.meta} size={19} />
            </Act>
          ) : (
            onAdd && (
              <Act label={ADHKAR.addTo()} onPress={() => onAdd(r)}>
                <PlusIcon color={c.meta} size={20} />
              </Act>
            )
          )}
          <Act
            label={ADHKAR.copy()}
            onPress={async () => {
              await Clipboard.setStringAsync(textOf(d, lang, morning, evening)).catch(() => {});
              onToast(ADHKAR.copied());
            }}
          >
            <CopyIcon color={c.meta} size={19} />
          </Act>
          <Act label={ADHKAR.share()} onPress={() => Share.share({ message: textOf(d, lang, morning, evening) }).catch(() => {})}>
            <ShareIcon color={c.meta} size={19} />
          </Act>
        </View>
      </View>
    </View>
  );
}

// Listening to a dhikr (its recording): a round play button - a stop sign while it plays, a small
// spinner while it loads - and next to it, while it plays, the speed (normal, 1.5×, 2×)
export function ListenButton({ audio, size = 36, tint }: { audio?: string; size?: number; tint?: string }) {
  const { c } = useTheme();
  const { playing, loading, rate } = useAdhkarAudio();
  if (!audio) return null;
  const on = playing === audio;
  const ink = tint ?? c.ink;
  return (
    <View style={styles.listen}>
      <Pressable
        onPress={() => toggleAudio(audio)}
        hitSlop={6}
        accessibilityLabel={ADHKAR.listen()}
        style={({ pressed }) => [
          styles.listenBtn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: on ? ink : c.line,
            backgroundColor: on ? ink : 'transparent',
          },
          pressed && { opacity: 0.6 },
        ]}
      >
        {on && loading ? (
          <ActivityIndicator size="small" color={c.onInk} />
        ) : on ? (
          <ListenPauseIcon color={c.onInk} size={size * 0.45} />
        ) : (
          <ListenPlayIcon color={ink} size={size * 0.5} />
        )}
      </Pressable>
      {on && (
        <Pressable
          onPress={cycleSpeed}
          hitSlop={6}
          accessibilityLabel={ADHKAR.speed()}
          style={({ pressed }) => [styles.speed, { borderColor: c.line }, pressed && { opacity: 0.6 }]}
        >
          <Txt size={12} weight={700} color={ink}>
            {rate === 1 ? ADHKAR.normal() : `${rate}×`}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

// between two adhkar: a short gold line, a small diamond, a short gold line
export function Flourish({ color }: { color: string }) {
  return (
    <View style={styles.flourish}>
      <View style={[styles.flLine, { backgroundColor: color }]} />
      <View style={[styles.flDot, { backgroundColor: color }]} />
      <View style={[styles.flDiamond, { borderColor: color }]} />
      <View style={[styles.flDot, { backgroundColor: color }]} />
      <View style={[styles.flLine, { backgroundColor: color }]} />
    </View>
  );
}

function Act({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityLabel={label} style={({ pressed }) => [styles.act, pressed && { opacity: 0.5 }]}>
      {children}
    </Pressable>
  );
}

// The sheet from the bottom to put a dhikr in groups: every group with a tick when it is in it (a tap
// adds or removes it), and «New group» at the end
export function GroupSheet({ r, onClose, onToast }: { r: Ref | null; onClose: () => void; onToast: (text: string) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { groups } = useAdhkarStore();
  const [naming, setNaming] = useState(false);
  if (!r) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.grip, { backgroundColor: c.line }]} />
        <Txt size={17} weight={700} center color={c.ink} style={{ marginBottom: 8 }}>
          {ADHKAR.addTo()}
        </Txt>
        {groups.map((g) => {
          const on = inGroup(g, r);
          return (
            <Pressable
              key={g.id}
              onPress={() => onToast(toggleInGroup(g.id, r) ? ADHKAR.added() : ADHKAR.removed())}
              style={({ pressed }) => [styles.row, { borderBottomColor: c.divider }, pressed && { backgroundColor: c.soft }]}
            >
              <Txt size={16} weight={on ? 700 : 500} color={c.ink} style={{ flex: 1 }} numberOfLines={1}>
                {groupName(g)}
              </Txt>
              {on && <CheckIcon color={c.ink} size={19} />}
            </Pressable>
          );
        })}
        <Pressable onPress={() => setNaming(true)} style={({ pressed }) => [styles.row, { borderBottomWidth: 0 }, pressed && { backgroundColor: c.soft }]}>
          <PlusIcon color={c.gold} size={20} />
          <Txt size={16} weight={600} color={c.gold} style={{ flex: 1 }}>
            {ADHKAR.newGroup()}
          </Txt>
        </Pressable>
      </View>
      <NewGroupBox
        open={naming}
        onClose={() => setNaming(false)}
        onCreate={(name) => {
          createGroup(name, r);
          setNaming(false);
          onToast(ADHKAR.added());
        }}
      />
    </Modal>
  );
}

// A small box in the middle to name a group (new, or renamed: `initial`)
export function NewGroupBox({
  open,
  initial = '',
  title,
  onClose,
  onCreate,
}: {
  open: boolean;
  initial?: string;
  title?: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const { c } = useTheme();
  const [name, setName] = useState(initial);
  const ok = name.trim().length > 0;
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} onShow={() => setName(initial)}>
      <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.dim }]} onPress={onClose} />
        <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Txt size={17} weight={700} color={c.ink}>
            {title ?? ADHKAR.newGroup()}
          </Txt>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={ADHKAR.groupName()}
            placeholderTextColor={c.meta}
            autoFocus
            maxLength={40}
            onSubmitEditing={() => ok && onCreate(name)}
            style={[
              styles.input,
              {
                color: c.ink,
                borderColor: c.line,
                backgroundColor: c.card,
                fontFamily: ui(500),
                textAlign: isEnglish ? 'left' : 'right',
              },
            ]}
          />
          <View style={styles.boxButtons}>
            <Pressable onPress={onClose} hitSlop={6} style={styles.boxBtn}>
              <Txt size={15} weight={600} color={c.meta}>
                {ADHKAR.cancel()}
              </Txt>
            </Pressable>
            <Pressable onPress={() => ok && onCreate(name)} hitSlop={6} style={[styles.boxBtn, { backgroundColor: ok ? c.on : c.soft }]}>
              <Txt size={15} weight={700} color={ok ? c.onInk : c.meta}>
                {initial ? ADHKAR.save() : ADHKAR.create()}
              </Txt>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// The top of an Adhkar page: a soft panel of the page's colour, its drawing, its name and a line under
// it, and what goes below (a button)
export function Opening({
  tint,
  art,
  scene,
  title,
  sub,
  children,
}: {
  tint: Tone;
  art: string;
  scene?: boolean;
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const t = tone(tint, isDark);
  return (
    <View style={[styles.opening, { backgroundColor: t.wash }]}>
      <View
        style={[
          styles.openingArt,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
          },
        ]}
      >
        <Art name={art} scene={scene} color={t.ink} size={34} width={1.3} />
      </View>
      <Txt size={22} weight={700} serif center color={t.ink} lineHeight={36}>
        {title}
      </Txt>
      <Txt size={13} center color={t.ink} style={{ opacity: 0.75 }}>
        {sub}
      </Txt>
      {children}
    </View>
  );
}

// The painted head of an Adhkar page (as the morning and evening ones): its landscape - the dawn or the
// dusk (`daily`), or a category's or chapter's sky with its subject - its name and how many over the
// sky, and a button at the bottom (start reading, read as cards)
export function PaintedHead({
  daily,
  tint = 'gold',
  subject,
  painting,
  title,
  sub,
  label,
  onPress,
}: {
  daily?: 'morning' | 'evening' | 'both';
  tint?: Tone;
  subject?: string;
  // a category's own painting (src/components/CategoryPaintings.tsx)
  painting?: string;
  title: string;
  sub: string;
  label?: string;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const night = daily ? daily === 'evening' : painting ? isNightPainting(painting) : tint === 'indigo';
  const ink = night ? '#f4efff' : '#4a3414';
  const soft = night ? 'rgba(244,239,255,0.75)' : 'rgba(74,52,20,0.7)';
  // a category's painting: seen whole - its button goes under the picture, not over it
  const below = !!painting && !daily;
  const button =
    label && onPress ? (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.paintedBtn,
          below
            ? { backgroundColor: c.on, marginTop: 10 }
            : {
                backgroundColor: night ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)',
              },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Txt size={15} weight={700} color={below ? c.onInk : ink}>
          {label}
        </Txt>
      </Pressable>
    ) : null;
  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={[styles.painted, below && { height: 244, justifyContent: 'flex-start' }, !label && !painting && { height: 150 }]}
        onLayout={(e) =>
          setSize({
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          })
        }
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {size.w > 0 &&
            (daily === 'both' ? (
              <MorningEvening width={size.w} height={size.h} mirrored={!isEnglish} />
            ) : daily ? (
              <AdhkarScene evening={daily === 'evening'} width={size.w} height={size.h} mirrored={!isEnglish} />
            ) : painting ? (
              <CategoryPainting name={painting} width={size.w} height={size.h} mirrored={!isEnglish} ground />
            ) : (
              <PaintedScene tint={tint} subject={subject} width={size.w} height={size.h} mirrored={!isEnglish} place="end" />
            ))}
        </View>
        <View style={{ gap: 1, maxWidth: '58%' }}>
          <Txt size={21} weight={700} serif color={ink} lineHeight={34}>
            {title}
          </Txt>
          <Txt size={13} weight={600} color={soft}>
            {sub}
          </Txt>
        </View>
        {!below && button}
      </View>
      {below && button}
    </View>
  );
}

// a round button in the page's colour (start reading, read as cards)
export function ToneButton({ tint, label, onPress }: { tint: Tone; label: string; onPress: () => void }) {
  const { isDark } = useTheme();
  const t = tone(tint, isDark);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toneBtn, { backgroundColor: t.ink }, pressed && { opacity: 0.85 }]}>
      <Txt size={15} weight={700} color={isDark ? '#1f2221' : '#ffffff'}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listen: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listenBtn: {
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speed: {
    paddingHorizontal: 9,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painted: {
    height: 190,
    borderRadius: 26,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
    boxShadow: '0px 10px 22px rgba(60, 45, 30, 0.14)',
  },
  paintedBtn: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opening: {
    alignItems: 'center',
    gap: 2,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  openingArt: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toneBtn: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  entry: { paddingHorizontal: 6, paddingBottom: 6 },
  flourish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 18,
    opacity: 0.75,
  },
  flLine: { width: 44, height: 1 },
  flDot: { width: 3, height: 3, borderRadius: 1.5 },
  flDiamond: {
    width: 8,
    height: 8,
    borderWidth: 1.2,
    transform: [{ rotate: '45deg' }],
  },
  enLine: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  foot: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.9,
  },
  act: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  boxButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  boxBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
});
