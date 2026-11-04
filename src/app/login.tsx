// Logging in or creating an account (from the member's round on the home screen): with Google, or with
// an email and a password. «Don't have an account? Create one» switches between the two. Once signed in
// the profile opens (to be completed the first time).
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, GoogleButton, MainButton, OrLine } from '@/components/Form';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenBackground } from '@/components/Stars';
import { Txt } from '@/components/Txt';
import { ACCOUNT } from '@/i18n/account';
import { t } from '@/i18n/i18n';
import { errorKey, signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/account';
import { configured } from '@/lib/supabase';
import { useTheme } from '@/theme/theme';

type Mode = 'login' | 'signup';

export default function Login() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const signup = mode === 'signup';
  const ready = /\S+@\S+\.\S+/.test(email) && password.length >= (signup ? 8 : 1);

  const fail = (err: unknown) => {
    const key = errorKey(err);
    setError(key ? t(key) : ACCOUNT.failed());
  };
  const done = () => router.replace('/profile');

  const google = async () => {
    setBusy('google');
    setError('');
    try {
      if (await signInWithGoogle()) done();
    } catch (err) {
      fail(err);
    }
    setBusy(null);
  };
  const withEmail = async () => {
    setBusy('email');
    setError('');
    try {
      if (signup) {
        if (await signUpWithEmail(email, password)) done();
        else setSentTo(email.trim());
      } else {
        await signInWithEmail(email, password);
        done();
      }
    } catch (err) {
      fail(err);
    }
    setBusy(null);
  };
  const switchTo = (m: Mode) => {
    setMode(m);
    setError('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <Txt serif size={28} weight={700} center color={c.ink} lineHeight={44}>
              {sentTo ? ACCOUNT.checkInbox() : signup ? ACCOUNT.join() : ACCOUNT.welcomeBack()}
            </Txt>
            <Txt size={14.5} center color={c.meta} style={{ marginTop: 2 }}>
              {sentTo ? t('acCheckEmail', sentTo) : signup ? ACCOUNT.joinSub() : ACCOUNT.loginSub()}
            </Txt>
          </View>

          {!configured ? (
            <Txt size={14} center color={c.meta}>
              {t('acNotConfigured')}
            </Txt>
          ) : sentTo ? (
            <MainButton
              label={ACCOUNT.backToLogin()}
              onPress={() => {
                setSentTo('');
                setPassword('');
                switchTo('login');
              }}
            />
          ) : (
            <View style={{ gap: 16 }}>
              <GoogleButton onPress={google} busy={busy === 'google'} />
              <OrLine />
              <Field
                label={t('acEmail')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                latin
              />
              <View style={{ gap: 6 }}>
                <Field
                  label={t('acPassword')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  textContentType={signup ? 'newPassword' : 'password'}
                  onSubmitEditing={ready ? withEmail : undefined}
                  latin
                />
                {signup && (
                  <Txt size={12.5} color={c.meta}>
                    {t('acPasswordHint')}
                  </Txt>
                )}
              </View>
              {!!error && (
                <Txt size={13.5} color="#b4473b">
                  {error}
                </Txt>
              )}
              <MainButton label={signup ? t('acSignUp') : t('acLogIn')} onPress={withEmail} busy={busy === 'email'} disabled={!ready} />

              <View style={styles.switch}>
                <Txt size={14} color={c.meta}>
                  {signup ? t('acHaveAccount') : t('acNoAccount')}
                </Txt>
                <Pressable onPress={() => switchTo(signup ? 'login' : 'signup')} hitSlop={10}>
                  <Txt size={14} weight={700} color={c.ink}>
                    {signup ? t('acLogIn') : t('acCreateOne')}
                  </Txt>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, gap: 26 },
  top: { alignItems: 'center', marginTop: 4 },
  switch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 },
});
