import type { Household, Recipe } from '../recipes/types';
import { allowedIds, toPlan, type WeekPlan } from './plan';
import { buildContext, compare, scoreOf, simulate } from './simulate';

export type Alternative = { recipeId: string; score: number; extraPacks: number };

const recipeIds = (plan: WeekPlan) => plan.slots.map((slot) => slot.recipeId);
const contextOf = (plan: WeekPlan, recipes: Recipe[], household: Household) =>
  buildContext(recipes, household, plan.slots.map((slot) => slot.day));

export function alternativesFor(plan: WeekPlan, slotIndex: number, recipes: Recipe[], household: Household): Alternative[] {
  const ids = recipeIds(plan);
  const current = ids[slotIndex];
  if (current === undefined) return [];
  const context = contextOf(plan, recipes, household);
  const basePacks = simulate(ids, context).packCount;
  return allowedIds(recipes, household)
    .filter((id) => id !== current)
    .map((recipeId) => {
      const next = ids.with(slotIndex, recipeId);
      const run = simulate(next, context);
      return { recipeId, score: scoreOf(next, context, run), extraPacks: run.packCount - basePacks };
    })
    .sort((a, b) => b.score - a.score || compare(a.recipeId, b.recipeId));
}

export function replaceSlot(plan: WeekPlan, slotIndex: number, recipeId: string, recipes: Recipe[], household: Household): WeekPlan {
  const ids = recipeIds(plan);
  if (ids[slotIndex] === undefined || !allowedIds(recipes, household).includes(recipeId)) return plan;
  return toPlan(plan.slots, ids.with(slotIndex, recipeId), contextOf(plan, recipes, household));
}

export const rescale = (plan: WeekPlan, recipes: Recipe[], household: Household): WeekPlan =>
  toPlan(plan.slots, recipeIds(plan), contextOf(plan, recipes, household));

export function unsafeSlots(plan: WeekPlan, recipes: Recipe[], household: Household): number[] {
  const allowed = new Set(allowedIds(recipes, household));
  return plan.slots.flatMap((slot, i) => (allowed.has(slot.recipeId) ? [] : [i]));
}
