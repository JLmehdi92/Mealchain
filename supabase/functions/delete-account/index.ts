import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { appleConfig, revokeToken } from '../_shared/apple.ts';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

async function revokeApple(admin: SupabaseClient, userId: string): Promise<boolean> {
  const config = appleConfig((name) => Deno.env.get(name));
  if (!config) return true;
  const { data, error } = await admin.from('apple_tokens').select('refresh_token').eq('user_id', userId).maybeSingle();
  if (error) return false;
  return !data || (await revokeToken(config, data.refresh_token).catch(() => false));
}

async function deleteSubscriber(userId: string): Promise<boolean> {
  const key = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!key) return true;
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return !!res && (res.ok || res.status === 404);
}

// Every step runs before deleteUser and is safe to repeat, so a failure returns an error the app
// can retry instead of leaving an orphaned household, Apple grant or subscriber behind.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data } = await asUser.auth.getUser();
  if (!data.user) return json(401, { error: 'unauthorized' });
  const userId = data.user.id;

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error: releaseError } = await admin.rpc('release_households', { target: userId });
  if (releaseError) return json(500, { error: 'household_cleanup_failed' });
  if (!(await revokeApple(admin, userId))) return json(502, { error: 'apple_revoke_failed' });
  if (!(await deleteSubscriber(userId))) return json(502, { error: 'subscription_cleanup_failed' });

  const { error } = await admin.auth.admin.deleteUser(userId);
  return error ? json(500, { error: 'delete_failed' }) : json(200, { deleted: true });
});
