// HOME tab: the dashboard, an overview of where the reader is, not a launcher and not a to-do list. Top to bottom:
//   1 the next prayer      2 reading (the hero: the khatma, the marker)
//   3 memorization and revision (how far each plan is through its whole run; the tasks are in Hifdh)      4 activity (this week against last week)
//   (the adhkar and ahadith libraries are the Library tab)
// The look is Home's own (src/theme/home.ts: the app's own page and greens, the prayer card's forest and cream); the prayer
// card keeps wearing the sky. Only the Reading card has a filled button. Each card reads the saved state when it draws, so Home redraws every time it
// comes into view. It also keeps one behaviour of the old home screen: after a change of narration the app opens
// again, and must land on the Quran tab at the same place, not on Home.
'use no memo'; // the cards read saved state (modules), which the React Compiler cannot see change
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/home/ActivityCard';
import { MemorizationCard } from '@/components/home/MemorizationCard';
import { PrayerCard } from '@/components/home/PrayerCard';
import { ReadingCard } from '@/components/home/ReadingCard';
import { Avatar } from '@/components/Avatar';
import { Txt } from '@/components/Txt';
import { HOME } from '@/i18n/home';
import { dateLine } from '@/lib/dashboard';
import { stayInQuran } from '@/lib/riwaya';
import { writeJSON } from '@/lib/storage';
import { useHome } from '@/theme/home';
import { space } from '@/theme/tokens';

export default function HomeTab() {
  const h = useHome();
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
    <View style={{ flex: 1, backgroundColor: h.screen }}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.md, paddingBottom: space.lg, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2, flex: 1 }}>
            <Txt size={28} weight={800} lineHeight={36} color={h.ink}>
              {HOME.salam()}
            </Txt>
            <Txt size={14} color={h.meta}>
              {dateLine()}
            </Txt>
          </View>
          <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={HOME.profile()} hitSlop={8}>
            <Avatar size={44} />
          </Pressable>
        </View>
        <PrayerCard />
        <ReadingCard />
        <MemorizationCard />
        <ActivityCard />
      </ScrollView>
    </View>
  );
}
