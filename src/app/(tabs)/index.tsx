// HOME tab: the dashboard, an overview of where the reader is, not a launcher and not a to-do list. Top to bottom:
//   greeting and the date
//   1 the next prayer (on the sky of the moment, with the day's five times, the qibla and the calendar)   2 reading (a small mushaf page: the khatma as thirty juz marks)
//   3 memorization and revision (how far each plan is through its whole run; the tasks are in Hifdh)
//   4 activity (this week)                       5 the hadith of the reader, as a quiet closing note
//   (the adhkar and ahadith libraries are the Library tab)
// The look is Home's own (src/theme/homeSkin.ts, homeType.ts): a quiet neutral page at the app's everyday sizes (12 to 26),
// one deep forest, and a single fresher green that only ever marks "where you are now". The prayer card wears the sky and the
// Reading block is a small off-white mushaf page; Memorization is one white panel; Activity and the hadith sit on
// the page itself. The one moment of motion is the marks drawing themselves in
// (Grow). Each section reads the saved state when it draws, so Home redraws every time it comes into view. It also keeps
// one behaviour of the old home screen: after a change of narration the app opens again, and must land on the Quran tab
// at the same place, not on Home.
'use no memo'; // the sections read saved state (modules), which the React Compiler cannot see change
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/home/ActivityCard';
import { HadithNote } from '@/components/home/HadithNote';
import { MemorizationCard } from '@/components/home/MemorizationCard';
import { PrayerCard } from '@/components/home/PrayerCard';
import { ReadingCard } from '@/components/home/ReadingCard';
import { Avatar } from '@/components/Avatar';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { dateLine } from '@/lib/dashboard';
import { stayInQuran } from '@/lib/riwaya';
import { writeJSON } from '@/lib/storage';
import { useSkin } from '@/theme/homeSkin';
import { T } from '@/theme/homeType';
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

  return (
    <View style={{ flex: 1, backgroundColor: k.paper }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.md, paddingTop: insets.top + space.sm, paddingBottom: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Txt {...T.date} color={k.meta}>
              {dateLine()}
            </Txt>
            <Txt {...T.greeting} color={k.ink}>
              {HOME.salam()}
            </Txt>
          </View>
          <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={HOME.profile()} hitSlop={8}>
            <Avatar size={40} />
          </Pressable>
        </View>
        <PrayerCard />
        <ReadingCard />
        <MemorizationCard />
        <ActivityCard />
        <HadithNote />
      </ScrollView>
    </View>
  );
}
