import { getSetting, setSetting } from '@/lib/db/repo';
import { getState } from '@/lib/store';

import { household } from '../planner/fixtures';
import { joinHousehold, signInWithApple, signOut } from './account';
import { applyHousehold } from './save';

const mockRpc = jest.fn((_name: string, _args?: unknown) => Promise.resolve({ data: 'h-new', error: null }));
let mockMembers: unknown = [];
let mockProfile: unknown = {};

jest.mock('expo-apple-authentication', () => ({ signInAsync: () => Promise.resolve({ identityToken: 'token' }) }));
jest.mock('@/lib/supabase', () => {
  const single = () => Promise.resolve({ data: { profile: mockProfile }, error: null });
  const households = { select: () => households, eq: () => households, single, update: () => households };
  const members = { select: () => members, order: () => Promise.resolve({ data: mockMembers, error: null }) };
  return {
    supabase: {
      auth: {
        signInWithIdToken: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: {} } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (table: string) => (table === 'households' ? households : members),
      rpc: (name: string, args?: unknown) => mockRpc(name, args),
    },
  };
});
jest.mock('@/lib/db/repo', () => ({ getSetting: jest.fn(), setSetting: jest.fn() }));
jest.mock('@/lib/store', () => ({ getState: jest.fn() }));
jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));
jest.mock('./save', () => ({ applyHousehold: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getState).mockReturnValue({ household: household() } as never);
  mockProfile = household({ people: 4 });
});

describe('signInWithApple', () => {
  it('keeps the household already linked to this device when the account belongs to it', async () => {
    mockMembers = [{ household_id: 'h-joined' }, { household_id: 'h-own' }];
    jest.mocked(getSetting).mockResolvedValue('h-own');
    await signInWithApple();
    expect(setSetting).toHaveBeenCalledWith('remote_household', 'h-own');
    expect(applyHousehold).toHaveBeenCalledWith(household({ people: 4 }));
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

  it('does not adopt a remote profile that fails validation', async () => {
    mockMembers = [{ household_id: 'h1' }];
    mockProfile = { people: -1 };
    await signInWithApple();
    expect(applyHousehold).not.toHaveBeenCalled();
  });
});

describe('joinHousehold', () => {
  it('refuses a malformed code without calling the server', async () => {
    await expect(joinHousehold('abc')).rejects.toThrow('invalid_invite');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('joins with the upper-cased code and adopts the shared profile', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'h2', error: null });
    await joinHousehold(' ab12cd34 ');
    expect(mockRpc).toHaveBeenCalledWith('join_household', { invite_code: 'AB12CD34' });
    expect(setSetting).toHaveBeenCalledWith('remote_household', 'h2');
    expect(applyHousehold).toHaveBeenCalled();
  });
});

it('signOut forgets the shared household', async () => {
  await signOut();
  expect(setSetting).toHaveBeenCalledWith('remote_household', '');
});
