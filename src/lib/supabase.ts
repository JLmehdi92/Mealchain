import { createClient } from '@supabase/supabase-js';
import { AESEncryptionKey, AESKeySize, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const KEYCHAIN = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

async function sessionKey(name: string): Promise<AESEncryptionKey> {
  const stored = await SecureStore.getItemAsync(name, KEYCHAIN);
  if (stored) return AESEncryptionKey.import(stored, 'hex');
  const created = await AESEncryptionKey.generate(AESKeySize.AES256);
  await SecureStore.setItemAsync(name, await created.encoded('hex'), KEYCHAIN);
  return created;
}

// Why: a session (JWT + user) exceeds the ~2 KB some iOS Keychains accept, so only its AES-GCM key
// lives in the Keychain and the sealed session sits in SQLite, unreadable without that key.
export const sessionStorage = {
  async getItem(name: string): Promise<string | null> {
    const [sealed, stored] = await Promise.all([Storage.getItemAsync(name), SecureStore.getItemAsync(name, KEYCHAIN)]);
    if (!sealed || !stored) return null;
    try {
      const key = await AESEncryptionKey.import(stored, 'hex');
      return new TextDecoder().decode(await aesDecryptAsync(AESSealedData.fromCombined(sealed), key));
    } catch {
      await sessionStorage.removeItem(name);
      return null;
    }
  },
  async setItem(name: string, value: string): Promise<void> {
    const sealed = await aesEncryptAsync(new TextEncoder().encode(value), await sessionKey(name));
    await Storage.setItemAsync(name, await sealed.combined('base64'));
  },
  async removeItem(name: string): Promise<void> {
    await Promise.all([Storage.removeItemAsync(name), SecureStore.deleteItemAsync(name, KEYCHAIN)]);
  },
};

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage: sessionStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;

if (supabase) {
  AppState.addEventListener('change', (state) =>
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh(),
  );
}
