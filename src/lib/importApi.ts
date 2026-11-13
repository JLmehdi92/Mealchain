import { FunctionsHttpError } from '@supabase/supabase-js';
import { z } from 'zod';

import { extractRecipe, type RawRecipe } from '@/features/import/jsonld';

import { isAllowedUrl } from '../../supabase/functions/_shared/guards';
import { supabase } from './supabase';

export { isAllowedUrl };
export type ImportError = 'no_recipe' | 'unreachable' | 'daily_limit';
export type Fetched = { recipe: RawRecipe } | { error: ImportError };
type RemoteBody = { kind: 'url'; url: string } | { kind: 'text'; text: string; consent: true };

const MAX_BYTES = 3_000_000;
const TIMEOUT_MS = 10_000;
const line = z.string().max(500);

const responseSchema = z.object({
  recipe: z.object({
    title: line.optional(),
    servings: z.number().int().min(1).max(100).optional(),
    totalMinutes: z.number().int().min(1).max(10_080).optional(),
    ingredients: z.array(line).max(100),
    steps: z.array(line).max(100),
    imageUrl: z.string().max(2048).startsWith('https://').optional(),
    sourceUrl: z.string().max(2048),
  }),
});
const errorSchema = z.object({ error: z.enum(['no_recipe', 'unreachable']) });

export const remoteAvailable = () => supabase !== null;

async function readCapped(body: ReadableStream<Uint8Array> | null): Promise<string | null> {
  const reader = body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let html = '';
  let size = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    size += chunk.value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    html += decoder.decode(chunk.value, { stream: true });
  }
  return html + decoder.decode();
}

async function download(url: URL): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { headers: { accept: 'text/html' }, signal: controller.signal });
    if (!res.ok || !isAllowedUrl(res.url || url.toString())) return null;
    return await readCapped(res.body);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function readPage(raw: string): Promise<Fetched> {
  const url = isAllowedUrl(raw.trim());
  const html = url ? await download(url) : null;
  if (!url || html === null) return { error: 'unreachable' };
  const recipe = extractRecipe(html, url.toString());
  return recipe ? { recipe } : { error: 'no_recipe' };
}

async function reasonOf(error: unknown): Promise<ImportError> {
  if (!(error instanceof FunctionsHttpError) || !(error.context instanceof Response)) return 'unreachable';
  if (error.context.status === 429) return 'daily_limit';
  const body = errorSchema.safeParse(await error.context.json().catch(() => null));
  return body.success ? body.data.error : 'unreachable';
}

export async function importRemotely(body: RemoteBody): Promise<Fetched> {
  if (!supabase) return { error: 'unreachable' };
  const { data, error } = await supabase.functions.invoke('import-recipe', { body });
  if (error) return { error: await reasonOf(error) };
  const parsed = responseSchema.safeParse(data);
  return parsed.success ? { recipe: parsed.data.recipe } : { error: 'no_recipe' };
}
