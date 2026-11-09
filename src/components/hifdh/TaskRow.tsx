// One planned portion (taskHTML of the website): its name and where it starts, a listen button and
// «Complete». A long press on «Complete» opens «where did you stop?». Used by the Today and Revision cards.
'use no memo'; // reads the plan's own state (a module), which the React Compiler cannot see change: it would keep the first drawing
import { useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

import { useHif } from '@/components/hifdh/HifProvider';
import type { Row } from '@/components/hifdh/StopSheet';
import { CheckIcon, MicIcon, PlayIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { HIF } from '@/i18n/hifdh';
import * as core from '@/lib/hifdh/core';
import { STATUS, dayText, findRow, isDone, portionLines, startsAt, weekLine } from '@/lib/hifdh/labels';
import * as plan from '@/lib/hifdh/plan';
import { useHome } from '@/theme/home';
import { useTheme } from '@/theme/theme';

export function TaskRow({ row, locked = false, ahead = false, first = false }: { row: Row; locked?: boolean; ahead?: boolean; first?: boolean }) {
  const { c } = useTheme();
  const h = useHome();
  const { refresh, toast, burst, openStop, listen, recite } = useHif();
  const btn = useRef<any>(null); // the Pressable's instance (measureInWindow), whose type RN does not export

  const weekly = row.week != null;
  const rule = [styles.task, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.divider }];

  if (weekly && !row.segs.length) {
    return (
      <View style={rule}>
        <View style={styles.main}>
          <Txt size={17} weight={700} color={c.ink}>
            {HIF.weekComplete()}
          </Txt>
          <Txt size={13} color={c.meta}>
            {weekLine(row)}
          </Txt>
        </View>
      </View>
    );
  }

  const key = `${row.plan.id}|${weekly ? row.week : row.day}`;
  const done = row.status === 'done' || row.status === 'partial';
  const sub = weekly ? weekLine(row) : row.plan.type === 'revise' && row.n ? HIF.dayOfN(row.k, row.n) : '';
  const when = ahead ? HIF.forDay(dayText(row.day)) : '';

  const undo = () => {
    plan.mark(findRow(key) ?? row, 'untouched');
    refresh();
  };

  // Checking: done, or done again (taking it back)
  const complete = () => {
    const r = findRow(key) ?? row;
    if (!weekly && (r.status === 'done' || r.status === 'partial')) {
      plan.mark(r, 'untouched');
      return refresh();
    }
    plan.mark(r, 'done', weekly ? { day: plan.today() } : {});
    refresh();
    const early = !weekly && r.day > plan.today();
    const rows = plan.todayRows();
    if (!early && rows.length && rows.every(isDone)) {
      const { width, height } = Dimensions.get('window');
      burst(width / 2, height * 0.4, { count: 170, spread: 1.4 }); // the whole day is done: confetti only; the page's heading turns into the congratulation (PlanSummary)
    } else {
      btn.current?.measureInWindow((x: number, y: number, w: number, h: number) => burst(x + w / 2, y + h / 2));
      if (early) toast(HIF.aheadDone());
    }
  };

  const lines = portionLines(row.segs, core.shownUnit(row.version));

  return (
    <View style={rule}>
      <View style={styles.main}>
        <Txt size={17} weight={700} color={c.ink}>
          {lines.title}
        </Txt>
        {!!lines.sub && (
          <Txt size={15} weight={600} color={c.text}>
            {lines.sub}
          </Txt>
        )}
        <Txt size={13} color={c.meta}>
          {startsAt(row.segs)}
        </Txt>
        {!!when && (
          <Txt size={13} color={c.meta}>
            {when}
          </Txt>
        )}
        {!!sub && (
          <Txt size={13} color={c.meta}>
            {sub}
          </Txt>
        )}
        {row.status === 'notdone' && (
          <Txt size={13} color={c.text}>
            {HIF.notDoneToast()}{' '}
            <Txt size={13} weight={700} color={c.goldStrong} onPress={undo} accessibilityRole="button">
              {HIF.undo()}
            </Txt>
          </Txt>
        )}
        {row.status === 'partial' && (
          <Txt size={13} color={c.text}>
            {HIF.partialToast()}
          </Txt>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => listen(findRow(key) ?? row)}
          accessibilityRole="button"
          accessibilityLabel={HIF.listenPortion()}
          style={[styles.icon, { backgroundColor: h.tile }]}
        >
          <PlayIcon color={h.tileInk} size={20} />
        </Pressable>
        <Pressable
          onPress={() => recite(findRow(key) ?? row)}
          accessibilityRole="button"
          accessibilityLabel={HIF.recitePortion()}
          style={[styles.icon, { backgroundColor: h.tile }]}
        >
          <MicIcon color={h.tileInk} size={20} />
        </Pressable>
        {row.status !== 'notdone' && (
          <Pressable
            ref={btn}
            onPress={complete}
            onLongPress={() => openStop(findRow(key) ?? row)}
            delayLongPress={550}
            disabled={locked}
            accessibilityRole="button"
            accessibilityState={{ selected: done, disabled: locked }}
            accessibilityHint={HIF.holdHint()}
            style={[
              styles.complete,
              done ? { backgroundColor: h.tile } : { backgroundColor: h.forest },
              locked && { opacity: 0.45 },
            ]}
          >
            {done && <CheckIcon color={h.tileInk} size={18} strokeWidth={2.4} />}
            <Txt size={16} weight={700} color={done ? h.tileInk : h.forestInk}>
              {done ? STATUS.done() : HIF.complete()}
            </Txt>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  task: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 12 },
  main: { flexGrow: 1, flexShrink: 1, flexBasis: 150, minWidth: 0, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  complete: { minWidth: 96, minHeight: 44, paddingHorizontal: 18, borderRadius: 22, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
});
