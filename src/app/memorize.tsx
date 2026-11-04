// «memorization» - to be built (plans, revision and badges). Opening it counts today in the streak
// (the flame on the home screen), as the Quran and the wird do.
import { useEffect } from 'react';

import { Coming } from '@/components/Coming';
import { HOME } from '@/i18n/home';
import { markToday } from '@/lib/activity';

export default function Memorize() {
  useEffect(() => markToday('quran'), []);
  return <Coming title={HOME.memorize()} />;
}
