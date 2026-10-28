// The root of the app: the fonts, day or night, the direction of the language (right to left in Arabic,
// left to right in English and French), and the screens as a stack (each opens over the home screen,
// the phone's back gesture closes it).
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { isEnglish, onLanguageChange } from '@/i18n/i18n';
import { FONT_FILES } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();

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
  // a change of language draws the whole app again, in the new direction (src/i18n/i18n.js)
  const [lang, setLang] = useState('');
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
    if (Platform.OS === 'web') document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';
  }, [lang]);
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <View key={lang} style={[{ flex: 1 }, Platform.OS !== 'web' && { direction: isEnglish ? 'ltr' : 'rtl' }]}>
        <Screens />
      </View>
    </ThemeProvider>
  );
}
