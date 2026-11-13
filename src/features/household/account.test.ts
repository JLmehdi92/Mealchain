import { getSetting, setSetting } from '@/lib/db/repo';
import { getState } from '@/lib/store';

import { household } from '../planner/fixtures';
import { createInvite, deleteAccount, joinHousehold, saveEverywhere, signInWithApple, signOut, validInvite } from './account';
import { linkPurchases, unlinkPurchases } from '../subscription/purchase';
import { adoptMerged } from './profileSync';
import { applyHousehold } from './save';
import { wipeAll } from './wipe';

const mockRpc = jest.fn((_name: string, _args?: unknown) => Promise.resolve({ data: 'h-new' as string | null, error: null }));
let mockMembers: unknown = [];
let mockProfile: unknown = {};
let mockUpdateError: Error | null = null;
const mockInvoke = jest.fn((_name: string, _options?: unknown) => Promise.resolve({ data: null, error: null as Error | null }));
const mockSignOut = jest.fn((_options?: unknown) => Promise.resolve({ error: null as Error | null }));

jest.mock('expo-apple-authentication', () => ({ signInAsync: () => Promise.resolve({ identityToken: 'token', authorizationCode: 'apple-code' }) }));
jest.mock('@/lib/supabase', () => {
  const single = () => Promise.resolve({ data: { profile: mockProfile }, error: null });
  const households = { select: () => households, eq: () => households, single, update: () => households, then: (resolve: (v: unknown) => void) => resolve({ error: mockUpdateError }) };
  const members = { select: () => members, order: () => Promise.resolve({ data: mockMembers, error: null }) };
  return {
    supabase: {
      auth: {
        signInWithIdToken: () => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null }),
        getSession: () => Promise.resolve({ data: { session: {} } }),
        signOut: (options?: unknown) => mockSignOut(options),
      },
      from: (table: string) => (table === 'households' ? households : members),
      rpc: (name: string, args?: unknown) => mockRpc(name, args),
      functions: { invoke: (name: string, options?: unknown) => mockInvoke(name, options) },
    },
  };
});
jest.mock('@/lib/db/repo', () => ({ getSetting: jest.fn(), setSetting: jest.fn() }));
jest.mock('@/lib/store', () => ({ getState: jest.fn() }));
jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));
jest.mock('./save', () => ({ applyHousehold: jest.fn() }));
jest.mock('./profileSync', () => ({ adoptMerged: jest.fn() }));
jest.mock('../subscription/purchase', () => ({ linkPurchases: jest.fn(() => Promise.resolve()), unlinkPurchases: jest.fn(() => Promise.resolve()) }));
jest.mock('./wipe', () => ({ wipeAll: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getState).mockReturnValue({ household: household() } as never);
  mockProfile = household({ people: 4 });
  mockUpdateError = null;
});

describe('signInWithApple', () => {
  it('keeps the household already linked to this device when the account belongs to it', async () => {
    mockMembers = [{ household_id: 'h-joined' }, { household_id: 'h-own' }];
    jest.mocked(getSetting).mockResolvedValue('h-own');
    await signInWithApple();
    expect(setSetting).toHaveBeenCalledWith('remote_household', 'h-own');
    expect(adoptMerged).toHaveBeenCalledWith(household({ people: 4 }));
    expect(applyHousehold).not.toHaveBeenCalled();
  });

  it('otherwise adopts the first household, joined ones first', async () => {
    mockMembers = [{ household_id: 'h-joined' }, { household_id: 'h-own' }];
    jest.mocked(getSetting).mockResolvedValue(null);
    await signInWithApple();
    expect(setSetting).toHaveBeenCalledWith('remote_household', 'h-joined');
  });

  it('creates a household from the local one when the account has none, forgetting any stale id', async () => {
    mockMembers = [];
    jest.mocked(getSetting).mockResolvedValueOnce('h-stale').mockResolvedValueOnce('');
    await signInWithApple();
    expect(setSetting).toHaveBeenCalledWith('remote_household', '');
    expect(mockRpc).toHaveBeenCalledWith('create_household', { profile: household() });
    expect(setSetting).toHaveBeenLastCalledWith('remote_household', 'h-new');
  });

  it('hands the one-time Apple authorization code to the server so the token can be revoked later', async () => {
    mockMembers = [];
    await signInWithApple();
    expect(mockInvoke).toHaveBeenCalledWith('apple-token', { body: { code: 'apple-code' } });
  });

  it('does not adopt a remote profile that fails validation', async () => {
    mockMembers = [{ household_id: 'h1' }];
    mockProfile = { people: -1 };
    await signInWithApple();
    expect(adoptMerged).not.toHaveBeenCalled();
  });

  it('links purchases to the Supabase user so server deletion can find them', async () => {
    mockMembers = [];
    await signInWithApple();
    expect(linkPurchases).toHaveBeenCalledWith('user-1');
  });
});

describe('joinHousehold', () => {
  it('refuses a malformed code without calling the server', async () => {
    await expect(joinHousehold('abc')).rejects.toThrow('invalid_invite');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('joins with the upper-cased code, reading O as 0 and I or L as 1, and adopts the shared profile', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'h2', error: null });
    await joinHousehold(' ab12cd34oilz ');
    expect(mockRpc).toHaveBeenCalledWith('join_household', { invite_code: 'AB12CD34011Z' });
    expect(setSetting).toHaveBeenCalledWith('remote_household', 'h2');
    expect(adoptMerged).toHaveBeenCalledWith(household({ people: 4 }));
  });

  it('reports a wrong or used code as invalid', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(joinHousehold('AB12CD34EF56')).rejects.toThrow('invalid_invite');
    expect(adoptMerged).not.toHaveBeenCalled();
  });
});

it.each([['AB12CD34EF56', true], ['AB12CD34', false], ['AB12CD34EF5U', false]])('validInvite(%s) is %s', (code, valid) => {
  expect(validInvite(code)).toBe(valid);
});

it('createInvite asks for the household linked to this device', async () => {
  jest.mocked(getSetting).mockResolvedValue('h-own');
  mockRpc.mockResolvedValueOnce({ data: 'AB12CD34EF56', error: null });
  expect(await createInvite()).toBe('AB12CD34EF56');
  expect(mockRpc).toHaveBeenCalledWith('create_invite', { target: 'h-own' });
});

describe('deleteAccount', () => {
  it('deletes the account on the server, then signs out locally and wipes the device', async () => {
    await deleteAccount();
    expect(mockInvoke).toHaveBeenCalledWith('delete-account', { method: 'POST' });
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(wipeAll).toHaveBeenCalled();
    expect(unlinkPurchases).toHaveBeenCalled();
  });

  it('keeps local data when the server refuses, so the user can retry', async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error('500') });
    await expect(deleteAccount()).rejects.toThrow('500');
    expect(wipeAll).not.toHaveBeenCalled();
  });

  it('still wipes the device when signing out throws', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('offline'));
    await expect(deleteAccount()).rejects.toThrow('offline');
    expect(wipeAll).toHaveBeenCalled();
  });
});

it('signOut forgets the shared household and unlinks purchases', async () => {
  await signOut();
  expect(setSetting).toHaveBeenCalledWith('remote_household', '');
  expect(unlinkPurchases).toHaveBeenCalled();
});

it('saveEverywhere leaves a pending flag when the profile cannot reach the household', async () => {
  jest.mocked(getSetting).mockResolvedValue('h-own');
  mockUpdateError = new Error('offline');
  await saveEverywhere(household());
  await new Promise(process.nextTick);
  expect(setSetting).toHaveBeenCalledWith('profile_sync_pending', 'yes');
});
