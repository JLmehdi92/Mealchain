import { z } from 'zod';

import { getSetting, setSetting } from '@/lib/db/repo';
import { householdSchema } from '@/lib/db/schemas';
import { getState } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { sharedHousehold } from '@/lib/sync';

import { ALLERGENS, DIETS, type Allergen, type Diet } from '../ingredients/schema';
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

type Withdrawn = Pick<ProfileDiff, 'allergens' | 'diets'>;
type Seen = { profile: Household | null; withdrawn: Withdrawn };

const seenSchema = z.object({
  profile: householdSchema,
  withdrawn: z.object({ allergens: z.array(z.enum(ALLERGENS)), diets: z.array(z.enum(DIETS)) }),
});
const sameSet = <T>(a: T[], b: T[]) => minus(a, b).length === 0 && minus(b, a).length === 0;

async function readSeen(): Promise<Seen> {
  const parsed = seenSchema.safeParse(JSON.parse((await getSetting('remote_profile_seen')) ?? 'null'));
  return parsed.success ? parsed.data : { profile: null, withdrawn: { allergens: [], diets: [] } };
}

const writeSeen = (seen: Seen) => setSetting('remote_profile_seen', JSON.stringify(seen));

export async function pushProfile(profile: Household): Promise<boolean> {
  const householdId = await sharedHousehold();
  if (!supabase || !householdId) return false;
  const { profile: remote, withdrawn } = await readSeen();
  const outgoing: Household = {
    ...profile,
    allergens: minus(profile.allergens, withdrawn.allergens),
    diets: minus(profile.diets, withdrawn.diets),
    equipment: remote?.equipment ?? profile.equipment,
  };
  const sent = await supabase
    .from('households')
    .update({ profile: outgoing })
    .eq('id', householdId)
    .then(({ error }) => !error, () => false);
  if (!sent) {
    await setSetting('profile_sync_pending', 'yes');
    return false;
  }
  await setSetting('profile_sync_pending', '');
  await writeSeen({ profile: outgoing, withdrawn });
  return true;
}

export async function adoptMerged(remote: Household): Promise<Merge> {
  const local = getState().household;
  const merge = mergeProfiles(local ?? remote, remote);
  const seen = await readSeen();
  const knewBefore = <T extends Allergen | Diet>(item: T, key: keyof Withdrawn) =>
    [...(seen.profile?.[key] ?? []), ...seen.withdrawn[key]].includes(item);
  const withdrawn: Withdrawn = {
    allergens: merge.removed.allergens.filter((item) => knewBefore(item, 'allergens')),
    diets: merge.removed.diets.filter((item) => knewBefore(item, 'diets')),
  };
  const addedHere = merge.removed.allergens.length + merge.removed.diets.length > withdrawn.allergens.length + withdrawn.diets.length;
  const equipmentChanged = !seen.profile || !sameSet(seen.profile.equipment, remote.equipment);
  await applyHousehold(merge.profile);
  await writeSeen({ profile: remote, withdrawn });
  if (addedHere) await pushProfile(merge.profile);
  return {
    profile: merge.profile,
    added: { ...merge.added, equipment: equipmentChanged ? merge.added.equipment : [] },
    removed: { ...withdrawn, equipment: equipmentChanged ? merge.removed.equipment : [] },
  };
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
  const changed = JSON.stringify(remote) !== JSON.stringify((await readSeen()).profile);
  const merge = changed ? await adoptMerged(remote) : null;
  const { household } = getState();
  if (household && (await getSetting('profile_sync_pending')) === 'yes') await pushProfile(household);
  return merge;
}
