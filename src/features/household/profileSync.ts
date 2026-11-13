import { z } from 'zod';

import { getSetting, setSetting } from '@/lib/db/repo';
import { householdSchema } from '@/lib/db/schemas';
import { getState } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { sharedHousehold } from '@/lib/sync';

import type { Allergen, Diet } from '../ingredients/schema';
import type { Equipment, Household } from '../recipes/types';
import { applyHousehold } from './save';

type ProfileDiff = { allergens: Allergen[]; diets: Diet[]; equipment: Equipment[] };
export type Merge = { profile: Household; added: ProfileDiff; removed: ProfileDiff };

const minus = <T>(from: T[], other: T[]) => from.filter((item) => !other.includes(item));
const diff = (a: Household, b: Household): ProfileDiff => ({
  allergens: minus(a.allergens, b.allergens),
  diets: minus(a.diets, b.diets),
  equipment: minus(a.equipment, b.equipment),
});

export function mergeProfiles(local: Household, remote: Household): Merge {
  const added = diff(remote, local);
  return {
    profile: {
      ...local,
      people: remote.people,
      dinners: remote.dinners,
      lunches: remote.lunches,
      maxMinutes: remote.maxMinutes,
      allergens: [...local.allergens, ...added.allergens],
      diets: [...local.diets, ...added.diets],
    },
    added,
    removed: diff(local, remote),
  };
}

export async function pushProfile(profile: Household): Promise<boolean> {
  const householdId = await sharedHousehold();
  if (!supabase || !householdId) return false;
  const sent = await supabase
    .from('households')
    .update({ profile })
    .eq('id', householdId)
    .then(({ error }) => !error, () => false);
  if (!sent) {
    await setSetting('profile_sync_pending', 'yes');
    return false;
  }
  await setSetting('profile_sync_pending', '');
  await setSetting('remote_profile_seen', JSON.stringify(profile));
  return true;
}

export async function adoptMerged(remote: Household): Promise<Merge> {
  const local = getState().household;
  const merge = local ? mergeProfiles(local, remote) : mergeProfiles(remote, remote);
  await applyHousehold(merge.profile);
  await setSetting('remote_profile_seen', JSON.stringify(remote));
  if (merge.removed.allergens.length > 0 || merge.removed.diets.length > 0) await pushProfile(merge.profile);
  return merge;
}

async function fetchProfile(householdId: string): Promise<Household | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('households').select('profile').eq('id', householdId).single();
  if (error) throw error;
  const parsed = householdSchema.safeParse(z.object({ profile: z.unknown() }).safeParse(data).data?.profile);
  return parsed.success ? parsed.data : null;
}

export async function pullProfile(): Promise<Merge | null> {
  const householdId = await sharedHousehold();
  const remote = householdId ? await fetchProfile(householdId) : null;
  if (!remote) return null;
  const changed = JSON.stringify(remote) !== (await getSetting('remote_profile_seen'));
  const merge = changed ? await adoptMerged(remote) : null;
  const { household } = getState();
  if (household && (await getSetting('profile_sync_pending')) === 'yes') await pushProfile(household);
  return merge;
}
