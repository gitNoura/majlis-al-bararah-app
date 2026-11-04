// «test your memorization» - to be built (recitation and correction: the revision). Opening it counts
// today in the streak (the flame on the home screen), as the Quran and the wird do.
import { useEffect } from 'react';

import { Coming } from '@/components/Coming';
import { HOME } from '@/i18n/home';
import { markToday } from '@/lib/activity';

export default function TestMemorization() {
  useEffect(() => markToday('quran'), []);
  return <Coming title={HOME.test()} />;
}
