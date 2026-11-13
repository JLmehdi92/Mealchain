import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';

import { sessionStorage } from './supabase';

const mockKeychain = new Map<string, string>();
const mockDisk = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 7,
  getItemAsync: jest.fn(async (key: string) => mockKeychain.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => void mockKeychain.set(key, value)),
  deleteItemAsync: jest.fn(async (key: string) => void mockKeychain.delete(key)),
}));
jest.mock('expo-sqlite/kv-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockDisk.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => void mockDisk.set(key, value)),
  removeItemAsync: jest.fn(async (key: string) => mockDisk.delete(key)),
}));
jest.mock('expo-crypto', () => {
  type MockKey = { hex: string };
  let next = 0;
  const key = (hex: string): MockKey & { encoded: () => Promise<string> } => ({ hex, encoded: async () => hex });
  return {
    AESKeySize: { AES256: 256 },
    AESEncryptionKey: { generate: async () => key(`key${(next += 1)}`), import: async (hex: string) => key(hex) },
    AESSealedData: { fromCombined: (combined: string) => combined },
    aesEncryptAsync: async (bytes: Uint8Array, k: MockKey) => ({
      combined: async () => `${k.hex}:${Array.from(bytes).join(',')}`,
    }),
    aesDecryptAsync: async (sealed: string, k: MockKey) => {
      const [hex, body] = sealed.split(':');
      if (hex !== k.hex || body === undefined) throw new Error('tag mismatch');
      return Uint8Array.from(body.split(',').map(Number));
    },
  };
});

const SESSION = JSON.stringify({ access_token: 'a'.repeat(1200), refresh_token: 'r', user: { note: 'é'.repeat(4000) } });

beforeEach(() => {
  mockKeychain.clear();
  mockDisk.clear();
  jest.clearAllMocks();
});

it('round-trips a session far larger than the 2 KB Keychain limit', async () => {
  await sessionStorage.setItem('sb-auth', SESSION);
  expect(await sessionStorage.getItem('sb-auth')).toBe(SESSION);
});

it('keeps only the key in the Keychain, this device only, and never writes the session in clear', async () => {
  await sessionStorage.setItem('sb-auth', SESSION);
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('sb-auth', expect.stringMatching(/^key/), { keychainAccessible: 7 });
  expect(mockKeychain.get('sb-auth')!.length).toBeLessThan(100);
  expect(mockDisk.get('sb-auth')).not.toContain('access_token');
});

it('reuses the stored key on refresh', async () => {
  await sessionStorage.setItem('sb-auth', 'first');
  await sessionStorage.setItem('sb-auth', 'second');
  expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  expect(await sessionStorage.getItem('sb-auth')).toBe('second');
});

it('returns null when nothing is stored', async () => {
  expect(await sessionStorage.getItem('sb-auth')).toBeNull();
});

it('drops a value it cannot decrypt, such as a legacy plaintext session', async () => {
  mockDisk.set('sb-auth', SESSION);
  mockKeychain.set('sb-auth', 'key9');
  expect(await sessionStorage.getItem('sb-auth')).toBeNull();
  expect(mockDisk.has('sb-auth')).toBe(false);
  expect(mockKeychain.has('sb-auth')).toBe(false);
});

it('removes both the key and the sealed session', async () => {
  await sessionStorage.setItem('sb-auth', SESSION);
  await sessionStorage.removeItem('sb-auth');
  expect(mockKeychain.size + mockDisk.size).toBe(0);
  expect(Storage.removeItemAsync).toHaveBeenCalledWith('sb-auth');
});
