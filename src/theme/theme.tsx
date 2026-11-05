// Day or night: the reader's choice ('light', 'dark', 'auto' to follow the phone, or 'time': by prayer
// time - night from al-Maghrib until al-Fajr, the first choice when none was made), saved as on the
// website ('theme'). useTheme() gives the colours of the moment (src/theme/tokens.ts).
//
// The Quran section has its own mode, as on the website (its settings.js): its night / day switch (the
// Quran's settings, full screen's button) sets the Quran's screens only ('mushafTheme'); choosing the
// app's mode makes the Quran follow it again. The Quran's screens are wrapped in <QuranTheme>, inside
// which useTheme() gives the Quran's colours.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { nightByPrayer } from '@/lib/prayer';
import { readJSON, writeJSON } from '@/lib/storage';
import { dark, light, type Palette } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'auto' | 'time';
type Shade = 'light' | 'dark';

type Theme = {
  c: Palette;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  quranMode: Shade | null; // the Quran's own mode, if one was chosen there
  setQuranMode: (mode: Shade) => void;
};

const ThemeContext = createContext<Theme>({
  c: light,
  isDark: false,
  mode: 'time',
  setMode: () => {},
  quranMode: null,
  setQuranMode: () => {},
});

function savedMode(): ThemeMode {
  const saved = readJSON('theme', 'time');
  return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'time';
}

function savedQuranMode(): Shade | null {
  const saved = readJSON('mushafTheme', null);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const phone = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(savedMode);
  const [quranMode, setQuranModeState] = useState<Shade | null>(savedQuranMode);
  const [byTime, setByTime] = useState(nightByPrayer);
  const setMode = useCallback((next: ThemeMode) => {
    if (next === 'time') setByTime(nightByPrayer());
    writeJSON('theme', next);
    writeJSON('mushafTheme', null); // the Quran follows the app's new mode
    setModeState(next);
    setQuranModeState(null);
  }, []);
  const setQuranMode = useCallback((next: Shade) => {
    writeJSON('mushafTheme', next);
    setQuranModeState(next);
  }, []);
  // by prayer time: looked at again every minute (Maghrib and Fajr come while the app is open)
  useEffect(() => {
    if (mode !== 'time') return;
    const timer = setInterval(() => setByTime(nightByPrayer()), 60000);
    return () => clearInterval(timer);
  }, [mode]);
  const isDark = mode === 'dark' || (mode === 'auto' && phone === 'dark') || (mode === 'time' && byTime);
  const value = useMemo(
    () => ({ c: isDark ? dark : light, isDark, mode, setMode, quranMode, setQuranMode }),
    [isDark, mode, setMode, quranMode, setQuranMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// The Quran's screens: their own mode, else the app's
export function QuranTheme({ children }: { children: ReactNode }) {
  const app = useContext(ThemeContext);
  const isDark = app.quranMode ? app.quranMode === 'dark' : app.isDark;
  const value = useMemo(() => ({ ...app, c: isDark ? dark : light, isDark }), [app, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// The Hifdh page: light, clean and neutral, with forest green as its only colour. A near-white screen, white cards with a
// hairline border, quiet grey-green second lines (the gold and beige of the rest of the app are not used here).
export function HifTheme({ children }: { children: ReactNode }) {
  const app = useContext(ThemeContext);
  const value = useMemo(
    () => ({
      ...app,
      c: app.isDark
        ? {
            ...app.c,
            screen: '#1b201e',
            screenEnd: '#171b19',
            stars: '#6fb597',
            card: 'rgba(255, 255, 255, 0.06)',
            meta: '#9fb2a8',
            soft: 'rgba(255, 255, 255, 0.08)',
            line: 'rgba(255, 255, 255, 0.10)',
            gold: '#6fb597',
            goldStrong: '#8fd0b2',
            chosenLine: 'rgba(143, 208, 178, 0.45)',
          }
        : {
            ...app.c,
            screen: '#fbfcfa',
            screenEnd: '#f4f6f3',
            stars: '#9bb8aa',
            card: '#ffffff',
            meta: '#6b7a70',
            soft: 'rgba(23, 63, 50, 0.06)',
            line: 'rgba(23, 63, 50, 0.10)',
            divider: 'rgba(23, 63, 50, 0.08)',
            gold: '#5c8f78',
            goldStrong: '#2f6650',
            chosenLine: 'rgba(47, 102, 80, 0.4)',
          },
    }),
    [app],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
