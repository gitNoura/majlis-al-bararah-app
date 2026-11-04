// The root of the app: the fonts, day or night, the direction of the language (right to left in Arabic,
// left to right in English and French), and the screens as a stack (each opens over the home screen,
// the phone's back gesture closes it).
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LANG, onLanguageChange } from '@/i18n/i18n';
import { startAccount } from '@/lib/account';
import { FONT_FILES } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();
// who is signed in (Supabase), asked once as the app starts
startAccount();

function Screens() {
  const { c, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.screen } }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONT_FILES);
  // a change of language draws every screen again from the start (the key), in the new language and
  // its direction, so no screen keeps the other language's words or layout
  const [lang, setLang] = useState(LANG);
  useEffect(() => {
    const stop = onLanguageChange(setLang);
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  // (in the browser preview the page's own direction does it: «direction» is the phones')
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {/* the direction from `lang` (this component's state), not from isEnglish: the React Compiler
            keeps a value read from an import as it was at the first drawing, so it would never change */}
        <View key={lang} style={[{ flex: 1 }, Platform.OS !== 'web' && { direction: lang === 'ar' ? 'rtl' : 'ltr' }]}>
          <Screens />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
