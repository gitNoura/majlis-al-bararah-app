// HOME, card 2: reading. The khatma as a ring, where the reader is (surah, page, juz), the pages read today, a strip of
// the 30 juz (full up to the page being read), and the one filled button of the screen: it opens the Quran tab at the marker.
'use no memo'; // reads saved state (the marker, the wird) when it draws, which the React Compiler cannot see change
import { router } from 'expo-router';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/hifdh/Section';
import { placeOf } from '@/components/quran/QuranHeader';
import { Txt } from '@/components/Txt';
import { Card, ProgressStrip, Ring } from '@/components/ui';
import { DASH } from '@/i18n/dashboard';
import { HOME } from '@/i18n/home';
import { L } from '@/i18n/i18n';
import { readingView } from '@/lib/dashboard';
import { useTheme } from '@/theme/theme';

const digits = (n: number) => n.toLocaleString(L('ar', 'en', 'fr'));

export function ReadingCard() {
  const { c } = useTheme();
  const r = readingView();
  const where = placeOf(r.page);
  const lines = [r.pagesToday ? DASH.pagesToday(digits(r.pagesToday)) : DASH.pagesNone()];
  return (
    <Card>
      <Txt size={13} weight={700} color={c.meta}>
        {DASH.reading()}
      </Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Ring value={r.percent / 100} a11y={`${r.percent}%`}>
          <Txt size={15} weight={800} color={c.ink}>
            {`${digits(r.percent)}%`}
          </Txt>
        </Ring>
        <View style={{ flex: 1, gap: 2 }}>
          {r.started ? (
            <>
              <Txt size={22} weight={800} lineHeight={30} color={c.ink} numberOfLines={1}>
                {where.surahs}
              </Txt>
              <Txt size={14} color={c.meta}>
                {`${HOME.wirdPage(digits(r.page))} · ${where.extra}`}
              </Txt>
              <Txt size={14} color={c.meta}>
                {lines.join(' · ')}
              </Txt>
            </>
          ) : (
            <Txt size={16} weight={600} color={c.ink}>
              {DASH.beginKhatma()}
            </Txt>
          )}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <ProgressStrip cells={r.cells} height={8} label={DASH.juzRead(String(r.juzFull))} />
        <Txt size={12} color={c.meta}>
          {[DASH.juzRead(digits(r.juzFull)), r.khatmas ? DASH.khatmas(digits(r.khatmas)) : ''].filter(Boolean).join(' · ')}
        </Txt>
      </View>
      <PrimaryButton label={r.started ? DASH.continueReading() : DASH.startReading()} onPress={() => router.navigate('/quran')} />
    </Card>
  );
}
