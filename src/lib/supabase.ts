import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage: localStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

if (supabase) {
  AppState.addEventListener('change', (state) =>
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh(),
  );
}
