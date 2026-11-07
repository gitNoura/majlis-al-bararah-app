// QURAN tab: the mushaf page, opened at the last page read. One page, three modes under the header (Read, Listen,
// Recite); this is Read. Listen and Recite come next (phase c2) on this same page.
//   header   surah, juz and page (a tap opens Find), and a thin bar of the khatma's progress (a tap opens the khatma sheet)
//   tools    Find, Notes, Display
//   marker   ONE: the page being read ('lastPage', src/lib/position.ts), which follows every turn; plus an exact pin
//            («Mark here» in an ayah's menu), shown as a ribbon on its page
//   a tap on the page outside its ayat hides the header, the switch, the tools and the tab bar (the page is then cut to
//   its text and fills the screen, as the website's full screen); another tap brings them back
// The page itself is src/components/PageCurl.tsx, unchanged.
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AyahMenu, type MenuAt } from '@/components/AyahMenu';
import { AyahSheet, type Ayah } from '@/components/AyahSheet';
import { ContrastIcon, NotebookIcon, SearchIcon, ZoomOutIcon } from '@/components/icons';
import { NoteSheet, type NoteFor } from '@/components/NoteSheet';
import { PageCurl, type Chosen, type Marked, type Pin as NotePin } from '@/components/PageCurl';
import { DisplaySheet } from '@/components/quran/DisplaySheet';
import { FindSheet } from '@/components/quran/FindSheet';
import { KhatmaSheet } from '@/components/quran/KhatmaSheet';
import { DropMenu } from '@/components/quran/DropMenu';
import { menuTop, QuranHeader } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { WirdEnd } from '@/components/Wird';
import { LANG, t } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { markToday } from '@/lib/activity';
import { ayatOn, pageOf, stepAyah } from '@/lib/boxes';
import { FULL_SHAPE, PAGE_SHAPE } from '@/lib/crop';
import { hlColor, noteColor, useMarks } from '@/lib/marks';
import { DIM_PAPER, useNightPage } from '@/lib/nightPage';
import { clampPage, savedPage, savedPin, savePage } from '@/lib/position';
import { TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { trackPlace } from '@/lib/riwaya';
import { clearPin, countPage, setPin, type Done } from '@/lib/wird';
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
  const nightPage = useNightPage();
  const [page, setPage] = useState(savedPage);
  const pageRef = useRef(page); // the page before a turn, to tell a turn from a jump
  const [hidden, setHidden] = useState(false); // the header, switch, tools and tab bar hidden; the page cut to its text
  const [room, setRoom] = useState<Room>({ width: 0, height: 0 });
  const [zoomed, setZoomed] = useState(false);
  const [unzoom, setUnzoom] = useState(0); // counts the «whole page» presses (PageCurl zooms out on each)
  const [findOpen, setFindOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [khatmaOpen, setKhatmaOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false); // the drop-down of the modes
  const [toolsOpen, setToolsOpen] = useState(false); // the drop-down of the tools
  const [ayah, setAyah] = useState<Ayah | null>(null); // its tafsir open
  const [menu, setMenu] = useState<MenuAt | null>(null); // its options open
  const [note, setNote] = useState<NoteFor | null>(null); // its comment open
  const [flash, setFlash] = useState<Ayah | null>(null); // an ayah lit a moment (found by Find)
  const [pin, setPinState] = useState(savedPin);
  const [done, setDone] = useState<Done | null>(null); // the khatma's closing card
  const [toast, setToast] = useState('');
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    markToday('quran');
    return () => {
      clearTimeout(flashTimer.current);
    };
  }, []);

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

  // «Mark here»: the exact pin goes on the ayah
  const markHere = () => {
    if (!menu) return;
    const { s, a } = menu;
    setMenu(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPin(`${s}:${a}`, page).then((d) => {
      setPinState(savedPin());
      say(QURAN.pinned());
      if (d?.khatma) setDone(d);
    });
  };

  const lit = ayah ?? menu ?? flash;
  const onPage: Chosen[] = ayatOn(page);
  const chosen: Chosen[] = lit ? onPage.filter((e) => e.s === lit.s && e.a === lit.a) : [];

  // the highlighted ayat of the page, and the badges of its comments: in the margin beside the line where the ayah
  // begins, on its outer side (the wider margin), never two on one height (as on the website)
  const marked = useMarks();
  const marks: Marked[] = onPage.flatMap((e) => {
    const h = marked.highlightOf(`${e.s}:${e.a}`);
    return h ? [{ ...e, color: hlColor(h.color).value }] : [];
  });
  const pins: NotePin[] = [];
  const xs = onPage.flatMap((e) => e.boxes.flatMap((b) => [b[0], b[2]]));
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  for (const e of onPage) {
    const n = marked.noteOf(`${e.s}:${e.a}`);
    if (!n || pageOf(e.s, e.a) !== page || !e.boxes.length) continue;
    const [, y0, , y1] = e.boxes[0];
    let y = (y0 + y1) / 2;
    while (pins.some((p) => Math.abs(p.y - y) < 0.04)) y += 0.042;
    pins.push({ s: e.s, a: e.a, x: (minX + maxX) / 2 < 0.5 ? maxX + 0.042 : minX - 0.042, y, color: noteColor(n.color).dot });
  }
  // the exact pin, when it is on this page: its ribbon and underline
  const ribbon: Chosen | null = pin && pin.page === page ? (onPage.find((e) => `${e.s}:${e.a}` === pin.shown) ?? null) : null;

  // the page's size: as big as the room allows, its own shape kept (hidden: the page cut to its text, wider and shorter)
  const shape = hidden ? FULL_SHAPE : PAGE_SHAPE;
  const pageW = Math.min(room.width - (hidden ? 16 : 10), (room.height - (hidden ? 0 : 12)) * shape);
  const pageH = pageW / shape;
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setRoom((r) => (r.width === width && r.height === height ? r : { width, height }));
  };

  // hidden: the screen is the page's paper by day; at night the dark screen or the dimmed paper
  const screen = !hidden ? c.screen : !isDark ? c.paper : nightPage === 'dim' ? DIM_PAPER : c.screen;
  // the mushaf's odd pages are the right-hand ones, the even pages the left-hand ones (the side of the book)
  const rightHand = page % 2 === 1;

  const modes: { value: Mode; label: string }[] = [
    { value: 'read', label: QURAN.modeRead() },
    { value: 'listen', label: QURAN.modeListen() },
    { value: 'recite', label: QURAN.modeRecite() },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: screen }}>
      <StatusBar style={isDark ? 'light' : 'dark'} hidden={hidden} />
      {!hidden && (
        <View onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
          <QuranHeader
            page={page}
            mode={modes[0].label}
            onFind={() => setFindOpen(true)}
            onKhatma={() => setKhatmaOpen(true)}
            onMode={() => setModeOpen(true)}
            onTools={() => setToolsOpen(true)}
          />
        </View>
      )}

      {/* the page's room: what is left between the header and the tools (the whole screen when hidden) */}
      <View style={{ flex: 1, paddingTop: hidden ? insets.top + 12 : 0, paddingBottom: hidden ? insets.bottom + 8 : 0 }}>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          {room.width > 0 && room.height > 0 && (
            <PageCurl
              page={page}
              width={room.width}
              height={room.height}
              pageW={pageW}
              pageH={pageH}
              full={hidden}
              chosen={chosen}
              unzoom={unzoom}
              onTurned={turned}
              marks={marks}
              pins={pins}
              onAyah={(s, a, x, y) => setMenu({ s, a, x, y: y + (hidden ? insets.top + 12 : headH) })}
              onPin={(s, a) => setNote({ s, a })}
              onEmptyTap={() => setHidden((h) => !h)}
              onZoomed={setZoomed}
              ribbon={ribbon}
            />
          )}

          {/* which side of the book this page is: the right-hand or the left-hand one */}
          <View
            pointerEvents="none"
            accessible
            accessibilityLabel={rightHand ? QURAN.rightPage() : QURAN.leftPage()}
            style={[styles.side, { backgroundColor: c.soft }, rightHand ? { right: 6 } : { left: 6 }]}
          >
            <Txt size={12} weight={700} color={c.meta}>
              {t('pageShort', page)}
            </Txt>
          </View>

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
      </View>

      {/* the drop-downs hang from the header's two corners: the modes at the end of the line (the wird's old place), the
          tools at its start. The modes keep the line's direction: Arabic's end is the left of the screen. */}
      <DropMenu
        open={modeOpen}
        onClose={() => setModeOpen(false)}
        top={menuTop(insets.top)}
        side={LANG === 'ar' ? 'left' : 'right'}
        items={modes.map((m) => ({ key: m.value, label: m.label, chosen: m.value === 'read', onPress: () => m.value !== 'read' && say(READER.soon()) }))}
      />
      <DropMenu
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        top={menuTop(insets.top)}
        side={LANG === 'ar' ? 'right' : 'left'}
        items={[
          { key: 'find', label: QURAN.find(), icon: <SearchIcon color={c.ink} size={20} />, onPress: () => setFindOpen(true) },
          { key: 'notes', label: QURAN.notes(), icon: <NotebookIcon color={c.ink} size={20} />, onPress: () => say(READER.soon()) },
          { key: 'display', label: QURAN.display(), icon: <ContrastIcon color={c.ink} size={20} />, onPress: () => setDisplayOpen(true) },
        ]}
      />

      <FindSheet
        open={findOpen}
        page={page}
        onClose={() => setFindOpen(false)}
        onGo={(p, found) => {
          jump(p);
          light(found);
        }}
      />
      <DisplaySheet open={displayOpen} onClose={() => setDisplayOpen(false)} />
      <KhatmaSheet
        open={khatmaOpen}
        onClose={() => setKhatmaOpen(false)}
        page={page}
        pin={pin}
        onGoPin={() => {
          setKhatmaOpen(false);
          if (pin) {
            jump(pin.page);
            const [s, a] = pin.shown.split(':').map(Number);
            light({ s, a });
          }
        }}
        onClearPin={() => {
          clearPin();
          setPinState(savedPin());
        }}
      />
      <WirdEnd done={done} onClose={() => setDone(null)} />
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
        onMark={markHere}
      />
      <NoteSheet note={note} onClose={() => setNote(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  side: { position: 'absolute', bottom: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  whole: { position: 'absolute', bottom: 12, alignSelf: 'center', width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', bottom: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
});
