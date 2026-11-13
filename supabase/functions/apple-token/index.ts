import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { appleConfig, exchangeCode } from '../_shared/apple.ts';

const bodySchema = z.object({ code: z.string().min(1).max(2048) });

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

  const config = appleConfig((name) => Deno.env.get(name));
  if (!config) return json(200, { stored: false });

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return json(400, { error: 'invalid_body' });

  const appleSubject = data.user.identities?.find((identity) => identity.provider === 'apple')?.identity_data?.sub;
  const token = await exchangeCode(config, body.data.code).catch(() => null);
  if (!token || typeof appleSubject !== 'string' || token.subject !== appleSubject) return json(422, { error: 'invalid_code' });

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await admin.from('apple_tokens').upsert({ user_id: data.user.id, refresh_token: token.refreshToken });
  return error ? json(500, { error: 'store_failed' }) : json(200, { stored: true });
});
