import type { Allergen, Market } from '../ingredients/schema';
import { catalogIngredient } from '../planner/needs';
import type { Reason } from '../planner/filter';
import type { Recipe, RecipeIngredient } from './types';

export const THUMBS = ['carton', 'can', 'jar', 'eggs', 'bunch', 'bag', 'tray', 'block'] as const;
export type Thumb = (typeof THUMBS)[number];

const CONTAINER_THUMB: Record<string, Thumb> = {
  carton: 'carton', can: 'can', jar: 'jar', bottle: 'jar', tub: 'jar', bag: 'bag', bunch: 'bunch', tray: 'tray', block: 'block',
};
const REASON_ORDER: Reason['kind'][] = ['allergen', 'diet', 'equipment', 'time', 'unverified'];
const HEADER_FIELDS = new Set(['title', 'servings', 'totalMinutes']);

function thumbOf(line: RecipeIngredient, market: Market): Thumb | null {
  const ingredient = line.status === 'matched' ? catalogIngredient(line) : undefined;
  if (!ingredient) return null;
  if (ingredient.id === 'egg') return 'eggs';
  return CONTAINER_THUMB[ingredient.packs[market][0]?.container ?? ''] ?? null;
}

export const thumbFor = (recipe: Recipe, market: Market): Thumb | null =>
  recipe.ingredients.map((line) => thumbOf(line, market)).find((thumb) => thumb !== null) ?? null;

export const reviewCount = (recipe: Recipe): number =>
  recipe.needsReview.filter((field) => HEADER_FIELDS.has(field)).length +
  recipe.ingredients.filter((line) => line.status !== 'matched').length;

export const mainReason = (reasons: Reason[]): Reason | undefined =>
  [...reasons].sort((a, b) => REASON_ORDER.indexOf(a.kind) - REASON_ORDER.indexOf(b.kind))[0];

export function lineAllergens(line: RecipeIngredient): { contains: Allergen[]; mayContain: Allergen[] } {
  const ingredient = catalogIngredient(line);
  return { contains: ingredient?.allergens ?? [], mayContain: ingredient?.mayContain ?? [] };
}
