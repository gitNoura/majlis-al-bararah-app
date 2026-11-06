// The khatma sheet (a tap on the header's bar): how much of the Quran lies behind the marker, the khatmas completed,
// and the exact pin if there is one (go to it, or remove it).
import { Card, ProgressStrip, Row, Sheet } from '@/components/ui';
import { Txt } from '@/components/Txt';
import { QURAN } from '@/i18n/quran';
import { khatmaShare } from '@/lib/position';
import { TOTAL_PAGES } from '@/lib/quran';
import { khatmasDone } from '@/lib/wird';
import { useTheme } from '@/theme/theme';

export type Pin = { page: number; shown: string };

type Props = { open: boolean; onClose: () => void; page: number; pin: Pin | null; onGoPin: () => void; onClearPin: () => void };

export function KhatmaSheet({ open, onClose, page, pin, onGoPin, onClearPin }: Props) {
  const { c } = useTheme();
  const share = khatmaShare(page);
  return (
    <Sheet open={open} onClose={onClose} title={QURAN.khatma()}>
      <Card>
        <Txt size={26} weight={800} color={c.ink}>
          {QURAN.khatmaProgress(Math.round(share * 100))}
        </Txt>
        <ProgressStrip value={share} height={8} label={QURAN.khatma()} />
        <Txt size={14} color={c.meta}>
          {QURAN.khatmaPage(page, TOTAL_PAGES)}
        </Txt>
        <Txt size={14} color={c.meta}>
          {QURAN.khatmasDone(khatmasDone())}
        </Txt>
      </Card>
      <Card style={{ paddingVertical: 4 }}>
        {pin ? (
          <>
            <Row title={QURAN.pinLine(pin.shown, pin.page)} />
            <Row title={QURAN.goToPin()} chevron onPress={onGoPin} />
            <Row title={QURAN.clearPin()} quiet onPress={onClearPin} last />
          </>
        ) : (
          <Row title={QURAN.noPin()} quiet last />
        )}
      </Card>
    </Sheet>
  );
}
