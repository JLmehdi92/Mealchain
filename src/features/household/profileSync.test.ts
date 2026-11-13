import { getSetting, setSetting } from '@/lib/db/repo';
import { getState } from '@/lib/store';
import { sharedHousehold } from '@/lib/sync';

import { household } from '../planner/fixtures';
import { adoptMerged, mergeProfiles, pullProfile, pushProfile } from './profileSync';
import { applyHousehold } from './save';

const mockUpdate = jest.fn();
let mockRemote: unknown = null;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      update: (value: unknown) => ({ eq: () => mockUpdate(value) }),
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { profile: mockRemote }, error: null }) }) }),
    }),
  },
}));
jest.mock('@/lib/db/repo', () => ({ getSetting: jest.fn(), setSetting: jest.fn() }));
jest.mock('@/lib/store', () => ({ getState: jest.fn() }));
jest.mock('@/lib/sync', () => ({ sharedHousehold: jest.fn() }));
jest.mock('./save', () => ({ applyHousehold: jest.fn() }));

const settings = new Map<string, string>();
const local = household({ allergens: ['peanuts', 'milk'], equipment: ['oven', 'stovetop'], people: 2 });

beforeEach(() => {
  jest.clearAllMocks();
  settings.clear();
  jest.mocked(getSetting).mockImplementation(async (key) => settings.get(key) ?? null);
  jest.mocked(setSetting).mockImplementation(async (key, value) => void settings.set(key, value));
  jest.mocked(getState).mockReturnValue({ household: local } as never);
  jest.mocked(sharedHousehold).mockResolvedValue('h1');
  mockUpdate.mockResolvedValue({ error: null });
});

describe('mergeProfiles', () => {
  it('keeps every local allergy and diet when joining a household that lists fewer', () => {
    const { profile, removed } = mergeProfiles(household({ allergens: ['peanuts'], diets: ['vegan'] }), household());
    expect(profile.allergens).toEqual(['peanuts']);
    expect(profile.diets).toEqual(['vegan']);
    expect(removed).toEqual({ allergens: ['peanuts'], diets: ['vegan'], equipment: [] });
  });

  it('gains an allergy or diet the household added, and says which', () => {
    const { profile, added } = mergeProfiles(household({ allergens: ['milk'] }), household({ allergens: ['milk', 'sesame'], diets: ['halal'] }));
    expect(profile.allergens).toEqual(['milk', 'sesame']);
    expect(profile.diets).toEqual(['halal']);
    expect(added).toEqual({ allergens: ['sesame'], diets: ['halal'], equipment: [] });
  });

  it('keeps local equipment and units but takes people, meals and time from the household', () => {
    const remote = household({ equipment: ['oven', 'grill'], people: 4, dinners: 6, lunches: 2, maxMinutes: 30, market: 'us' });
    const { profile, added, removed } = mergeProfiles(local, remote);
    expect(profile).toMatchObject({ equipment: ['oven', 'stovetop'], people: 4, dinners: 6, lunches: 2, maxMinutes: 30, market: 'fr' });
    expect(added.equipment).toEqual(['grill']);
    expect(removed.equipment).toEqual(['stovetop']);
  });
});

describe('adoptMerged', () => {
  it('applies the merged profile and sends the kept allergies back to the household', async () => {
    const merge = await adoptMerged(household({ allergens: ['milk'] }));
    expect(applyHousehold).toHaveBeenCalledWith(merge.profile);
    expect(merge.profile.allergens).toEqual(['peanuts', 'milk']);
    expect(mockUpdate).toHaveBeenCalledWith({ profile: merge.profile });
  });

  it('adopts the household profile as is on a new device', async () => {
    jest.mocked(getState).mockReturnValue({ household: null } as never);
    const remote = household({ allergens: ['eggs'] });
    await adoptMerged(remote);
    expect(applyHousehold).toHaveBeenCalledWith(remote);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe('pushProfile', () => {
  it('leaves a pending flag when the push fails, and clears it once it goes through', async () => {
    mockUpdate.mockResolvedValueOnce({ error: new Error('offline') });
    await expect(pushProfile(local)).resolves.toBe(false);
    expect(settings.get('profile_sync_pending')).toBe('yes');
    await expect(pushProfile(local)).resolves.toBe(true);
    expect(settings.get('profile_sync_pending')).toBe('');
  });

  it('does nothing without a shared household', async () => {
    jest.mocked(sharedHousehold).mockResolvedValue(null);
    await expect(pushProfile(local)).resolves.toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe('pullProfile', () => {
  it('merges the household profile once and reports it only when it changed', async () => {
    mockRemote = household({ allergens: ['peanuts', 'milk', 'fish'], equipment: ['oven', 'stovetop'] });
    const merge = await pullProfile();
    expect(merge?.added.allergens).toEqual(['fish']);
    jest.mocked(getState).mockReturnValue({ household: merge?.profile } as never);
    await expect(pullProfile()).resolves.toBeNull();
  });

  it('retries a pending push even when the household profile did not change', async () => {
    mockRemote = local;
    settings.set('profile_sync_pending', 'yes');
    await pullProfile();
    expect(mockUpdate).toHaveBeenCalledWith({ profile: local });
    expect(settings.get('profile_sync_pending')).toBe('');
  });

  it('ignores a malformed household profile', async () => {
    mockRemote = { people: 'many' };
    await expect(pullProfile()).resolves.toBeNull();
    expect(applyHousehold).not.toHaveBeenCalled();
  });

  it('stays quiet without a shared household', async () => {
    jest.mocked(sharedHousehold).mockResolvedValue(null);
    await expect(pullProfile()).resolves.toBeNull();
  });
});
