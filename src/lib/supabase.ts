// The connection to Supabase: the same project as the website (its address and public key in
// .env.local), so a member has one account on the website and in the app. The sign-in is kept on the
// phone in the app's small database (the localStorage installed in index.js) and renewed while the
// app is open.
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const configured = Boolean(url && key);

export const supabase = createClient(url || 'https://not-configured.supabase.co', key || 'none', {
  auth: {
    storage: globalThis.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Google sends the member back with ?code=…, exchanged for a session (src/lib/account.ts)
    flowType: 'pkce',
  },
});

// renew the sign-in only while the app is on the screen (as Supabase advises for phones)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
