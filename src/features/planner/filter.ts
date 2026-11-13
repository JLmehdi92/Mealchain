import type { Household, Recipe } from '../recipes/types';
import { catalogIngredient } from './needs';

export type Reason = { kind: 'allergen' | 'diet' | 'equipment' | 'time' | 'unverified'; detail: string };

function ingredientReasons(recipe: Recipe, household: Household): Reason[] {
  const strict = household.allergens.length > 0 || household.diets.length > 0;
  const unchecked = strict && (recipe.ingredients.length === 0 || recipe.needsReview.includes('ingredients'));
  const head: Reason[] = unchecked ? [{ kind: 'unverified', detail: 'ingredients' }] : [];
  return head.concat(recipe.ingredients.flatMap((line): Reason[] => {
    const ingredient = line.status === 'matched' ? catalogIngredient(line) : undefined;
    if (!ingredient) return strict ? [{ kind: 'unverified', detail: line.raw }] : [];
    const allergens = [...new Set([...ingredient.allergens, ...ingredient.mayContain])];
    return [
      ...allergens.filter((a) => household.allergens.includes(a)).map((a) => ({ kind: 'allergen' as const, detail: `${ingredient.id}:${a}` })),
      ...ingredient.notFor.filter((d) => household.diets.includes(d)).map((d) => ({ kind: 'diet' as const, detail: `${ingredient.id}:${d}` })),
    ];
  }));
}

export function checkRecipe(recipe: Recipe, household: Household): { allowed: boolean; reasons: Reason[] } {
  const reasons = ingredientReasons(recipe, household);
  for (const tool of recipe.equipment) {
    if (!household.equipment.includes(tool)) reasons.push({ kind: 'equipment', detail: tool });
  }
  const { totalMinutes } = recipe;
  if (totalMinutes !== null && household.maxMinutes !== null && totalMinutes > household.maxMinutes) {
    reasons.push({ kind: 'time', detail: `${totalMinutes}>${household.maxMinutes}` });
  }
  return { allowed: reasons.length === 0, reasons };
}
