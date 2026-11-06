// HOME tab (stub until phase e: the dashboard). It also keeps one behaviour of the old home screen: after a change
// of narration the app opens again, and must land on the Quran tab at the same place, not on the home screen.
import { router } from 'expo-router';
import { useEffect } from 'react';

import { TabStub } from '@/components/TabStub';
import { HOME } from '@/i18n/home';
import { NAV } from '@/i18n/nav';
import { stayInQuran } from '@/lib/riwaya';
import { writeJSON } from '@/lib/storage';

export default function HomeTab() {
  useEffect(() => {
    const stay = stayInQuran();
    if (stay) {
      if (typeof stay === 'number') writeJSON('lastPage', stay);
      router.navigate('/quran');
    }
  }, []);
  return (
    <TabStub
      title={HOME.tabHome()}
      links={[
        { title: NAV.previous(), sub: NAV.previousSub(), href: '/home-old' },
        { title: HOME.adhkar(), href: '/adhkar' },
        { title: HOME.ahadith(), href: '/ahadith' },
        { title: HOME.qibla(), href: '/qibla' },
      ]}
    />
  );
}
