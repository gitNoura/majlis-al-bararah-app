// Day or night: the reader's choice ('light', 'dark', or 'auto' to follow the phone), saved as on the
// website ('theme'). useTheme() gives the colours of the moment (src/theme/tokens.ts).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { readJSON, writeJSON } from '@/lib/storage';
import { dark, light, type Palette } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'auto';

type Theme = { c: Palette; isDark: boolean; mode: ThemeMode; setMode: (mode: ThemeMode) => void };

const ThemeContext = createContext<Theme>({ c: light, isDark: false, mode: 'auto', setMode: () => {} });

function savedMode(): ThemeMode {
  const saved = readJSON('theme', 'auto');
  return saved === 'light' || saved === 'dark' ? saved : 'auto';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const phone = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(savedMode);
  const setMode = useCallback((next: ThemeMode) => {
    writeJSON('theme', next);
    setModeState(next);
  }, []);
  const isDark = mode === 'dark' || (mode === 'auto' && phone === 'dark');
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark, mode, setMode }), [isDark, mode, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
