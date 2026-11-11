// The «similar ayat» tab of the ayah sheet (the website's mutashabihat panel): the ayat that repeat the chosen one in other
// surahs, then the similar ones in the same surah and in other surahs, each with where the two agree (start / end /
// middle) and the words that differ marked. A tap on one goes to it.
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { surahName, t } from '@/i18n/i18n';
import { pageOf } from '@/lib/boxes';
import { loadTexts, parseKey, similarOf, wordsOf } from '@/lib/mutashabihat';
import { SURAHS } from '@/lib/quran';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

type Item = { k: string; at: string; d: number[] };

export function SimilarList({ s, a, onGo }: { s: number; a: number; onGo: (s: number, a: number) => void }) {
  const { c } = useTheme();
  const [ready, setReady] = useState<'wait' | 'yes' | 'failed'>('wait');
  const entry = similarOf(s, a);

  useEffect(() => {
    let stale = false;
    loadTexts()
      .then(() => !stale && setReady('yes'))
      .catch(() => !stale && setReady('failed'));
    return () => {
      stale = true;
    };
  }, []);

  if (!entry) {
    return (
      <Txt size={16} center color={c.meta}>
        {t('noSimilar')}
      </Txt>
    );
  }
  if (ready === 'wait') return <ActivityIndicator color={c.gold} style={{ marginTop: 24 }} />;
  if (ready === 'failed') {
    return (
      <Txt size={16} center color={c.meta}>
        {t('loadFailed')}
      </Txt>
    );
  }

  const place = (k: string) => {
    const p = parseKey(k);
    const page = pageOf(p.s, p.a);
    return { ...p, name: surahName(SURAHS[p.s - 1]), page };
  };
  const ayahText = (k: string, d: number[] = [], big = false) => (
    <Txt size={big ? 21 : 19} lineHeight={big ? 38 : 34} serif color={c.text} style={{ textAlign: textSide('right'), writingDirection: 'rtl' }}>
      {wordsOf(k, d).map((w, i) => (
        <Txt key={i} serif size={big ? 21 : 19} lineHeight={big ? 38 : 34} color={w.mark ? c.onInk : c.text} style={w.mark ? { backgroundColor: c.on } : undefined}>
          {w.text}
          {' '}
        </Txt>
      ))}
    </Txt>
  );

  const group = (title: string, count: number | null, body: ReactNode) => (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Txt size={15} weight={700} color={c.ink}>
          {title}
        </Txt>
        {count !== null && (
          <View style={{ backgroundColor: c.soft, borderRadius: 10, paddingHorizontal: 8 }}>
            <Txt size={12.5} weight={700} color={c.meta}>
              {count}
            </Txt>
          </View>
        )}
      </View>
      {body}
    </View>
  );

  const items = (list: Item[]) => (
    <View style={{ gap: 10 }}>
      {list.map((item) => {
        const p = place(item.k);
        return (
          <Pressable
            key={item.k}
            onPress={() => onGo(p.s, p.a)}
            style={({ pressed }) => ({ gap: 6, padding: 12, borderRadius: 16, backgroundColor: c.soft, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 2 }}>
              <Txt size={14.5} weight={700} color={c.ink}>
                {p.name}
              </Txt>
              <Txt size={13} color={c.meta}>
                {t('ayahN', p.a)}
              </Txt>
              <Txt size={12} weight={700} color={c.accent}>
                {t(`agree_${item.at}`)}
              </Txt>
              {!!p.page && (
                <Txt size={12.5} color={c.meta} style={{ marginStart: 'auto' }}>
                  {t('pageShort', p.page)}
                </Txt>
              )}
            </View>
            {ayahText(item.k, item.d)}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={{ gap: 22 }}>
      {!!entry.inSurah && (
        <Txt size={14} color={c.meta}>
          {t('inSurah', entry.inSurah)}
        </Txt>
      )}
      {!!entry.repeats &&
        group(
          t('simRepeats'),
          null,
          <View style={{ gap: 10 }}>
            {ayahText(`${s}:${a}`, [], true)}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {entry.repeats.map((k) => {
                const p = place(k);
                return (
                  <Pressable key={k} onPress={() => onGo(p.s, p.a)} style={({ pressed }) => ({ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.soft, opacity: pressed ? 0.7 : 1 })}>
                    <Txt size={13.5} color={c.ink}>
                      <Txt size={13.5} weight={700} color={c.ink}>
                        {p.name}
                      </Txt>{' '}
                      {t('ayahN', p.a)}
                      {p.page ? ` · ${t('pageShort', p.page)}` : ''}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          </View>,
        )}
      {!!entry.same?.length && group(t('simSame'), entry.same.length, items(entry.same))}
      {!!entry.other?.length && group(t('simOther'), entry.other.length, items(entry.other))}
      <Txt size={12.5} color={c.meta}>
        {t('simSource')}
      </Txt>
    </View>
  );
}
