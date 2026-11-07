// QURAN tab: the mushaf page, opened at the last page read. One page, three modes (Read, Listen, Recite) chosen from
// the drop-down at the header's end. Read is this file; Listen and Recite are src/components/quran/ListenMode.tsx and
// ReciteMode.tsx: each adds a bar under the page and changes what a tap on an ayah does (Read: its menu; Listen: chooses
// it; Recite: starts the cover again from it).
//   header   the index (fahras) and the search; the notes and the mode drop-down; under them the surah and juz
//   marker   ONE: the page being read ('lastPage', src/lib/position.ts), which follows every turn; plus an exact pin
//            («Mark here» in an ayah's menu, «Remove mark» on the marked ayah), shown as a ribbon on its page
//   full screen   a tap on the page's empty paper (the margins around the text) toggles it: the header, the tab bar and the
//            status bar go and the page grows to fill the screen, on a background of the page's own paper (cut to its
//            text, as the website's full screen). Another tap on the empty paper brings them back, and so does the exit
//            button at the top corner (under the clock), next to the day / night switch, and the phone's back button
//   a long press on an ayah marks it (the same as «Mark here»); a tap on one opens its menu
// The page itself is src/components/PageCurl.tsx.
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AyahMenu, type MenuAt } from '@/components/AyahMenu';
import { AyahSheet, type Ayah } from '@/components/AyahSheet';
import { CollapseIcon, MoonIcon, SunIcon, ZoomOutIcon } from '@/components/icons';
import { NoteSheet, type NoteFor } from '@/components/NoteSheet';
import { PageCurl, type Chosen, type Marked, type Pin as NotePin } from '@/components/PageCurl';
import { DropMenu } from '@/components/quran/DropMenu';
import { useListen } from '@/components/quran/ListenMode';
import { menuTop, QuranHeader } from '@/components/quran/QuranHeader';
import { useRecite } from '@/components/quran/ReciteMode';
import { SearchPanel } from '@/components/quran/SearchPanel';
import { QuranIndex } from '@/components/QuranIndex';
import { Txt } from '@/components/Txt';
import { LANG } from '@/i18n/i18n';
import { QURAN } from '@/i18n/quran';
import { READER } from '@/i18n/reader';
import { markToday } from '@/lib/activity';
import { ayatOn, pageOf, stepAyah } from '@/lib/boxes';
import { FULL_SHAPE, PAGE_SHAPE } from '@/lib/crop';
import { hlColor, noteColor, useMarks } from '@/lib/marks';
import { clampPage, savedPage, savedPin, savePage } from '@/lib/position';
import { TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { trackPlace } from '@/lib/riwaya';
import { clearPin, countPage, setPin } from '@/lib/wird';
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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [headH, setHeadH] = useState(0); // the header block's height: where the page's room begins on the screen
  const [page, setPage] = useState(savedPage);
  const pageRef = useRef(page); // the page before a turn, to tell a turn from a jump
  const [hidden, setHidden] = useState(false); // full screen: header, tab bar and status bar gone; the page fills the screen
  const [room, setRoom] = useState<Room>({ width: 0, height: 0 });
  const [zoomed, setZoomed] = useState(false);
  const [unzoom, setUnzoom] = useState(0); // counts the «whole page» presses (PageCurl zooms out on each)
  const [indexOpen, setIndexOpen] = useState(false);
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

  // the tab bar is drawn by src/app/(tabs)/_layout.tsx, which reads this option
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: hidden ? 'none' : 'flex' } });
  }, [hidden, navigation]);

  // the phone's back button leaves full screen before it leaves the page
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

  // the two other modes: each gives a bar under the page and its own handling of a tap on an ayah
  const listen = useListen(mode === 'listen', page, jump);
  const recite = useRecite(mode === 'recite', page);

  // previous / next ayah from the tafsir sheet, going to its page when it is on another one
  const moveAyah = (step: 1 | -1) => {
    if (!ayah) return;
    const next = stepAyah(ayah.s, ayah.a, step);
    if (!next) return;
    setAyah({ s: next.s, a: next.a });
    if (next.page !== page) jump(next.page);
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

  const lit = ayah ?? menu ?? flash;
  const onPage: Chosen[] = ayatOn(page);
  const chosen: Chosen[] = mode === 'read' && lit ? onPage.filter((e) => e.s === lit.s && e.a === lit.a) : [];

  // the highlighted ayat of the page, and the badges of its comments: in the margin beside the line where the ayah
  // begins, on its outer side (the wider margin), never two on one height (as on the website)
  const notes = useMarks();
  const readMarks: Marked[] = onPage.flatMap((e) => {
    const h = notes.highlightOf(`${e.s}:${e.a}`);
    return h ? [{ ...e, color: hlColor(h.color).value }] : [];
  });
  const marks: Marked[] = mode === 'listen' ? listen.marks : mode === 'read' ? readMarks : [];
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
  const ribbon: Chosen | null = mode === 'read' && pin && pin.page === page ? (onPage.find((e) => `${e.s}:${e.a}` === pin.shown) ?? null) : null;

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
    <View style={{ flex: 1, backgroundColor: hidden ? paperBg : c.screen }}>
      <StatusBar style={isDark ? 'light' : 'dark'} hidden={hidden} />
      {!hidden && (
        <View onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
          <QuranHeader
            page={page}
            mode={modes.find((m) => m.value === mode)?.label ?? modes[0].label}
            onIndex={() => setIndexOpen(true)}
            onSearch={() => setSearchOpen(true)}
            onNotes={() => say(READER.soon())}
            onMode={() => setModeOpen(true)}
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
            unzoom={unzoom}
            onTurned={turned}
            marks={marks}
            pins={pins}
            onAyah={(s, a, x, y) => (mode === 'listen' ? listen.tap(s, a) : mode === 'recite' ? recite.tap(s, a) : setMenu({ s, a, x, y: y + top }))}
            onPin={(s, a) => setNote({ s, a })}
            onHold={mode === 'read' ? markAyah : undefined}
            onEmptyTap={() => setHidden((h) => !h)}
            onZoomed={setZoomed}
            ribbon={ribbon}
            veils={mode === 'recite' ? recite.veils : undefined}
          />
        )}

        {zoomed && (
          <Pressable onPress={() => setUnzoom((n) => n + 1)} accessibilityLabel={READER.wholePage()} style={[styles.whole, { backgroundColor: c.card, borderColor: c.line, bottom: 12 }]}>
            <ZoomOutIcon color={c.ink} />
          </Pressable>
        )}
        {!!toast && (
          <View pointerEvents="none" style={[styles.toast, { backgroundColor: c.on, bottom: 16 }]}>
            <Txt size={14} weight={600} color={c.onInk}>
              {toast}
            </Txt>
          </View>
        )}
      </View>

      {/* the bar of Listen or Recite, under the page (the page's room is what is left between the header and it) */}
      {!hidden && mode === 'listen' && listen.bar}
      {!hidden && mode === 'recite' && recite.bar}

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
      <QuranIndex open={indexOpen} page={page} onClose={() => setIndexOpen(false)} onGo={jump} />
      <SearchPanel
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
        onMark={() => {
          if (!menu) return;
          setMenu(null);
          markAyah(menu.s, menu.a);
        }}
        pinned={!!menu && pinnedAt(menu.s, menu.a)}
      />
      <NoteSheet note={note} onClose={() => setNote(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  whole: { position: 'absolute', bottom: 12, alignSelf: 'center', width: 44, height: 44, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  toast: { position: 'absolute', bottom: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
});
