import { checkRecipe } from '../planner/filter';
import type { WeekPlan } from '../planner/plan';
import type { Household, Recipe } from '../recipes/types';

export function weekNotes(plan: WeekPlan, recipes: Recipe[], household: Household) {
  const allergyLeftOut = recipes.filter((r) => checkRecipe(r, household).reasons.some((reason) => reason.kind === 'allergen')).map((r) => r.title);
  const ids = plan.slots.map((slot) => slot.recipeId);
  return { allergyLeftOut, repeats: new Set(ids).size < ids.length };
}
