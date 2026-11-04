// The Quran page (the website's reader, rebuilt for the phone): the ivory screen with its faint stars
// (the dark grey at night), the orange tree in the corner by day and the lantern at night, lighting the
// stars around it; the mushaf's pages, turned as on the website (src/components/PageCurl.tsx); at the
// top «back», the wird in a round of frosted glass, and the surah with its hizb and juz (a tap opens
// the index); along the bottom edge a bar of five buttons, each icon over its name - full screen, the
// index, search, my notebook, the settings. A tap on an ayah lights it and opens its tafsir and
// translation. The page read is kept ('lastPage', as on the website) and the next ones fetched ahead.
//
// Full screen, as on the website: the bars go, the page is cut to its text and fills the screen, the
// screen is the page's paper by day; four round buttons at the top - the index and search on the left,
// leave and night / day on the right (by day just their icons, no glass) - fade after 5 s untouched
// and come back with a touch. In both
// modes two fingers zoom in on the page; while zoomed, a round button at the bottom brings back the
// whole page.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AyahSheet, type Ayah } from '@/components/AyahSheet';
import { BottomPanel, PANEL_H, PanelTab } from '@/components/BottomPanel';
import { Glass, GlassBackdrop } from '@/components/Glass';
import {
  BackIcon,
  BookOpenIcon,
  CloseIcon,
  ExpandIcon,
  MenuIcon,
  MoonIcon,
  NotebookIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  ZoomOutIcon,
} from '@/components/icons';
import { Lantern, lanternBox } from '@/components/Lantern';
import { AyahMenu, type MenuAt } from '@/components/AyahMenu';
import { NoteSheet, type NoteFor } from '@/components/NoteSheet';
import { PageCurl, type Chosen, type Marked, type Pin } from '@/components/PageCurl';
import { QuranIndex } from '@/components/QuranIndex';
import { ScreenBackground } from '@/components/Stars';
import { Tree } from '@/components/Tree';
import { Txt } from '@/components/Txt';
import { isEnglish, surahName, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { markToday } from '@/lib/activity';
import { ayatOn, pageOf, stepAyah, surahsOn } from '@/lib/boxes';
import { hlColor, noteColor, useMarks } from '@/lib/marks';
import { FULL_SHAPE, PAGE_SHAPE } from '@/lib/crop';
import { hizbForPage, juzForPage, SURAHS, TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { onReaderGo } from '@/lib/reader-nav';
import { trackPlace } from '@/lib/riwaya';
import { readJSON, writeJSON } from '@/lib/storage';
import { QuranTheme, useTheme } from '@/theme/theme';

const IDLE_MS = 5000; // full screen: the round buttons fade after this long untouched
const NAME_DROP = 94; // the surah's name, 1.5 cm lower than the top buttons (about 63 points a cm)
const NAME_H = 46;

const savedPage = () => {
  const p = Number(readJSON('lastPage', 1));
  return p >= 1 && p <= TOTAL_PAGES ? p : 1;
};

function location(page: number) {
  const names = (surahsOn(page).length ? surahsOn(page) : [1]).map((n: number) => surahName(SURAHS[n - 1]));
  const surahs = names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – ');
  return { surahs, extra: `${t('hizb', hizbForPage(page).number)}  •  ${t('juz', juzForPage(page).number)}` };
}

// the Quran's screens have their own day / night (src/theme/theme.tsx)
export default function QuranScreen() {
  return (
    <QuranTheme>
      <Quran />
    </QuranTheme>
  );
}

function Quran() {
  const { c, isDark, setQuranMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [page, setPage] = useState(savedPage);
  const [full, setFull] = useState(false); // full screen: the bars hidden, the page cut to its text
  const [awake, setAwake] = useState(true); // full screen: its round buttons shown
  const [zoomed, setZoomed] = useState(false);
  const [unzoom, setUnzoom] = useState(0); // counts the «whole page» presses (PageCurl zooms out on each)
  const [indexOpen, setIndexOpen] = useState(false);
  const [ayah, setAyah] = useState<Ayah | null>(null); // its tafsir open
  const [menu, setMenu] = useState<MenuAt | null>(null); // its options open
  const [note, setNote] = useState<NoteFor | null>(null); // its comment open
  const [flash, setFlash] = useState<Ayah | null>(null); // an ayah lit a moment (found by search)
  const [toast, setToast] = useState('');
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    markToday('quran');
    return () => {
      clearTimeout(idle.current);
      clearTimeout(flashTimer.current);
    };
  }, []);

  // the page read: kept, and the pages after it (and the one before) fetched before they are needed
  const turned = useCallback((p: number) => {
    const target = Math.min(TOTAL_PAGES, Math.max(1, p));
    setPage(target);
    writeJSON('lastPage', target);
  }, []);
  useEffect(() => {
    const ahead = [page + 1, page + 2, page + 3, page - 1].filter((n) => n >= 1 && n <= TOTAL_PAGES).map(pageUrl);
    Image.prefetch(ahead, 'disk').catch(() => {});
    // where the reader is, for a change of narration (the same place in the other one)
    trackPlace(() => {
      const first = ayatOn(page)[0];
      return first ? `${first.s}:${first.a}` : null;
    });
  }, [page]);

  // search sends the reader to a page: it opens, and the ayah found is lit for 3 s
  useEffect(
    () =>
      onReaderGo((p, found) => {
        turned(p);
        setFlash(found);
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), 3000);
      }),
    [turned],
  );

  // full screen's buttons: shown on a touch, faded after 5 s without one
  const wake = () => {
    setAwake(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setAwake(false), IDLE_MS);
  };
  const enterFull = () => {
    setFull(true);
    wake();
  };
  const leaveFull = () => {
    clearTimeout(idle.current);
    setAwake(true);
    setFull(false);
  };
  const shown = useSharedValue(1);
  useEffect(() => {
    shown.set(withTiming(awake ? 1 : 0, { duration: 600 }));
  }, [awake, shown]);
  const fade = useAnimatedStyle(() => ({ opacity: shown.get() }));

  // the page's size: as big as the room between the bars allows (in full screen, the whole screen),
  // the page's own shape kept
  const top = full ? insets.top + 12 : insets.top + 96;
  const bottom = full ? insets.bottom + 8 : insets.bottom + PANEL_H + 6;
  const roomH = height - top - bottom;
  const shape = full ? FULL_SHAPE : PAGE_SHAPE;
  const pageW = full ? Math.min(width - 16, roomH * shape) : Math.min(width - 10, (roomH - 12) * shape);
  const pageH = pageW / shape;
  // the surah's name: 1.5 cm below the top buttons' line, but never lower than just above the page
  const nameTop = Math.min(insets.top + 10 + NAME_DROP, top + (roomH - pageH) / 2 - NAME_H - 6);

  // previous / next ayah from the sheet, turning the page when it is on another one
  const moveAyah = (step: 1 | -1) => {
    if (!ayah) return;
    const next = stepAyah(ayah.s, ayah.a, step);
    if (!next) return;
    setAyah({ s: next.s, a: next.a });
    if (next.page !== page) turned(next.page);
  };

  const soon = () => {
    setToast(READER.soon());
    setTimeout(() => setToast(''), 1800);
  };
  const openSearch = () => router.push('/quran-search');

  const here = useMemo(() => location(page), [page]);
  const lit = ayah ?? menu ?? flash;
  const chosen: Chosen[] = lit ? ayatOn(page).filter((e: Chosen) => e.s === lit.s && e.a === lit.a) : [];

  // the highlighted ayat of the page, and the badges of its comments: in the margin beside the line
  // where the ayah begins, on its outer side (the wider margin), never two on one height (as on the
  // website)
  const marked = useMarks();
  const onPage: Chosen[] = ayatOn(page);
  const marks: Marked[] = onPage.flatMap((e) => {
    const h = marked.highlightOf(`${e.s}:${e.a}`);
    return h ? [{ ...e, color: hlColor(h.color).value }] : [];
  });
  const pins: Pin[] = [];
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

  // the corner: the left one in Arabic (the right one is «back»), the right one in English and French
  const side = isEnglish ? 'right' : 'left';
  // the start and end of a line in this language (absolute places are not turned round by the phone)
  const startSide = isEnglish ? 'left' : 'right';
  const endSide = isEnglish ? 'right' : 'left';
  const box = lanternBox();

  // full screen by day: the screen is the page's paper
  const screen = full && !isDark ? c.paper : c.screen;

  return (
    <View style={{ flex: 1, backgroundColor: screen, overflow: 'hidden' }} onTouchStart={full ? wake : undefined}>
      <StatusBar style={isDark ? 'light' : 'dark'} hidden={full} />
      <GlassBackdrop
        glass={
          <>
            {/* the top: «back» and the wird */}
            {!full && (
              <View style={[styles.top, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
                <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityLabel={READER.home()}>
                  <BackIcon color={c.ink} rtl={!isEnglish} />
                </Pressable>
                <Pressable onPress={soon} accessibilityLabel={READER.wird()}>
                  <Glass style={styles.round}>
                    <BookOpenIcon color={c.ink} />
                  </Glass>
                </Pressable>
              </View>
            )}

            {/* where the reader is, above the page (a tap opens the index) */}
            {!full && (
              <View style={[styles.name, { top: nameTop, height: NAME_H }]} pointerEvents="box-none">
                <Pressable onPress={() => setIndexOpen(true)} style={styles.where}>
                  <Txt size={18} weight={700} center color={c.ink} numberOfLines={1}>
                    {here.surahs}
                  </Txt>
                  <Txt size={13} center color={c.meta}>
                    {here.extra}
                  </Txt>
                </Pressable>
              </View>
            )}

            {/* full screen: the index and search at the line's start (left in English and French, right in
                Arabic), leave and night / day at its end */}
            {full && (
              <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents={awake ? 'box-none' : 'none'}>
                <RoundButton at={{ top: insets.top + 14, [startSide]: 14 }} label={READER.surahs()} onPress={() => setIndexOpen(true)} bare={!isDark}>
                  <MenuIcon color={c.ink} />
                </RoundButton>
                <RoundButton at={{ top: insets.top + 14, [startSide]: 66 }} label={READER.search()} onPress={openSearch} bare={!isDark}>
                  <SearchIcon color={c.ink} />
                </RoundButton>
                <RoundButton at={{ top: insets.top + 14, [endSide]: 14 }} label={READER.exitFull()} onPress={leaveFull} bare={!isDark}>
                  <CloseIcon color={c.ink} />
                </RoundButton>
                <RoundButton
                  at={{ top: insets.top + 14, [endSide]: 66 }}
                  label={READER.theme()}
                  onPress={() => setQuranMode(isDark ? 'light' : 'dark')}
                  bare={!isDark}
                >
                  {isDark ? <SunIcon color={c.ink} /> : <MoonIcon color={c.ink} />}
                </RoundButton>
              </Animated.View>
            )}

            {/* zoomed in: back to the whole page */}
            {zoomed && (
              <RoundButton
                at={{ bottom: full ? insets.bottom + 16 : insets.bottom + PANEL_H + 12, left: width / 2 - 23 }}
                label={READER.wholePage()}
                onPress={() => setUnzoom((n) => n + 1)}
              >
                <ZoomOutIcon color={c.ink} />
              </RoundButton>
            )}

            {/* the bar along the bottom edge: full screen, the index, search, my notebook, the settings */}
            {!full && (
              <BottomPanel>
                <PanelTab label={READER.fullscreen()} onPress={enterFull} icon={<ExpandIcon color={c.meta} />} />
                <PanelTab label={READER.surahs()} onPress={() => setIndexOpen(true)} icon={<MenuIcon color={c.meta} />} />
                <PanelTab label={READER.search()} onPress={openSearch} icon={<SearchIcon color={c.meta} />} />
                <PanelTab label={READER.notebook()} onPress={soon} icon={<NotebookIcon color={c.meta} />} />
                <PanelTab label={READER.settings()} onPress={() => router.push('/quran-settings')} icon={<SettingsIcon color={c.meta} />} />
              </BottomPanel>
            )}
          </>
        }
      >
        {/* behind the glass: the background, the corner, the pages */}
        {!full && <ScreenBackground />}
        {!full &&
          (isDark ? (
            <View style={[styles.corner, { top: insets.top - box.y, [side]: 18 - box.x }]} pointerEvents="none">
              <Lantern />
            </View>
          ) : (
            <View style={[styles.corner, { top: insets.top, left: 0 }]} pointerEvents="box-none">
              <Tree kind="orange" mirrored={isEnglish} room={{ width, height: height - insets.top }} />
            </View>
          ))}
        <View style={{ position: 'absolute', top, left: 0, right: 0, height: roomH }}>
          <PageCurl
            page={page}
            width={width}
            height={roomH}
            pageW={pageW}
            pageH={pageH}
            full={full}
            chosen={chosen}
            unzoom={unzoom}
            onTurned={turned}
            marks={marks}
            pins={pins}
            onAyah={(s, a, x, y) => setMenu({ s, a, x, y: y + top })}
            onPin={(s, a) => setNote({ s, a })}
            onEmptyTap={() => full && wake()}
            onZoomed={setZoomed}
          />
        </View>
      </GlassBackdrop>

      {!!toast && (
        <View
          style={[
            styles.toast,
            { bottom: full ? insets.bottom + 24 : insets.bottom + PANEL_H + 16, backgroundColor: isDark ? '#2f6650' : '#173f32' },
          ]}
        >
          <Txt size={14} weight={600} color="#fff">
            {toast}
          </Txt>
        </View>
      )}

      <QuranIndex open={indexOpen} page={page} onClose={() => setIndexOpen(false)} onGo={turned} />
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
      />
      <NoteSheet note={note} onClose={() => setNote(null)} />
    </View>
  );
}

// one of the bar's buttons: its icon over its name, the five sharing the width
// a round button of frosted glass over the page (full screen's, «the whole page»), placed at `at`;
// `bare`: no glass, the icon alone (full screen by day)
function RoundButton({ at, label, onPress, bare, children }: { at: object; label: string; onPress: () => void; bare?: boolean; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.float, at, pressed && bare && { opacity: 0.5 }]} hitSlop={6} accessibilityLabel={label}>
      {bare ? <View style={styles.roundSmall}>{children}</View> : <Glass style={styles.roundSmall}>{children}</Glass>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4, zIndex: 5 },
  back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  round: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  roundSmall: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  float: { position: 'absolute', zIndex: 6 },
  name: { position: 'absolute', left: 70, right: 70, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  where: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10 },
  corner: { position: 'absolute', zIndex: 4 },
  toast: { position: 'absolute', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999 },
});
