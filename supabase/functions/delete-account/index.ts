import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data } = await asUser.auth.getUser();
  if (!data.user) return json(401, { error: 'unauthorized' });

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: owned } = await admin.from('household_members').select('household_id').eq('user_id', data.user.id).eq('role', 'owner');
  for (const row of owned ?? []) {
    const { count } = await admin.from('household_members').select('*', { count: 'exact', head: true }).eq('household_id', row.household_id);
    if ((count ?? 0) <= 1) await admin.from('households').delete().eq('id', row.household_id);
  }
  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  return error ? json(500, { error: 'delete_failed' }) : json(200, { deleted: true });
});
