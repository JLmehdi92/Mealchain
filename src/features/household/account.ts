import * as AppleAuthentication from 'expo-apple-authentication';
import { z } from 'zod';

import { householdSchema } from '@/lib/db/schemas';
import { getSetting, setSetting } from '@/lib/db/repo';
import { report } from '@/lib/monitoring';
import { getState } from '@/lib/store';
import { supabase } from '@/lib/supabase';

import type { Household } from '../recipes/types';
import { applyHousehold } from './save';

export const accountAvailable = !!supabase;
const INVITE = /^[A-Z0-9]{8}$/;

function client() {
  if (!supabase) throw new Error('account_unavailable');
  return supabase;
}

export async function signedIn(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function adoptRemoteProfile(householdId: string) {
  await setSetting('remote_household', householdId);
  const { data, error } = await client().from('households').select('profile').eq('id', householdId).single();
  if (error) throw error;
  const profile = householdSchema.safeParse(z.object({ profile: z.unknown() }).parse(data).profile);
  if (profile.success) await applyHousehold(profile.data);
}

export async function syncProfile(household: Household) {
  if (!(await signedIn())) return;
  const householdId = await getSetting('remote_household');
  if (householdId) {
    const { error } = await client().from('households').update({ profile: household }).eq('id', householdId);
    if (error) throw error;
    return;
  }
  const { data, error } = await client().rpc('create_household', { profile: household });
  if (error) throw error;
  await setSetting('remote_household', z.string().parse(data));
}

export async function saveEverywhere(household: Household) {
  await applyHousehold(household);
  syncProfile(household).catch(report);
}

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
  if (!credential.identityToken) throw new Error('no_identity_token');
  const { error } = await client().auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
  if (error) throw error;
  const { data: members, error: memberError } = await client().from('household_members').select('household_id, role').order('role');
  if (memberError) throw memberError;
  const ids = z.array(z.object({ household_id: z.string() })).parse(members).map((m) => m.household_id);
  const stored = await getSetting('remote_household');
  const existing = stored && ids.includes(stored) ? stored : ids[0];
  if (existing) return adoptRemoteProfile(existing);
  await setSetting('remote_household', '');
  const { household } = getState();
  if (household) await syncProfile(household);
}

export async function signOut(): Promise<void> {
  await setSetting('remote_household', '');
  const { error } = await client().auth.signOut();
  if (error) throw error;
}

export async function createInvite(): Promise<string> {
  const { data, error } = await client().rpc('create_invite');
  if (error) throw error;
  return z.string().parse(data);
}

export const validInvite = (code: string) => INVITE.test(code.trim().toUpperCase());

export async function joinHousehold(code: string): Promise<void> {
  const inviteCode = code.trim().toUpperCase();
  if (!INVITE.test(inviteCode)) throw new Error('invalid_invite');
  const { data, error } = await client().rpc('join_household', { invite_code: inviteCode });
  if (error) throw error;
  await adoptRemoteProfile(z.string().parse(data));
}

export async function deleteRemoteAccount(): Promise<void> {
  if (!(await signedIn())) return;
  const { error } = await client().functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
  await signOut();
}

export const appleCancelled = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_REQUEST_CANCELED';
