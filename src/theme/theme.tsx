// Day or night: the reader's choice - 'light', 'dark' or 'auto' (follow the phone) - saved as on the website
// ('theme'; auto when nothing was chosen, and for the old 'time' choice, which no longer exists).
// useTheme() gives the colours of the moment (src/theme/tokens.ts).
//
// The Quran's screens have their own night mode, as on the website: its switch (the Quran's display options,
// full screen's button) sets the Quran's screens only ('mushafTheme'); choosing the app's mode makes the
// Quran follow it again. The Quran's screens are wrapped in <QuranTheme>, inside which useTheme() gives the
// Quran's colours.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { readJSON, writeJSON } from '@/lib/storage';
import { dark, light, type Palette } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'auto';
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
  mode: 'auto',
  setMode: () => {},
  quranMode: null,
  setQuranMode: () => {},
});

function savedMode(): ThemeMode {
  const saved = readJSON('theme', 'auto');
  return saved === 'light' || saved === 'dark' ? saved : 'auto';
}

function savedQuranMode(): Shade | null {
  const saved = readJSON('mushafTheme', null);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const phone = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(savedMode);
  const [quranMode, setQuranModeState] = useState<Shade | null>(savedQuranMode);
  const setMode = useCallback((next: ThemeMode) => {
    writeJSON('theme', next);
    writeJSON('mushafTheme', null); // the Quran follows the app's new mode
    setModeState(next);
    setQuranModeState(null);
  }, []);
  const setQuranMode = useCallback((next: Shade) => {
    writeJSON('mushafTheme', next);
    setQuranModeState(next);
  }, []);
  const isDark = mode === 'dark' || (mode === 'auto' && phone === 'dark');
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

// Kept only so the screens not yet rebuilt still compile: the base theme IS the Hifdh page's look now, so this
// changes nothing. Removed with those screens (phases d and e).
export function HifTheme({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useTheme = () => useContext(ThemeContext);
