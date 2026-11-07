// QURAN tab: the mushaf page, opened at the last page read. One page, three modes (Read, Listen, Recite) chosen from
// the drop-down at the header's end; this is Read. Listen and Recite come next (phase c2) on this same page.
//   header   the index (fahras) and the search and the notes; the mode drop-down; under them the surah and juz
//   marker   ONE: the page being read ('lastPage', src/lib/position.ts), which follows every turn; plus an exact pin
//            («Mark here» in an ayah's menu, «Remove mark» on the marked ayah), shown as a ribbon on its page
//   a tap on the page outside its ayat fades the header and takes the tab bar away; the page stays exactly where it
//   and as big as it was (nothing is cropped or zoomed); another tap brings them back
// The page itself is src/components/PageCurl.tsx.
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AyahMenu, type MenuAt } from '@/components/AyahMenu';
import { AyahSheet, type Ayah } from '@/components/AyahSheet';
import { ZoomOutIcon } from '@/components/icons';
import { NoteSheet, type NoteFor } from '@/components/NoteSheet';
import { PageCurl, type Chosen, type Marked, type Pin as NotePin } from '@/components/PageCurl';
import { DropMenu } from '@/components/quran/DropMenu';
import { menuTop, QuranHeader } from '@/components/quran/QuranHeader';
import { SearchSheet } from '@/components/quran/SearchSheet';
import { QuranIndex } from '@/components/QuranIndex';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { markToday } from '@/lib/activity';
import { ayatOn, pageOf, stepAyah } from '@/lib/boxes';
import { PAGE_SHAPE } from '@/lib/crop';
import { hlColor, noteColor, useMarks } from '@/lib/marks';
import { clampPage, savedPage, savedPin, savePage } from '@/lib/position';
import { TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { trackPlace } from '@/lib/riwaya';
import { clearPin, countPage, setPin } from '@/lib/wird';
import { QuranTheme, useTheme } from '@/theme/theme';

type Mode = 'read' | 'listen' | 'recite';
type Room = { width: number; height: number };

// the Quran's screens have their own day / night (src/theme/theme.tsx)
export default function QuranTab() {
  return (
    <QuranTheme>
      <Quran />
    </QuranTheme>
  );
}

function Quran() {
  const { c, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headH, setHeadH] = useState(0); // the header block's height: where the page's room begins on the screen
  const [page, setPage] = useState(savedPage);
  const pageRef = useRef(page); // the page before a turn, to tell a turn from a jump
  const [hidden, setHidden] = useState(false); // the header faded and the tab bar gone; the page where it was
  const [room, setRoom] = useState<Room>({ width: 0, height: 0 });
  const [zoomed, setZoomed] = useState(false);
  const [unzoom, setUnzoom] = useState(0); // counts the «whole page» presses (PageCurl zooms out on each)
  const [indexOpen, setIndexOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false); // the drop-down of the modes
  const [ayah, setAyah] = useState<Ayah | null>(null); // its tafsir open
  const [menu, setMenu] = useState<MenuAt | null>(null); // its options open
  const [note, setNote] = useState<NoteFor | null>(null); // its comment open
  const [flash, setFlash] = useState<Ayah | null>(null); // an ayah lit a moment (found by Find)
  const [pin, setPinState] = useState(savedPin);
  const [toast, setToast] = useState('');
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    markToday('quran');
    return () => {
      clearTimeout(flashTimer.current);
    };
  }, []);

  // the header fades; it keeps its place, so the page does not move
  const fade = useSharedValue(1);
  useEffect(() => {
    fade.set(withTiming(hidden ? 0 : 1, { duration: 180 }));
  }, [hidden, fade]);
  const headerStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));

  // the tab bar is drawn by src/app/(tabs)/_layout.tsx, which reads this option
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: hidden ? 'none' : 'flex' } });
  }, [hidden, navigation]);

  // the phone's back button brings the header back before it leaves the page
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!hidden) return false;
        setHidden(false);
        return true;
      });
      return () => sub.remove();
    }, [hidden]),
  );

  // a short message over the page; it clears itself
  const say = (text: string) => setToast(text);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  // The marker moves: kept at once. A turn forward by one page counts the page left behind as read today; a jump
  // (Find, the tafsir sheet's next ayah) never does.
  const move = useCallback((p: number, byTurn: boolean) => {
    const target = clampPage(p);
    const from = pageRef.current;
    pageRef.current = target;
    setPage(target);
    savePage(target);
    if (byTurn && target === from + 1) countPage(from).catch(() => {});
  }, []);
  const turned = useCallback((p: number) => move(p, true), [move]);
  const jump = useCallback((p: number) => move(p, false), [move]);

  const light = (found: Ayah | null) => {
    clearTimeout(flashTimer.current);
    setFlash(found);
    if (found) flashTimer.current = setTimeout(() => setFlash(null), 3000);
  };

  useEffect(() => {
    // the pages after this one (and the one before) fetched before they are needed
    const ahead = [page + 1, page + 2, page + 3, page - 1].filter((n) => n >= 1 && n <= TOTAL_PAGES).map(pageUrl);
    Image.prefetch(ahead, 'disk').catch(() => {});
    // where the reader is, for a change of narration (the same place in the other one)
    trackPlace(() => {
      const first = ayatOn(page)[0];
      return first ? `${first.s}:${first.a}` : null;
    });
  }, [page]);

  // previous / next ayah from the tafsir sheet, going to its page when it is on another one
  const moveAyah = (step: 1 | -1) => {
    if (!ayah) return;
    const next = stepAyah(ayah.s, ayah.a, step);
    if (!next) return;
    setAyah({ s: next.s, a: next.a });
    if (next.page !== page) jump(next.page);
  };

  // «Mark here» puts the exact pin on the tapped ayah; on the ayah that carries it, «Remove mark» takes it off
  const pinned = !!menu && pin?.shown === `${menu.s}:${menu.a}`;
  const toggleMark = () => {
    if (!menu) return;
    const { s, a } = menu;
    setMenu(null);
    if (pinned) {
      clearPin();
      say(QURAN.unmarked());
    } else if (setPin(`${s}:${a}`, page)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      say(QURAN.pinned());
    }
    setPinState(savedPin());
  };

  const lit = ayah ?? menu ?? flash;
  const onPage: Chosen[] = ayatOn(page);
  const chosen: Chosen[] = lit ? onPage.filter((e) => e.s === lit.s && e.a === lit.a) : [];

  // the highlighted ayat of the page, and the badges of its comments: in the margin beside the line where the ayah
  // begins, on its outer side (the wider margin), never two on one height (as on the website)
  const notes = useMarks();
  const marks: Marked[] = onPage.flatMap((e) => {
    const h = notes.highlightOf(`${e.s}:${e.a}`);
    return h ? [{ ...e, color: hlColor(h.color).value }] : [];
  });
  const pins: NotePin[] = [];
  const xs = onPage.flatMap((e) => e.boxes.flatMap((b) => [b[0], b[2]]));
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  for (const e of onPage) {
    const n = notes.noteOf(`${e.s}:${e.a}`);
    if (!n || pageOf(e.s, e.a) !== page || !e.boxes.length) continue;
    const [, y0, , y1] = e.boxes[0];
    let y = (y0 + y1) / 2;
    while (pins.some((p) => Math.abs(p.y - y) < 0.04)) y += 0.042;
    pins.push({ s: e.s, a: e.a, x: (minX + maxX) / 2 < 0.5 ? maxX + 0.042 : minX - 0.042, y, color: noteColor(n.color).dot });
  }
  // the exact pin, when it is on this page: its ribbon and underline
  const ribbon: Chosen | null = pin && pin.page === page ? (onPage.find((e) => `${e.s}:${e.a}` === pin.shown) ?? null) : null;

  // the page's size: as big as the room allows, its own shape kept. The room is measured while the chrome is shown and
  // kept while it is hidden, so hiding it never moves or resizes the page.
  const pageW = Math.min(room.width - 10, (room.height - 12) * PAGE_SHAPE);
  const pageH = pageW / PAGE_SHAPE;
  const onLayout = (e: LayoutChangeEvent) => {
    if (hidden) return;
    const { width, height } = e.nativeEvent.layout;
    setRoom((r) => (r.width === width && r.height === height ? r : { width, height }));
  };

  const modes: { value: Mode; label: string }[] = [
    { value: 'read', label: QURAN.modeRead() },
    { value: 'listen', label: QURAN.modeListen() },
    { value: 'recite', label: QURAN.modeRecite() },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View style={headerStyle} pointerEvents={hidden ? 'none' : 'auto'} onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
        <QuranHeader
          page={page}
          mode={modes[0].label}
          onIndex={() => setIndexOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onNotes={() => say(READER.soon())}
          onMode={() => setModeOpen(true)}
        />
      </Animated.View>

      {/* the page's room: what is left under the header */}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {room.width > 0 && room.height > 0 && (
          <PageCurl
            page={page}
            width={room.width}
            height={room.height}
            pageW={pageW}
            pageH={pageH}
            full={false}
            chosen={chosen}
            unzoom={unzoom}
            onTurned={turned}
            marks={marks}
            pins={pins}
            onAyah={(s, a, x, y) => setMenu({ s, a, x, y: y + headH })}
            onPin={(s, a) => setNote({ s, a })}
            onEmptyTap={() => setHidden((h) => !h)}
            onZoomed={setZoomed}
            ribbon={ribbon}
          />
        )}

        {zoomed && (
          <Pressable onPress={() => setUnzoom((n) => n + 1)} accessibilityLabel={READER.wholePage()} style={[styles.whole, { backgroundColor: c.card, borderColor: c.line }]}>
            <ZoomOutIcon color={c.ink} />
          </Pressable>
        )}
        {!!toast && (
          <View pointerEvents="none" style={[styles.toast, { backgroundColor: c.on }]}>
            <Txt size={14} weight={600} color={c.onInk}>
              {toast}
            </Txt>
          </View>
        )}
      </View>

      {/* the modes hang from the header's end corner, the wird's old place (Arabic's end is the left of the screen) */}
      <DropMenu
        open={modeOpen}
        onClose={() => setModeOpen(false)}
        top={menuTop(insets.top)}
        side={LANG === 'ar' ? 'left' : 'right'}
        items={modes.map((m) => ({ key: m.value, label: m.label, chosen: m.value === 'read', onPress: () => m.value !== 'read' && say(READER.soon()) }))}
      />
      <QuranIndex open={indexOpen} page={page} onClose={() => setIndexOpen(false)} onGo={jump} />
      <SearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onGo={(p, found) => {
          jump(p);
          light(found);
        }}
      />
      <AyahSheet ayah={ayah} onClose={() => setAyah(null)} onMove={moveAyah} />
      <AyahMenu
        at={menu}
        onClose={() => setMenu(null)}
        onTafsir={() => {
          setMenu(null);
          if (menu) setAyah({ s: menu.s, a: menu.a });
        }}
        onNote={() => {
          setMenu(null);
          if (menu) setNote({ s: menu.s, a: menu.a });
        }}
        onMark={toggleMark}
        pinned={pinned}
      />
      <NoteSheet note={note} onClose={() => setNote(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  whole: { position: 'absolute', bottom: 12, alignSelf: 'center', width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', bottom: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
});
