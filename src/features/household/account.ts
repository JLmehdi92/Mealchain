import { FunctionsHttpError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { z } from 'zod';

import { householdSchema } from '@/lib/db/schemas';
import { getSetting, setSetting } from '@/lib/db/repo';
import { report } from '@/lib/monitoring';
import { getState } from '@/lib/store';
import { supabase } from '@/lib/supabase';

import type { Household } from '../recipes/types';
import { linkPurchases, unlinkPurchases } from '../subscription/purchase';
import { adoptMerged } from './profileSync';
import { applyHousehold } from './save';
import { wipeAll } from './wipe';

export const accountAvailable = !!supabase;
const INVITE = /^[0-9A-HJKMNP-TV-Z]{12}$/;
const normalizeInvite = (code: string) => code.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');

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
  if (profile.success) await adoptMerged(profile.data);
}

async function syncProfile(household: Household) {
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
  syncProfile(household).catch((error: unknown) => {
    report(error);
    return setSetting('profile_sync_pending', 'yes');
  }).catch(report);
}

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
  if (!credential.identityToken) throw new Error('no_identity_token');
  const { data: session, error } = await client().auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
  if (error) throw error;
  if (session.user) linkPurchases(session.user.id).catch(report);
  if (credential.authorizationCode) {
    client().functions.invoke('apple-token', { body: { code: credential.authorizationCode } }).catch(report);
  }
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
  unlinkPurchases().catch(report);
  const { error } = await client().auth.signOut();
  if (error) throw error;
}

export async function createInvite(): Promise<string> {
  const target = (await getSetting('remote_household')) || null;
  const { data, error } = await client().rpc('create_invite', { target });
  if (error) throw error;
  return z.string().parse(data);
}

export const validInvite = (code: string) => INVITE.test(normalizeInvite(code));

export async function joinHousehold(code: string): Promise<void> {
  const inviteCode = normalizeInvite(code);
  if (!INVITE.test(inviteCode)) throw new Error('invalid_invite');
  const { data, error } = await client().rpc('join_household', { invite_code: inviteCode });
  if (error) throw error;
  if (data === null) throw new Error('invalid_invite');
  await adoptRemoteProfile(z.string().parse(data));
}

async function alreadyDeleted(error: unknown): Promise<boolean> {
  if (!(error instanceof FunctionsHttpError) || !(error.context instanceof Response) || error.context.status !== 401) return false;
  const { data, error: userError } = await client().auth.getUser();
  return !!userError || !data.user;
}

export async function deleteAccount(): Promise<void> {
  if (await signedIn()) {
    const { error } = await client().functions.invoke('delete-account', { method: 'POST' });
    if (error && !(await alreadyDeleted(error))) throw error;
  }
  try {
    const result = await supabase?.auth.signOut({ scope: 'local' });
    if (result?.error) report(result.error);
  } finally {
    unlinkPurchases().catch(report);
    wipeAll();
  }
}

export const appleCancelled = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_REQUEST_CANCELED';
