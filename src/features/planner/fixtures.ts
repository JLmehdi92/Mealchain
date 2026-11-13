import type { RecipeUnit } from '../ingredients/units';
import type { Household, Recipe, RecipeIngredient } from '../recipes/types';

export const line = (ingredientId: string, qty: number | null, unit: RecipeUnit | null): RecipeIngredient => ({
  raw: `${qty ?? ''} ${unit ?? ''} ${ingredientId}`, qty, unit, ingredientId, status: 'matched',
});

export const recipe = (id: string, ingredients: RecipeIngredient[], extra: Partial<Recipe> = {}): Recipe => ({
  id, title: id, servings: 2, totalMinutes: 30, equipment: [], ingredients, steps: [], source: 'web',
  sourceUrl: null, imageUrl: null, needsReview: [], createdAt: 0, ...extra,
});

export const household = (extra: Partial<Household> = {}): Household => ({
  people: 2, allergens: [], diets: [], equipment: ['oven', 'stovetop'], dinners: 2, lunches: 0,
  maxMinutes: null, market: 'fr', ...extra,
});
