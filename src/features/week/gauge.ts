import { recipeNeeds } from '../planner/needs';
import type { WeekPlan } from '../planner/plan';
import type { Recipe } from '../recipes/types';
import { usesOf } from './chains';

export type Gauge = { ingredientId: string; fromSlot: number; segments: { slot: number; amount: number }[] };

export function gaugeFor(plan: WeekPlan, slot: number, recipes: Recipe[], people: number): Gauge | null {
  const chain = usesOf(plan, slot).incoming[0]?.chain;
  if (!chain) return null;
  const opener = recipes.find((recipe) => recipe.id === plan.slots[chain.fromSlot]?.recipeId);
  const opened = opener ? (recipeNeeds(opener, people).needs.get(chain.ingredientId) ?? 0) : 0;
  const carried = plan.carries
    .filter((carry) => carry.ingredientId === chain.ingredientId && carry.fromSlot === chain.fromSlot)
    .sort((a, b) => a.toSlot - b.toSlot)
    .map((carry) => ({ slot: carry.toSlot, amount: carry.amount }));
  return { ingredientId: chain.ingredientId, fromSlot: chain.fromSlot, segments: [{ slot: chain.fromSlot, amount: opened }, ...carried] };
}
