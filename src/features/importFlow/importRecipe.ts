import { importRemotely, readPage, remoteAvailable, type Fetched, type ImportError } from '@/lib/importApi';

import { buildRecipe } from '../import/buildRecipe';
import type { Recipe } from '../recipes/types';
import { splitText } from './splitText';

export type ImportInput = { kind: 'url'; url: string } | { kind: 'text'; text: string; source: 'caption' | 'screenshot' };
export type Outcome = { recipe: Recipe } | { error: ImportError };
type Options = {
  id: string;
  now: number;
  onStep: (step: number, ingredientCount: number) => void;
  askConsent: () => Promise<boolean>;
};

const MIN_TEXT = 10;
const MAX_TEXT = 20_000;

async function fromUrl(url: string): Promise<Fetched> {
  const local = await readPage(url);
  return 'recipe' in local || !remoteAvailable() ? local : importRemotely({ kind: 'url', url });
}

async function fromText(text: string, askConsent: Options['askConsent']): Promise<Fetched> {
  const local = splitText(text);
  if (local.ingredients.length > 0) return { recipe: local };
  const sendable = text.trim().length >= MIN_TEXT && text.length <= MAX_TEXT;
  if (!sendable || !remoteAvailable() || !(await askConsent())) return { error: 'no_recipe' };
  return importRemotely({ kind: 'text', text, consent: true });
}

export async function importRecipe(input: ImportInput, { id, now, onStep, askConsent }: Options): Promise<Outcome> {
  const fetched = input.kind === 'url' ? await fromUrl(input.url) : await fromText(input.text, askConsent);
  if ('error' in fetched) return fetched;
  const count = fetched.recipe.ingredients.length;
  onStep(2, count);
  const recipe = buildRecipe(fetched.recipe, input.kind === 'url' ? 'web' : input.source, id, now);
  onStep(3, count);
  return { recipe };
}
