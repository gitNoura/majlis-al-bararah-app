// «Congratulations»: what the plan page shows once every portion of today is done, instead of offering
// tomorrow's task (it replaces the old «Ahead of schedule» card). Nothing is drawn while something of today
// is still to do, or when nothing is planned for today.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { CheckIcon } from '@/components/icons';
import { useHif } from '@/components/hifdh/HifProvider';
import { Hint, Section } from '@/components/hifdh/Section';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import { isDone } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useTheme } from '@/theme/theme';

export function CongratsCard() {
  const { c } = useTheme();
  useHif(); // redraws this card whenever `rev` changes

  const rows = plan.todayRows();
  if (!rows.length || !rows.every(isDone)) return null;

  return (
    <Section title={HIF.congratsTitle()} tone="green" icon={<CheckIcon color={c.ink} size={22} strokeWidth={2.2} />}>
      <Txt size={15} weight={700} color={c.ink}>
        {HIF.allDone()}
      </Txt>
      <Hint>{HIF.congratsBody()}</Hint>
    </Section>
  );
}
