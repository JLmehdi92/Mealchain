import { SEASONING_AISLES } from '../src/features/import/buildRecipe';
import { ingredientById } from '../src/features/ingredients/catalog';
import { toBase } from '../src/features/ingredients/units';
import { buildSample, type SampleSource } from '../src/features/recipes/samples';
import type { Recipe } from '../src/features/recipes/types';

export type Candidate = SampleSource;
export type Sample = Candidate & { confirmed: string[] };

const NOT_A_MAIN =
  /\b(?:sauces?|salsa|dips?|dressing|vinaigrette|marinade|rub|desserts?|cakes?|cookies?|brownies?|muffins?|pudding|drinks?|smoothie|cocktail|punch|salads?|breads?|salades?|gâteaux?|biscuits?|boissons?|glaces?|confitures?)\b/i;
const RARE_EQUIPMENT = new Set(['air_fryer', 'grill']);
const LEFTOVER_MARKUP = /&#?\w+;|[{}[\]]/;
const PERISHABLE_AISLES = new Set(['produce', 'dairy', 'meat', 'fish']);
const MAX_MINUTES = 60;
const MIN_LINES = 4;

const toRecipe = buildSample;

function lineIsSafe(line: Recipe['ingredients'][number], reviewed: ReadonlySet<string>): boolean {
  if (line.status === 'matched') return true;
  const ingredient = ingredientById.get(line.ingredientId ?? '');
  if (line.status !== 'needsReview' || !ingredient || !reviewed.has(line.raw)) return false;
  if (line.qty === null || line.unit === null) return SEASONING_AISLES.has(ingredient.aisle);
  return toBase(line.qty, line.unit, ingredient) !== null;
}

export function eligible(c: Candidate, reviewed: ReadonlySet<string>): Sample | null {
  const recipe = toRecipe(c);
  const text = [c.title, ...c.ingredients, ...c.steps].join('\n');
  const ok =
    recipe.ingredients.length >= MIN_LINES &&
    recipe.steps.length > 0 &&
    !NOT_A_MAIN.test(c.title) &&
    (c.totalMinutes === null || c.totalMinutes <= MAX_MINUTES) &&
    !recipe.equipment.some((tool) => RARE_EQUIPMENT.has(tool)) &&
    !LEFTOVER_MARKUP.test(text) &&
    recipe.ingredients.every((line) => lineIsSafe(line, reviewed));
  if (!ok) return null;
  const confirmed = recipe.ingredients.filter((line) => line.status === 'needsReview').map((line) => line.raw);
  return { ...c, confirmed };
}

const perishables = (c: Candidate): Set<string> =>
  new Set(toRecipe(c).ingredients.flatMap((l) => (PERISHABLE_AISLES.has(ingredientById.get(l.ingredientId ?? '')?.aisle ?? '') ? [l.ingredientId ?? ''] : [])));

export function proteinOf(c: Candidate): string {
  const proteins = toRecipe(c).ingredients.map((l) => ingredientById.get(l.ingredientId ?? '')?.protein).filter((p) => p !== undefined);
  return proteins.find((p) => p !== 'cheese' && p !== 'egg') ?? proteins[0] ?? 'vegetarian';
}

export function pickGreedy(pool: Sample[], target: number): Sample[] {
  const fresh = new Map(pool.map((s) => [s, perishables(s)]));
  const picked: Sample[] = [];
  const shared = (s: Sample) => [...(fresh.get(s) ?? [])].filter((id) => picked.some((p) => fresh.get(p)?.has(id))).length;
  const newProtein = (s: Sample) => (picked.some((p) => proteinOf(p) === proteinOf(s)) ? 0 : 1);
  while (picked.length < Math.min(target, pool.length)) {
    const rest = pool.filter((s) => !picked.includes(s));
    const score = (s: Sample) => newProtein(s) * 1000 + shared(s);
    picked.push(rest.reduce((best, s) => (score(s) > score(best) ? s : best)));
  }
  return picked;
}

export const selectSamples = (candidates: Candidate[], reviewed: ReadonlySet<string>, target: number): Sample[] =>
  pickGreedy(candidates.map((c) => eligible(c, reviewed)).filter((s) => s !== null), target);
