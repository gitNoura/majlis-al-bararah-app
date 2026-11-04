// The member's account: who is signed in, and their profile (the «profiles» table, see
// supabase/migrations: name, brother or sister, languages, country). Signing in with Google or with an
// email and a password; creating an account the same two ways.
//
// The screens read it with useAccount() (a snapshot: the React Compiler would keep a value read
// straight from this module as it first was). The name and the brother / sister are also kept on the
// phone ('mjProfile'), so the home screen shows them at once, before Supabase answers.
import type { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useSyncExternalStore } from 'react';

import { LANG } from '@/i18n/i18n';
import { calendarCountry } from '@/lib/hijri';
import { readJSON, writeJSON } from '@/lib/storage';
import { configured, supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type Gender = 'male' | 'female';
export type Profile = {
  id: string;
  display_name: string;
  gender: Gender;
  languages?: string[];
  country?: string | null;
  riwaya?: string;
  created_at?: string;
};
type Cached = Pick<Profile, 'display_name' | 'gender'> | null;
export type Account = {
  // false until the first answer from Supabase (the cached name is shown meanwhile)
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  cached: Cached;
};

let state: Account = { ready: false, user: null, profile: null, cached: readJSON('mjProfile', null) };
const listeners = new Set<() => void>();

function set(next: Partial<Account>) {
  state = { ...state, ...next };
  if ('profile' in next || 'user' in next) {
    const p = state.user ? state.profile : null;
    const cached = p ? { display_name: p.display_name, gender: p.gender } : null;
    writeJSON('mjProfile', cached);
    state = { ...state, cached };
  }
  listeners.forEach((fn) => fn());
}

export function useAccount(): Account {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => state,
  );
}

async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function signedIn(user: User | null) {
  if (!user) return set({ ready: true, user: null, profile: null });
  if (user.id === state.user?.id && state.profile) return set({ ready: true, user });
  try {
    set({ ready: true, user, profile: await getProfile(user.id) });
  } catch {
    // offline: still signed in; the profile comes when the app is opened again
    set({ ready: true, user });
  }
}

// once, as the app starts (src/app/_layout.tsx)
let started = false;
export function startAccount() {
  if (started || !configured) {
    if (!configured) set({ ready: true });
    return;
  }
  started = true;
  supabase.auth.getSession().then(({ data }) => signedIn(data.session?.user ?? null));
  // the confirmation email's link opens the app with ?code=…: the sign-in
  Linking.getInitialURL().then(fromLink);
  Linking.addEventListener('url', ({ url }) => fromLink(url));
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') signedIn(session?.user ?? null);
  });
}

async function fromLink(url: string | null) {
  const code = url ? Linking.parse(url).queryParams?.code : null;
  if (typeof code !== 'string') return;
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) signedIn(data.user);
}

// Google: its page opens in the phone's browser and sends the member back to the app with a code,
// exchanged here for the sign-in. Returns false when the member closed the page.
export async function signInWithGoogle(): Promise<boolean> {
  const back = Linking.createURL('login');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: back, skipBrowserRedirect: true },
  });
  if (error) throw error;
  const result = await WebBrowser.openAuthSessionAsync(data.url, back);
  if (result.type !== 'success') return false;
  const params = Linking.parse(result.url).queryParams ?? {};
  if (params.error_description || params.error) throw new Error(String(params.error_description || params.error));
  const code = typeof params.code === 'string' ? params.code : null;
  if (!code) throw new Error('No code from Google');
  const { data: session, error: failed } = await supabase.auth.exchangeCodeForSession(code);
  if (failed) throw failed;
  await signedIn(session.user);
  return true;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  await signedIn(data.user);
}

// A new account by email: Supabase sends an email with a link to confirm the address. Returns true
// when the account can be used at once (confirmation turned off), false when the email must be opened.
export async function signUpWithEmail(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    // the email's link opens the app again, on the phone the account was made on
    options: { emailRedirectTo: Linking.createURL('login') },
  });
  if (error) throw error;
  if (data.session) await signedIn(data.user);
  return Boolean(data.session);
}

export async function signOut() {
  await supabase.auth.signOut();
  set({ user: null, profile: null });
}

// The profile, created once after the first sign-in (the brother / sister cannot be changed later:
// the database refuses it)
export async function createProfile(fields: { display_name: string; gender: Gender }) {
  const user = state.user;
  if (!user) throw new Error('Not signed in');
  const row = {
    id: user.id,
    display_name: fields.display_name.trim(),
    gender: fields.gender,
    languages: [LANG],
    age_confirmed: true,
    country: calendarCountry() || null,
  };
  const { data, error } = await supabase.from('profiles').insert(row).select().single();
  if (error) throw error;
  set({ profile: data });
}

export async function renameProfile(display_name: string) {
  const user = state.user;
  if (!user) return;
  const { data, error } = await supabase.from('profiles').update({ display_name: display_name.trim() }).eq('id', user.id).select().single();
  if (error) throw error;
  set({ profile: data });
}

// Supabase's common messages, in the reader's language (src/i18n: ac…)
export function errorKey(err: unknown): string | null {
  const code = (err as { code?: string })?.code;
  const known: Record<string, string> = {
    invalid_credentials: 'acErrCredentials',
    user_already_exists: 'acErrExists',
    email_exists: 'acErrExists',
    email_not_confirmed: 'acErrNotConfirmed',
    weak_password: 'acErrWeak',
    over_email_send_rate_limit: 'acErrRate',
    validation_failed: 'acErrEmail',
    email_address_invalid: 'acErrEmail',
  };
  return code && known[code] ? known[code] : null;
}
