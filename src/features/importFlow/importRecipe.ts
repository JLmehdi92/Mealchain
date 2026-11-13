import { importRemotely, readPage, remoteAvailable, type Fetched, type ImportError } from '@/lib/importApi';

import { buildRecipe } from '../import/buildRecipe';
import type { Recipe } from '../recipes/types';
import { splitText } from './splitText';

export type ImportInput = { kind: 'url'; url: string } | { kind: 'text'; text: string; source: 'caption' | 'screenshot' };
export type ImportFailure = ImportError | 'sign_in';
export type Outcome = { recipe: Recipe } | { error: ImportFailure } | { cancelled: true };
type Options = {
  id: string;
  now: number;
  onStep: (step: number, ingredientCount: number) => void;
  askConsent: () => Promise<boolean>;
  rememberConsent: () => Promise<void>;
  signedIn: () => Promise<boolean>;
  isCancelled: () => boolean;
};
type Fetch = Fetched | { error: 'sign_in' } | { cancelled: true };

const MIN_TEXT = 10;
const MAX_TEXT = 20_000;
const CANCELLED = { cancelled: true } as const;

async function fromUrl(url: string, { isCancelled }: Options): Promise<Fetch> {
  const local = await readPage(url);
  if ('recipe' in local || !remoteAvailable()) return local;
  return isCancelled() ? CANCELLED : importRemotely({ kind: 'url', url });
}

async function fromText(text: string, { askConsent, rememberConsent, signedIn, isCancelled }: Options): Promise<Fetch> {
  const local = splitText(text);
  if (local.ingredients.length > 0) return { recipe: local };
  const sendable = text.trim().length >= MIN_TEXT && text.length <= MAX_TEXT;
  if (!sendable || !remoteAvailable()) return { error: 'no_recipe' };
  if (isCancelled()) return CANCELLED;
  if (!(await signedIn())) return { error: 'sign_in' };
  if (isCancelled()) return CANCELLED;
  if (!(await askConsent())) return { error: 'no_recipe' };
  if (isCancelled()) return CANCELLED;
  const remote = await importRemotely({ kind: 'text', text, consent: true });
  await rememberConsent();
  return remote;
}

export async function importRecipe(input: ImportInput, options: Options): Promise<Outcome> {
  const fetched = input.kind === 'url' ? await fromUrl(input.url, options) : await fromText(input.text, options);
  if (!('recipe' in fetched)) return fetched;
  const count = fetched.recipe.ingredients.length;
  options.onStep(2, count);
  const recipe = buildRecipe(fetched.recipe, input.kind === 'url' ? 'web' : input.source, options.id, options.now);
  options.onStep(3, count);
  return { recipe };
}
