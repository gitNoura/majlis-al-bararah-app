// QURAN tab: the mushaf page, opened at the last page read. One page, three modes (Read, Listen, Recite) chosen from
// the drop-down at the header's end. Read is this file; Listen and Recite are src/components/quran/ListenMode.tsx and
// ReciteMode.tsx: each adds a bar under the page and changes what a tap on an ayah does (Read: its menu; Listen: chooses
// it; Recite: starts the cover again from it).
//   header   the back button and the index (fahras) at the start; at the end search and the modes' drop-down; under them
//            the surah and juz
//   bottom   Read: a bar like the other modes' (ReadButtons.tsx): pages, highlights and comments (each opens its own list) and
//            settings
//   bookmark   a slim ribbon hanging from the page's top edge, drawn on the page itself (PageCurl.tsx, so it turns with the
//            page): on the left of odd pages, on the right of even ones; a tap puts it on or off
//   marker   ONE: the page being read ('lastPage', src/lib/position.ts), which follows every turn; plus an exact pin
//            (a long press on an ayah marks it; another long press on it takes it off), shown as a fine line under that ayah
//   full screen   (Read only) a tap on the page's empty paper (the margins around the text) toggles it: the header, the tab bar and the
//            status bar go and the page grows to fill the screen, on a background of the page's own paper (cut to its
//            text, as the website's full screen). Another tap on the empty paper brings them back, and so does the exit
//            button at the top corner (under the clock), next to the day / night switch, and the phone's back button
//   a long press on an ayah marks it (its underline; again takes it off); a tap on one opens its menu. The long press is
//            said once on the page the first time, and always in the Bookmarks list while there is no mark
// The page itself is src/components/PageCurl.tsx.
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AyahMenu, type MenuAt } from '@/components/AyahMenu';
import { AyahSheet, type Ayah } from '@/components/AyahSheet';
import { CollapseIcon, MoonIcon, SunIcon } from '@/components/icons';
import { NoteSheet, type NoteFor } from '@/components/NoteSheet';
import { PageCurl, type Chosen, type Marked, type PageMarks, type Pin as NotePin } from '@/components/PageCurl';
import { DropMenu } from '@/components/quran/DropMenu';
import { useListen } from '@/components/quran/ListenMode';
import { MarksSheet, type Tab as MarksTab } from '@/components/quran/MarksSheet';
import { menuTop, QuranHeader } from '@/components/quran/QuranHeader';
import { ReadButtons } from '@/components/quran/ReadButtons';
import { useRecite } from '@/components/quran/ReciteMode';
import { SearchPanel } from '@/components/quran/SearchPanel';
import { QuranIndex } from '@/components/QuranIndex';
import { TajweedGuide } from '@/components/TajweedGuide';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { markToday } from '@/lib/activity';
import { ayatOn, pageOf, stepAyah } from '@/lib/boxes';
import { FULL_SHAPE, PAGE_SHAPE } from '@/lib/crop';
import { hlColor, noteColor, togglePageMark, useMarks } from '@/lib/marks';
import { clampPage, markStopHintSeen, savedPage, savedPin, savePage, stopHintSeen } from '@/lib/position';
import { TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { trackPlace } from '@/lib/riwaya';
import { clearPin, countPage, setPin } from '@/lib/wird';
import { useHome } from '@/theme/home';
import { QuranTheme, useTheme } from '@/theme/theme';

type Mode = 'read' | 'listen' | 'recite';
type Room = { width: number; height: number };


// the buttons on the paper: dark ink on a faint tint, readable on the page's cream in day and in night
const INK = '#3a3326';
const TINT = 'rgba(58, 51, 38, 0.14)';
// the paper's colour as the night dims it (the page is drawn dimmed in night, so the screen around it must match)
const dimmed = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - k));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

function RoundButton({ size, label, onPress, children, style }: { size: number; label: string; onPress: () => void; children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: TINT, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {children}
    </Pressable>
  );
}

// the Quran's screens have their own day / night (src/theme/theme.tsx)
export default function QuranTab() {
  return (
    <QuranTheme>
      <Quran />
    </QuranTheme>
  );
}

function Quran() {
  const { c, isDark, setQuranMode } = useTheme();
  const home = useHome();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headH, setHeadH] = useState(0); // the header block's height: where the page's room begins on the screen
  const [page, setPage] = useState(savedPage);
  const pageRef = useRef(page); // the page before a turn, to tell a turn from a jump
  const [hidden, setHidden] = useState(false); // full screen: header, tab bar and status bar gone; the page fills the screen
  const [room, setRoom] = useState<Room>({ width: 0, height: 0 });
  const [indexOpen, setIndexOpen] = useState(false);
  const [tajweedOpen, setTajweedOpen] = useState(false); // the tajweed guide
  const [marksOpen, setMarksOpen] = useState(false); // the reader's marks
  const [marksTab, setMarksTab] = useState<MarksTab>('pages'); // which list of them
  const [searchOpen, setSearchOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false); // the drop-down of the modes
  const [mode, setMode] = useState<Mode>('read');
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

  // the tab bar is drawn by src/app/(tabs)/_layout.tsx, which reads this option (always hidden here)
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } }); // the Quran page has no tab bar: its back button returns to Home
  }, [navigation]);

  // where the back button goes: Home, or the Hifdh tab when a Hifdh task opened this page
  const params = useLocalSearchParams<{ mode?: string; from?: string; to?: string; back?: string; n?: string; resume?: string }>();
  // a Hifdh task's request (params: mode, from, to, n = a new one each time) switches the mode while rendering, not in an effect
  const [seenReq, setSeenReq] = useState<string | undefined>(undefined);
  if (params.n && params.n !== seenReq && (params.mode === 'listen' || params.mode === 'recite')) {
    setSeenReq(params.n);
    setMode(params.mode);
    setHidden(false);
  }
  // Home's «Continue reading»: Read, at the page of the mark (resume = that page, n = a new one each time)
  const [seenResume, setSeenResume] = useState<string | undefined>(undefined);
  if (params.resume && params.n && params.n !== seenResume) {
    setSeenResume(params.n);
    setMode('read');
    setHidden(false);
  }
  const goBack = useCallback(() => {
    const toHifdh = params.back === 'hifdh';
    router.setParams({ mode: undefined, from: undefined, to: undefined, back: undefined, n: undefined, resume: undefined });
    router.navigate(toHifdh ? '/hifdh' : '/');
  }, [params.back]);

  // the phone's back button leaves full screen, then Listen / Recite, before it leaves the page
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hidden) setHidden(false);
        else if (mode !== 'read') setMode('read');
        else if (params.back === 'hifdh') goBack();
        else return false;
        return true;
      });
      return () => sub.remove();
    }, [hidden, mode, params.back, goBack]),
  );

  // a short message over the page; it clears itself
  const toastMs = useRef(1800);
  const say = (text: string, ms = 1800) => {
    toastMs.current = ms;
    setToast(text);
  };
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), toastMs.current);
    return () => clearTimeout(id);
  }, [toast]);
  // the first time the Quran is opened, and while no stop mark has been put: how to put one (once)
  useEffect(() => {
    if (stopHintSeen() || savedPin()) return;
    const id = setTimeout(() => {
      say(QURAN.stopHint(), 5000);
      markStopHintSeen();
    }, 1200);
    return () => clearTimeout(id);
  }, []);

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
  useEffect(() => {
    // Home's «Continue reading» asks for the page of the mark: a request from another screen, answered once per request
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.resume && params.n) jump(Number(params.resume));
  }, [params.resume, params.n, jump]);

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

  // the two other modes: each gives a bar under the page and its own handling of a tap on an ayah
  const listen = useListen(mode === 'listen', page, jump);
  const recite = useRecite(mode === 'recite', page);

  // A Hifdh task opens this page in Listen or Recite on its ayat (params: mode, from, to, n = a new request each time):
  // the page of its first ayah, Listen with the range chosen, Recite with the ayat before it shown.
  const { choose } = listen;
  const { startAt } = recite;
  useEffect(() => {
    if (!params.n || (params.mode !== 'listen' && params.mode !== 'recite')) return;
    const { from, to } = params;
    if (!from) return;
    const [s, a] = from.split(':').map(Number);
    jump(pageOf(s, a) ?? pageRef.current);
    if (params.mode === 'listen') choose({ from, to: to || from });
    else startAt(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.n]);

  // previous / next ayah from the tafsir sheet, going to its page when it is on another one
  const moveAyah = (step: 1 | -1) => {
    if (!ayah) return;
    const next = stepAyah(ayah.s, ayah.a, step);
    if (!next) return;
    setAyah({ s: next.s, a: next.a });
    if (next.page !== page) jump(next.page);
  };

  // a similar ayah (the sheet's third tab) was chosen: go to it, on its page, and show its own similar ayat
  const goToAyah = (s: number, a: number) => {
    setAyah({ s, a });
    const target = pageOf(s, a);
    if (target && target !== page) jump(target);
  };

  // «Mark here» puts the exact pin on an ayah (a long press, or the ayah menu); on the ayah that carries it, the same
  // gesture takes it off
  const pinnedAt = (s: number, a: number) => pin?.shown === `${s}:${a}`;
  const markAyah = (s: number, a: number) => {
    if (pinnedAt(s, a)) {
      clearPin();
      say(QURAN.unmarked());
    } else if (setPin(`${s}:${a}`, page)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      say(QURAN.pinned());
    }
    setPinState(savedPin());
  };

  // a tap on the page's bookmark ribbon puts it on or takes it off
  const toggleBookmark = () => {
    Haptics.selectionAsync().catch(() => {});
    say(togglePageMark(page) ? QURAN.pageMarked() : QURAN.pageUnmarked());
  };

  const lit = ayah ?? menu ?? flash;
  const onPage: Chosen[] = ayatOn(page);
  const chosen: Chosen[] = mode === 'read' && lit ? onPage.filter((e) => e.s === lit.s && e.a === lit.a) : [];

  // What is drawn on a page: its highlighted ayat, the badges of its comments (in the margin beside the line where the ayah
  // begins, on its outer side (the wider margin), never two on one height, as on the website), the pin's ayah, and whether
  // the page is bookmarked. The page read and the pages either side are all made here, so a page turning in already
  // carries its marks from the first frame of the turn (src/components/PageCurl.tsx draws them with the page).
  const notes = useMarks();
  const marksOf = (p: number): PageMarks => {
    const list = ayatOn(p) as Chosen[]; // boxes.js is untyped
    const found: Marked[] = list.flatMap((e) => {
      const h = notes.highlightOf(`${e.s}:${e.a}`);
      return h ? [{ ...e, color: hlColor(h.color).value }] : [];
    });
    const badges: NotePin[] = [];
    const xs = list.flatMap((e) => e.boxes.flatMap((b) => [b[0], b[2]]));
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
    for (const e of list) {
      const n = notes.noteOf(`${e.s}:${e.a}`);
      if (!n || pageOf(e.s, e.a) !== p || !e.boxes.length) continue;
      const [, y0, , y1] = e.boxes[0];
      let y = (y0 + y1) / 2;
      while (badges.some((q) => Math.abs(q.y - y) < 0.04)) y += 0.042;
      badges.push({ s: e.s, a: e.a, x: (minX + maxX) / 2 < 0.5 ? maxX + 0.042 : minX - 0.042, y, color: noteColor(n.color).dot });
    }
    // the exact pin, when it is on this page
    const pinned: Chosen | null = pin && pin.page === p ? (list.find((e) => `${e.s}:${e.a}` === pin.shown) ?? null) : null;
    return { marks: found, pins: badges, ribbon: pinned, bookmarked: notes.pageMarked(p) };
  };
  const here = marksOf(page);
  // the page read in Listen shows the ayat being listened to as its highlights; in Recite nothing is marked
  const marks: Marked[] = mode === 'listen' ? listen.marks : mode === 'read' ? here.marks : [];
  // comments' badges and the bookmark belong to Read only: Listen and Recite show the bare page
  const pins: NotePin[] = mode === 'read' ? here.pins : [];
  const ribbon: Chosen | null = mode === 'read' ? here.ribbon : null;
  // the pages either side, made the same way as the page read (Listen and Recite show no marks, comments or bookmark there)
  const around: Record<number, PageMarks> = {};
  for (const p of [page - 1, page + 1]) {
    if (p < 1 || p > TOTAL_PAGES) continue;
    const m = marksOf(p);
    around[p] = mode === 'read' ? m : { ...m, marks: [], pins: [], ribbon: null, bookmarked: false };
  }

  // the page's size: as big as the room allows, its own shape kept. In full screen the header and the tab bar are gone, so
  // the room is the whole screen (less the notch and the home bar) and the page is the text's own shape, edge to edge.
  const padTop = hidden ? insets.top : 0;
  const padBottom = hidden ? insets.bottom : 0;
  const shape = hidden ? FULL_SHAPE : PAGE_SHAPE;
  const pageW = Math.min(room.width - (hidden ? 0 : 10), (room.height - (hidden ? 0 : 12)) * shape);
  const pageH = pageW / shape;
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const usable = height - padTop - padBottom;
    setRoom((r) => (r.width === width && r.height === usable ? r : { width, height: usable }));
  };
  const top = hidden ? insets.top : headH; // where the room begins on the screen (the ayah's menu is placed by it)
  const paperBg = isDark ? dimmed(c.paper, c.nightDim) : c.paper;

  const modes: { value: Mode; label: string }[] = [
    { value: 'read', label: QURAN.modeRead() },
    { value: 'listen', label: QURAN.modeListen() },
    { value: 'recite', label: QURAN.modeRecite() },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: hidden ? paperBg : home.screen }}>
      <StatusBar style={isDark ? 'light' : 'dark'} hidden={hidden} />
      {!hidden && (
        <View onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
          <QuranHeader
            page={page}
            mode={modes.find((m) => m.value === mode)?.label ?? modes[0].label}
            onBack={goBack}
            onIndex={() => setIndexOpen(true)}
            onMode={() => setModeOpen(true)}
            onSearch={() => setSearchOpen(true)}
          />
        </View>
      )}

      {/* the page's room: what is left under the header */}
      <View style={{ flex: 1, paddingTop: padTop, paddingBottom: padBottom }} onLayout={onLayout}>
        {room.width > 0 && room.height > 0 && (
          <PageCurl
            page={page}
            width={room.width}
            height={room.height}
            pageW={pageW}
            pageH={pageH}
            full={hidden}
            chosen={chosen}
            unzoom={0}
            onTurned={turned}
            marks={marks}
            pins={pins}
            onAyah={(s, a, x, y) => (mode === 'listen' ? listen.tap(s, a) : mode === 'recite' ? recite.tap(s, a) : setMenu({ s, a, x, y: y + top }))}
            onPin={(s, a) => setNote({ s, a })}
            onHold={mode === 'read' ? markAyah : undefined}
            onEmptyTap={() => {
              if (mode === 'read') setHidden((h) => !h); // Listen and Recite keep their bar: no full screen there
            }}
            onZoomed={() => {}}
            ribbon={ribbon}
            bookmarked={mode === 'read' && here.bookmarked}
            onBookmark={mode === 'read' ? toggleBookmark : undefined}
            onLegend={mode === 'read' ? () => setTajweedOpen(true) : undefined}
            around={around}
            veils={mode === 'recite' ? recite.veils : undefined}
          />
        )}

        {!!toast && (
          <View pointerEvents="none" style={[styles.toast, { backgroundColor: home.forest, bottom: 16 }]}>
            <Txt size={14} weight={600} color={home.forestInk}>
              {toast}
            </Txt>
          </View>
        )}
      </View>

      {/* under the page: the bar of the mode (the page's room is what is left between the header and this; the page hangs
          from its top) */}
      {!hidden && (
        <View style={{ paddingBottom: insets.bottom }}>
          {mode === 'listen' ? (
            listen.bar
          ) : mode === 'recite' ? (
            recite.bar
          ) : (
            <ReadButtons
              onMarks={(tab) => {
                setMarksTab(tab);
                setMarksOpen(true);
              }}
            />
          )}
        </View>
      )}

      {/* in full screen: exit and the day / night switch, at the top corner just under the clock and the wifi */}
      {hidden && (
        <View style={[{ position: 'absolute', zIndex: 5, top: insets.top + 8, flexDirection: 'row', gap: 10, direction: 'ltr' }, LANG === 'ar' ? { left: 12 } : { right: 12 }]}>
          {(LANG === 'ar' ? ['exit', 'theme'] : ['theme', 'exit']).map((k) =>
            k === 'exit' ? (
              <RoundButton key={k} size={44} label={READER.exitFull()} onPress={() => setHidden(false)}>
                <CollapseIcon color={INK} size={22} />
              </RoundButton>
            ) : (
              <RoundButton key={k} size={44} label={READER.theme()} onPress={() => setQuranMode(isDark ? 'light' : 'dark')}>
                {isDark ? <SunIcon color={INK} size={22} /> : <MoonIcon color={INK} size={22} />}
              </RoundButton>
            ),
          )}
        </View>
      )}

      {/* the modes hang from the header's end corner, the wird's old place (Arabic's end is the left of the screen) */}
      <DropMenu
        open={modeOpen}
        onClose={() => setModeOpen(false)}
        top={menuTop(insets.top)}
        side={LANG === 'ar' ? 'left' : 'right'}
        items={modes.map((m) => ({ key: m.value, label: m.label, chosen: m.value === mode, onPress: () => setMode(m.value) }))}
      />
      {listen.sheet}
      <QuranIndex open={indexOpen} page={page} onClose={() => setIndexOpen(false)} onGo={jump} onPlay={mode === 'listen' ? listen.playSurahNo : undefined} />
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onGo={(p, found) => {
          jump(p);
          light(found);
        }}
      />
      <AyahSheet ayah={ayah} onClose={() => setAyah(null)} onMove={moveAyah} onGo={goToAyah} />
      <TajweedGuide open={tajweedOpen} onClose={() => setTajweedOpen(false)} />
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
      />
      <NoteSheet note={note} onClose={() => setNote(null)} />
      <MarksSheet
        open={marksOpen}
        tab={marksTab}
        onClose={() => setMarksOpen(false)}
        onGo={(p) => {
          setMarksOpen(false);
          jump(p);
        }}
        pin={pin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', bottom: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
});
