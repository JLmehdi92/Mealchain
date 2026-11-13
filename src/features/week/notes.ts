import { checkRecipe } from '../planner/filter';
import type { WeekPlan } from '../planner/plan';
import type { Household, Recipe } from '../recipes/types';

export function weekNotes(plan: WeekPlan, recipes: Recipe[], household: Household) {
  const allergyLeftOut = recipes.filter((r) => checkRecipe(r, household).reasons.some((reason) => reason.kind === 'allergen')).map((r) => r.title);
  const ids = plan.slots.map((slot) => slot.recipeId);
  return { allergyLeftOut, repeats: new Set(ids).size < ids.length };
}

export const fitCount = (recipes: Recipe[], household: Household) => recipes.filter((r) => checkRecipe(r, household).allowed).length;

export function allergySafe(plan: WeekPlan, recipes: Recipe[], household: Household): boolean {
  if (household.allergens.length === 0) return false;
  return plan.slots.every((slot) => {
    const planned = recipes.find((r) => r.id === slot.recipeId);
    return !!planned && !checkRecipe(planned, household).reasons.some((r) => r.kind === 'allergen' || r.kind === 'unverified');
  });
}
