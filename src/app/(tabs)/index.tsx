// HOME tab: the dashboard, an overview of where the reader is, not a launcher and not a to-do list. Top to bottom:
//   1 the next prayer (a glass box on the sky of the moment: its time, the time left, qibla and calendar)
//   greeting and the date, with the profile icon at the far end
//   the hadith of the reader, centred
//   2 reading, 3 memorization, 4 revision (three glass cards: today's portion and how far each is; the tasks are in Hifdh)
//   5 activity (this week), the last, also glass
//   (the adhkar and ahadith libraries are the Library tab)
// The look is Home's own (src/theme/homeSkin.ts, homeType.ts): a soft mint wash for a page, with everything on it in glass
// (components/home/Glass.tsx), one deep forest for words and one fresher green for progress. The prayer card is the only thing that
// changes with the day (its sky). The one moment of motion is the marks drawing themselves in (Grow). Each section reads the saved
// state when it draws, so Home redraws every time it comes into view. It also keeps one behaviour of the old home screen: after a
// change of narration the app opens again, and must land on the Quran tab at the same place, not on Home.
'use no memo'; // the sections read saved state (modules), which the React Compiler cannot see change
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/home/ActivityCard';
import { Glass } from '@/components/home/Glass';
import { HadithNote } from '@/components/home/HadithNote';
import { MemorizationCard } from '@/components/home/MemorizationCard';
import { PrayerCard } from '@/components/home/PrayerCard';
import { ReadingCard } from '@/components/home/ReadingCard';
import { PersonIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { LANG } from '@/i18n/i18n';
import { dateLine } from '@/lib/dashboard';
import { stayInQuran } from '@/lib/riwaya';
import { writeJSON } from '@/lib/storage';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
import { lineStart, ltr } from '@/theme/ltr';
import { space } from '@/theme/tokens';

export default function HomeTab() {
  const k = useSkin();
  const insets = useSafeAreaInsets();
  const [, setRev] = useState(0); // bumped on focus: redraws the sections

  useEffect(() => {
    const stay = stayInQuran();
    if (stay) {
      if (typeof stay === 'number') writeJSON('lastPage', stay);
      router.navigate('/quran');
    }
  }, []);

  // back on Home (from the Quran page, Hifdh, a library): everything as it is now
  useFocusEffect(
    useCallback(() => {
      setRev((n) => n + 1);
    }, []),
  );

  // the date and the greeting start the language's line (right in Arabic); the profile icon is at the other end
  const words = (
    <View key="words" style={styles.words}>
      <Txt {...T.date} color={k.meta} style={lineStart()}>
        {dateLine()}
      </Txt>
      <Txt {...T.greeting} color={k.pageInk} style={lineStart()}>
        {HOME.salam()}
      </Txt>
    </View>
  );
  const profile = (
    <Pressable key="profile" onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={HOME.profile()} hitSlop={8}>
      <Glass radius={22} style={styles.profile}>
        <PersonIcon color={k.pageInk} size={22} />
      </Glass>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <LinearGradient colors={k.wash} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.md, paddingTop: insets.top + space.md, paddingBottom: space.lg, gap: space.md }}>
        <PrayerCard />
        <View style={[styles.head, ltr()]}>{LANG === 'ar' ? [profile, words] : [words, profile]}</View>
        <HadithNote />
        <ReadingCard />
        <MemorizationCard />
        <ActivityCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  words: { flex: 1 },
  profile: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
