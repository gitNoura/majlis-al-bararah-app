// HOME, reading: «Reading», the surah's name, and the page, hizb and juz as plain words, with the khatma's percentage and bar under
// them (PlanCard). A tap anywhere on it opens the Quran at the marker.
'use no memo'; // reads saved state (the marker) when it draws, which the React Compiler cannot see change
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { PlanCard } from '@/components/home/PlanCard';
import { placeOf } from '@/components/quran/QuranHeader';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { isEnglish, isFrench } from '@/i18n/i18n';
import { surahsOn } from '@/lib/boxes';
import { readingView } from '@/lib/dashboard';
import { SURAHS } from '@/lib/quran';

const digits = (n: number) => n.toLocaleString('en');

// the surah(s) on the page, with «Surah» before the name, in the reader's language
function surahLine(page: number): string {
  const on: number[] = surahsOn(page).length ? surahsOn(page) : [1];
  const names = on.map((n) => (isEnglish || isFrench ? SURAHS[n - 1].latin : SURAHS[n - 1].name));
  return HOME.surah(names.length > 2 ? `${names[0]} – ${names[names.length - 1]}` : names.join(' – '));
}

export function ReadingCard() {
  const r = readingView();
  const where = placeOf(r.page);
  // the page, then the hizb and juz
  const sub = !r.started ? DASH.beginKhatma() : [HOME.wirdPage(digits(r.page)), where.extra].filter(Boolean).join(' · ');
  const action = r.started ? DASH.continueReading() : DASH.startReading();

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    router.navigate({ pathname: '/quran', params: r.started ? { resume: String(r.page), n: String(Date.now()) } : undefined });
  };

  return <PlanCard label={DASH.reading()} title={surahLine(r.page)} sub={sub} percent={r.percent} onPress={open} a11y={`${DASH.reading()} ${action}`} />;
}
