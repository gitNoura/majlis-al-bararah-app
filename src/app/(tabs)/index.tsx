// HOME tab: the dashboard, an overview of where the reader is, not a launcher and not a to-do list. Top to bottom:
//   1 the next prayer      2 reading (the khatma, the marker)      3 memorization (numbers; the tasks are in Hifdh)
//   4 activity (streak and four weeks)      5 additional resources (the adhkar and ahadith libraries)
// Only the Reading card has a filled button. Each card reads the saved state when it draws, so Home redraws every time it
// comes into view. It also keeps one behaviour of the old home screen: after a change of narration the app opens
// again, and must land on the Quran tab at the same place, not on Home.
'use no memo'; // the cards read saved state (modules), which the React Compiler cannot see change
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/home/ActivityCard';
import { MemorizationCard } from '@/components/home/MemorizationCard';
import { PrayerCard } from '@/components/home/PrayerCard';
import { ReadingCard } from '@/components/home/ReadingCard';
import { Resources } from '@/components/home/Resources';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { dateLine } from '@/lib/dashboard';
import { stayInQuran } from '@/lib/riwaya';
import { writeJSON } from '@/lib/storage';
import { useTheme } from '@/theme/theme';
import { space } from '@/theme/tokens';

export default function HomeTab() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [, setRev] = useState(0); // bumped on focus: redraws the cards

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
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.lg, paddingBottom: space.lg, gap: space.md }}>
        <View style={{ gap: 2 }}>
          <Txt size={30} weight={800} lineHeight={40} color={c.ink}>
            {HOME.salam()}
          </Txt>
          <Txt size={14} color={c.meta}>
            {dateLine()}
          </Txt>
        </View>
        <PrayerCard />
        <ReadingCard />
        <MemorizationCard />
        <ActivityCard />
        <Resources />
      </ScrollView>
    </View>
  );
}
