import { ALLERGENS, type Allergen } from '../ingredients/schema';
import { lineAllergens } from '../recipes/meta';
import type { Recipe, ReviewField } from '../recipes/types';

export function finalize(draft: Recipe): Recipe {
  const title = draft.title.trim();
  const missing: [ReviewField, boolean][] = [
    ['title', title === ''],
    ['servings', draft.servings === null],
    ['totalMinutes', draft.totalMinutes === null],
    ['ingredients', draft.ingredients.length === 0 || draft.ingredients.some((line) => line.status !== 'matched')],
    ['steps', draft.steps.length === 0],
  ];
  return { ...draft, title, needsReview: missing.filter(([, isMissing]) => isMissing).map(([field]) => field) };
}

export function confirmIngredient(draft: Recipe, index: number, ingredientId: string): Recipe {
  const line = draft.ingredients[index];
  if (!line) return draft;
  return finalize({ ...draft, ingredients: draft.ingredients.with(index, { ...line, ingredientId, status: 'matched' }) });
}

export const confirmAll = (draft: Recipe): Recipe =>
  finalize({ ...draft, ingredients: draft.ingredients.map((line) => (line.status === 'needsReview' && line.ingredientId ? { ...line, status: 'matched' } : line)) });

export function recipeAllergens(recipe: Recipe): Allergen[] {
  const found = new Set(recipe.ingredients.flatMap((line) => {
    const { contains, mayContain } = lineAllergens(line);
    return [...contains, ...mayContain];
  }));
  return ALLERGENS.filter((allergen) => found.has(allergen));
}

export function parseCount(text: string, max: number): number | null {
  const value = Number(text.trim());
  return /^\d+$/.test(text.trim()) && value >= 1 && value <= max ? value : null;
}

export const uncheckedCount = (recipe: Recipe): number => recipe.ingredients.filter((line) => line.status !== 'matched').length;

type ReviewNames = { title: string; servings: string; totalMinutes: string; lines: (count: number) => string };
const HEADER: ('title' | 'servings' | 'totalMinutes')[] = ['title', 'servings', 'totalMinutes'];

export function reviewList(recipe: Recipe, names: ReviewNames): string {
  const fields = HEADER.filter((field) => recipe.needsReview.includes(field)).map((field) => names[field]);
  const lines = uncheckedCount(recipe);
  return [...fields, ...(lines > 0 ? [names.lines(lines)] : [])].join(', ');
}
