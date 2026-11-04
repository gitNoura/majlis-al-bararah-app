// A comment on an ayah (the website's notes.js), as a small note card: plain warm paper (the dark grey
// at night) with a strip of see-through tape in the note's colour across its top; the ayah's name and
// its words quoted on one line ﴿ … ﴾; the writing on faint neutral lines; at the foot the note's
// colours, «delete» (when there is a comment) and «save» in the note's colour. The colour is only an
// accent - the tape, the brackets, the chosen dot, the button - never the paper. It sits in the middle
// of what the screen shows, above the keyboard while writing.
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Pattern, Polygon, Rect } from 'react-native-svg';

import { CheckIcon, CloseIcon, TrashIcon } from '@/components/icons';
import { Txt } from '@/components/Txt';
import { isEnglish, surahTitle, t } from '@/i18n/i18n';
import { READER } from '@/i18n/reader';
import { ayahWords, deleteNote, NOTE_COLORS, noteColor, noteOf, noteText, saveNote } from '@/lib/marks';
import { SURAHS } from '@/lib/quran';
import { forDisplay } from '@/lib/search';
import { serif, ui } from '@/theme/fonts';
import { textSide } from '@/theme/ltr';
import { useTheme } from '@/theme/theme';

const LINE = 28; // the lines' spacing
const MIN_LINES = 3;
const MAX_LINES = 6;

const alpha = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

export type NoteFor = { s: number; a: number };

export function NoteSheet({ note, onClose }: { note: NoteFor | null; onClose: () => void }) {
  return note ? <Note key={`${note.s}:${note.a}`} s={note.s} a={note.a} onClose={onClose} /> : null;
}

function Note({ s, a, onClose }: { s: number; a: number; onClose: () => void }) {
  const { c, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const key = `${s}:${a}`;
  const saved = noteOf(key);
  const [text, setText] = useState(() => (saved ? noteText(saved.html) : ''));
  const [color, setColor] = useState(saved?.color ?? 'yellow');
  const [words, setWords] = useState('');
  const [textH, setTextH] = useState(LINE * MIN_LINES);
  const col = noteColor(color);

  useEffect(() => {
    ayahWords(s, a)
      .then((w) => setWords(forDisplay(w)))
      .catch(() => {});
  }, [s, a]);

  const arabic = !isEnglish || /^[\s]*[؀-ۿ]/.test(text);
  const lines = Math.max(MIN_LINES, Math.ceil(textH / LINE));
  const rule = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(68, 55, 43, 0.1)';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.dim, { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(25,24,19,0.14)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={READER.close()} />
        <View
          style={[
            styles.card,
            {
              width: Math.min(340, width - 48),
              backgroundColor: isDark ? '#2b2e2c' : '#fffdf8',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(68,55,43,0.08)',
              boxShadow: isDark ? '0px 16px 36px rgba(0,0,0,0.45)' : '0px 2px 6px rgba(60,45,20,0.06), 0px 16px 36px rgba(60,45,20,0.16)',
            },
          ]}
        >
          <Tape color={col.dot} />

          {/* the ayah's name, and ✕ */}
          <View style={styles.head}>
            <Txt size={16} weight={700} serif color={c.ink} style={{ flex: 1 }} numberOfLines={1}>
              {t('ayahTitle', surahTitle(SURAHS[s - 1]).replace(/^سورة /, ''), a)}
            </Txt>
            <Pressable onPress={onClose} hitSlop={10} style={[styles.close, { backgroundColor: c.soft }]} accessibilityLabel={READER.close()}>
              <CloseIcon color={c.meta} size={14} />
            </Pressable>
          </View>

          {/* its words, on one line, between the mushaf's brackets */}
          {!!words && (
            <Txt size={15} serif color={c.meta} numberOfLines={1} style={[styles.ayah, { textAlign: textSide('right') }]}>
              <Txt size={15} serif color={col.dot}>
                {'﴿ '}
              </Txt>
              {words}
            </Txt>
          )}

          {/* the writing, on faint lines */}
          <ScrollView style={{ maxHeight: LINE * MAX_LINES }} keyboardShouldPersistTaps="handled">
            <View>
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {Array.from({ length: lines }, (_, i) => (
                  <View key={i} style={[styles.rule, { top: (i + 1) * LINE - 1, backgroundColor: rule }]} />
                ))}
              </View>
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                scrollEnabled={false}
                autoFocus={!saved}
                placeholder={READER.notePlaceholder()}
                placeholderTextColor={c.meta}
                selectionColor={col.dot}
                cursorColor={col.dot}
                onContentSizeChange={(e) => setTextH(e.nativeEvent.contentSize.height)}
                style={[
                  styles.text,
                  { color: c.ink, fontFamily: arabic ? serif(400) : ui(400), textAlign: arabic ? 'right' : 'left', minHeight: LINE * MIN_LINES },
                ]}
              />
            </View>
          </ScrollView>

          {/* the colours; delete and save */}
          <View style={styles.foot}>
            <View style={styles.colors}>
              {NOTE_COLORS.map((n) => {
                const on = n.id === color;
                return (
                  <Pressable
                    key={n.id}
                    onPress={() => setColor(n.id)}
                    hitSlop={5}
                    accessibilityLabel={t('noteColor')}
                    style={[
                      styles.swatch,
                      { backgroundColor: n.dot },
                      on && { boxShadow: `0px 0px 0px 2px ${isDark ? '#2b2e2c' : '#fffdf8'}, 0px 0px 0px 3.5px ${n.dot}` },
                    ]}
                  >
                    {on && <CheckIcon color={n.on} size={11} strokeWidth={3.5} />}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.actions}>
              {saved && (
                <Pressable
                  onPress={() => {
                    deleteNote(key);
                    onClose();
                  }}
                  hitSlop={6}
                  style={({ pressed }) => [styles.delete, pressed && { backgroundColor: 'rgba(229,122,140,0.12)' }]}
                  accessibilityLabel={READER.noteDelete()}
                >
                  <TrashIcon color="#e57a8c" size={18} />
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  saveNote(key, text, color);
                  onClose();
                }}
                style={({ pressed }) => [styles.save, { backgroundColor: col.dot, boxShadow: `0px 4px 10px ${alpha(col.dot, 0.32)}` }, pressed && { opacity: 0.85 }]}
              >
                <Txt size={14.5} weight={700} color={col.on}>
                  {READER.noteSave()}
                </Txt>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// the strip of tape across the note's top: see-through in the note's colour, faintly striped, its
// ends torn (the website's clip-path)
function Tape({ color }: { color: string }) {
  const torn = '2.2,0 69.8,0 72,4.5 69.8,9 72,13.5 69.8,18 2.2,18 0,13.5 2.2,9 0,4.5';
  return (
    <View style={styles.tape} pointerEvents="none">
      <Svg width={72} height={18}>
        <Defs>
          <Pattern id="tape-stripes" patternUnits="userSpaceOnUse" width={8} height={8} patternTransform="rotate(-45)">
            <Rect width={4} height={8} fill="rgba(255,255,255,0.24)" />
          </Pattern>
        </Defs>
        <Polygon points={torn} fill={alpha(color, 0.7)} />
        <Polygon points={torn} fill="url(#tape-stripes)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { paddingTop: 18, paddingHorizontal: 16, paddingBottom: 12, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  tape: { position: 'absolute', top: -8, left: '50%', marginLeft: -36, transform: [{ rotate: '-3deg' }] },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  close: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ayah: { marginTop: 2, marginBottom: 6, writingDirection: 'rtl' },
  rule: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  text: { fontSize: 17, lineHeight: LINE, paddingHorizontal: 2, paddingVertical: 0, textAlignVertical: 'top' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  colors: { flexDirection: 'row', gap: 8 },
  swatch: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  delete: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  save: { height: 34, paddingHorizontal: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
