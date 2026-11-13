// The member's profile (from the member's round on the home screen, once signed in): their picture,
// name, brother or sister and since when; their days of reading; the account (email, settings, log
// out). The first time after signing in it asks for the profile instead: the name and brother or
// sister (never changed later), and the age confirmation.
import { GlassBack } from '@/components/home/Glass';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Field, MainButton } from '@/components/Form';
import { FlameIcon, PersonIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Row, Section, Segments } from '@/components/SettingsList';
import { ScreenBackground } from '@/components/Stars';
import { Toggle } from '@/components/Toggle';
import { Txt } from '@/components/Txt';
import { ACCOUNT } from '@/i18n/account';
import { LOCALE, t } from '@/i18n/i18n';
import { createProfile, errorKey, signOut, useAccount, type Gender } from '@/lib/account';
import { activeDays, streak } from '@/lib/activity';
import { useTheme } from '@/theme/theme';

export default function Profile() {
  const { c, isDark } = useTheme();
  const account = useAccount();

  if (account.ready && !account.user) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ScreenBackground />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!account.ready ? (
        <>
          <ScreenHeader title={ACCOUNT.title()} />
          <ActivityIndicator color={c.gold} style={{ marginTop: 60 }} />
        </>
      ) : account.profile ? (
        <View style={{ flex: 1 }}>
          <ScreenHeader title={ACCOUNT.title()} />
          <ProfileView />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScreenHeader title="" />
          <CompleteProfile />
        </View>
      )}
    </View>
  );
}

function ProfileView() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAccount();
  const [days] = useState(() => activeDays());
  if (!profile) return null;

  const since = profile.created_at ? new Date(profile.created_at).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }) : '';
  const who = t(`ac_gender_${profile.gender}`);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 28 }}>
      {/* the picture and the name, on a card with a gold edge */}
      <View style={[styles.card, { borderWidth: 0 }]}>
        <GlassBack radius={26} />
        <Avatar name={profile.display_name} size={84} />
        <Txt serif size={28} weight={700} center color={c.ink} lineHeight={44} style={{ marginTop: 12 }}>
          {profile.display_name}
        </Txt>
        <Txt size={13.5} weight={500} center color={c.meta}>
          {since ? `${who} · ${t('acSince', since)}` : who}
        </Txt>
      </View>

      {/* the days of reading */}
      <Section title={ACCOUNT.myJourney()}>
        <View style={styles.stats}>
          <Stat icon={<FlameIcon color={c.ink} size={18} />} value={streak(days)} label={ACCOUNT.daysInRow()} />
          <View style={[styles.statLine, { backgroundColor: c.divider }]} />
          <Stat icon={<PersonIcon color={c.gold} size={18} />} value={days.size} label={ACCOUNT.daysRead()} />
        </View>
      </Section>

      <Section title={ACCOUNT.account()}>
        <Row icon={<PersonIcon color={c.ink} size={20} />} title={user?.email ?? ''} />
        <Row
          title={t('acSignOut')}
          onPress={async () => {
            await signOut();
            router.back();
          }}
          last
        />
      </Section>
    </ScrollView>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.stat}>
      {icon}
      <Txt size={24} weight={700} color={c.ink}>
        {value}
      </Txt>
      <Txt size={12.5} color={c.meta}>
        {label}
      </Txt>
    </View>
  );
}

function CompleteProfile() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nameOk = name.trim().length >= 2 && name.trim().length <= 30;

  const save = async () => {
    if (!gender) return;
    setBusy(true);
    setError('');
    try {
      await createProfile({ display_name: name, gender });
    } catch (err) {
      const key = errorKey(err);
      setError(key ? t(key) : ACCOUNT.failed());
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, gap: 22, paddingBottom: insets.bottom + 28 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center' }}>
          <Txt serif size={28} weight={700} center color={c.ink} lineHeight={44}>
            {ACCOUNT.completeTitle()}
          </Txt>
          <Txt size={14.5} center color={c.meta}>
            {ACCOUNT.completeSub()}
          </Txt>
        </View>

        <Field label={t('acName')} placeholder={ACCOUNT.namePlaceholder()} value={name} onChangeText={setName} maxLength={30} autoComplete="name" />

        <View style={{ gap: 8 }}>
          <Txt size={13} weight={600} color={c.meta}>
            {t('acGender')}
          </Txt>
          <Segments<Gender | ''>
            value={gender ?? ''}
            onChange={(g) => g && setGender(g)}
            options={[
              ['male', t('ac_gender_male')],
              ['female', t('ac_gender_female')],
            ]}
          />
          <Txt size={12.5} color={c.meta}>
            {t('acGenderHint')}
          </Txt>
        </View>

        <View style={[styles.age, { backgroundColor: c.card, borderColor: c.line }]}>
          <Txt size={14.5} weight={500} color={c.ink} style={{ flex: 1 }}>
            {t('acAge')}
          </Txt>
          <Toggle value={adult} onChange={setAdult} label={t('acAge')} />
        </View>

        {!!error && (
          <Txt size={13.5} color="#b4473b">
            {error}
          </Txt>
        )}
        {!nameOk && name.trim().length > 0 && (
          <Txt size={12.5} color={c.meta}>
            {ACCOUNT.nameShort()}
          </Txt>
        )}
        <MainButton label={ACCOUNT.begin()} onPress={save} busy={busy} disabled={!nameOk || !gender || !adult} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderRadius: 26, borderWidth: 1, paddingVertical: 26, paddingHorizontal: 18, marginTop: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statLine: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  age: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
});
