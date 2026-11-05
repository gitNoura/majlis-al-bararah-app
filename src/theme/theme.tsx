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

// The Hifdh page: the app's palette with the home page's own tile colour (#f5efe5, a soft tint at night), its warmer
// second-line brown, and soft tints for round icons and tracks, so the page reads as the home page's sibling.
export function HifTheme({ children }: { children: ReactNode }) {
  const app = useContext(ThemeContext);
  const value = useMemo(
    () => ({
      ...app,
      c: app.isDark
        ? { ...app.c, card: 'rgba(255, 255, 255, 0.05)', meta: '#b9a87f', soft: 'rgba(255, 255, 255, 0.08)' }
        : { ...app.c, card: '#f5efe5', meta: '#8f7f5d', soft: 'rgba(23, 63, 50, 0.08)' },
    }),
    [app],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
