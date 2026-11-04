// The parts of the account screens: a text field on a white card, the main green button, the white
// «Continue with Google» button, and the «or» between them.
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { isEnglish, t } from '@/i18n/i18n';
import { ui } from '@/theme/fonts';
import { useTheme } from '@/theme/theme';

export function Field({ label, latin, ...rest }: TextInputProps & { label: string; latin?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Txt size={13} weight={600} color={c.meta}>
        {label}
      </Txt>
      <TextInput
        placeholderTextColor={c.meta}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: c.card,
            borderColor: c.line,
            color: c.ink,
            fontFamily: ui(500),
            // text fields are not turned round by the phone: the side of the language's line
            textAlign: isEnglish ? 'left' : 'right',
            writingDirection: latin ? 'ltr' : undefined,
          },
        ]}
      />
    </View>
  );
}

export function MainButton({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  const { c } = useTheme();
  const off = disabled || busy;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [styles.main, { backgroundColor: c.on, opacity: disabled ? 0.45 : 1 }, pressed && !off && { opacity: 0.8 }]}
    >
      {busy ? (
        <ActivityIndicator color={c.onInk} />
      ) : (
        <Txt size={16} weight={700} color={c.onInk}>
          {label}
        </Txt>
      )}
    </Pressable>
  );
}

const G = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

export function GoogleButton({ onPress, busy }: { onPress: () => void; busy?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={busy ? undefined : onPress}
      style={({ pressed }) => [styles.google, { backgroundColor: c.card, borderColor: c.line }, pressed && { opacity: 0.7 }]}
    >
      {busy ? (
        <ActivityIndicator color={c.ink} />
      ) : (
        <>
          <SvgXml xml={G} width={20} height={20} />
          <Txt size={15.5} weight={600} color={c.ink}>
            {t('acGoogle')}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

export function OrLine() {
  const { c } = useTheme();
  return (
    <View style={styles.or}>
      <View style={[styles.orLine, { backgroundColor: c.line }]} />
      <Txt size={13} color={c.meta}>
        {t('acOr')}
      </Txt>
      <View style={[styles.orLine, { backgroundColor: c.line }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  main: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  google: { height: 54, borderRadius: 27, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
});
