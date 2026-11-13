import Anthropic from 'npm:@anthropic-ai/sdk@0.71';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk@0.71/helpers/zod';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { extractRecipe } from '../../../src/features/import/jsonld.ts';
import { isAllowedUrl, isPrivateAddress, keepVerbatim } from '../_shared/guards.ts';

const DAILY_LIMIT = 50;
const MAX_BYTES = 3_000_000;
const MAX_REDIRECTS = 3;

const bodySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('url'), url: z.string().max(2048) }),
  z.object({ kind: z.literal('text'), text: z.string().min(10).max(20_000), consent: z.literal(true) }),
]);

const extractedSchema = z.object({
  title: z.string().optional(),
  servings: z.number().int().positive().optional(),
  totalMinutes: z.number().int().positive().optional(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

async function resolvesPublic(host: string): Promise<boolean> {
  const records = await Promise.all([Deno.resolveDns(host, 'A').catch(() => []), Deno.resolveDns(host, 'AAAA').catch(() => [])]);
  const ips = records.flat();
  return ips.length > 0 && !ips.some(isPrivateAddress);
}

async function readCapped(body: ReadableStream<Uint8Array>): Promise<string | null> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let r = await reader.read(); !r.done; r = await reader.read()) {
    size += r.value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(r.value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(all);
}

async function fetchPage(raw: string): Promise<string | null> {
  let target = isAllowedUrl(raw);
  for (let hop = 0; target && hop <= MAX_REDIRECTS; hop += 1) {
    if (!(await resolvesPublic(target.hostname))) return null;
    const res = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { accept: 'text/html' } });
    if (res.status >= 300 && res.status < 400) {
      target = isAllowedUrl(new URL(res.headers.get('location') ?? '', target).toString());
      continue;
    }
    return res.ok && res.body ? readCapped(res.body) : null;
  }
  return null;
}

function extractSafely(html: string, url: string) {
  try {
    return extractRecipe(html, url);
  } catch {
    return null;
  }
}

async function readText(text: string) {
  const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
  const response = await client.messages.parse({
    model: 'claude-haiku-5-5',
    max_tokens: 4000,
    output_config: { format: zodOutputFormat(extractedSchema) },
    system: 'You sort a recipe the user pasted into fields. Copy every line exactly as written, character for character. Never rephrase, translate, complete, correct or add anything. Leave a field out when the text does not contain it.',
    messages: [{ role: 'user', content: text }],
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) return null;
  return keepVerbatim(response.parsed_output, text);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return json(401, { error: 'unauthorized' });

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return json(400, { error: 'invalid_body' });

  const { data: used, error } = await supabase.rpc('bump_import_usage');
  if (error) return json(500, { error: 'usage_unavailable' });
  if (used > DAILY_LIMIT) return json(429, { error: 'daily_limit', limit: DAILY_LIMIT });

  if (body.data.kind === 'url') {
    const html = await fetchPage(body.data.url).catch(() => null);
    if (html === null) return json(422, { error: 'unreachable' });
    const recipe = extractSafely(html, body.data.url);
    return recipe ? json(200, { recipe }) : json(422, { error: 'no_recipe' });
  }

  const extracted = await readText(body.data.text).catch(() => null);
  if (!extracted || extracted.ingredients.length === 0) return json(422, { error: 'no_recipe' });
  return json(200, { recipe: { ...extracted, sourceUrl: '' } });
});
