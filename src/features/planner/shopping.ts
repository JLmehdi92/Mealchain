import { ingredientById } from '../ingredients/catalog';
import type { Pack, PackItem } from '../ingredients/packs';
import type { Household, Recipe } from '../recipes/types';
import type { WeekPlan } from './plan';
import { buildContext, compare, simulate, type Log } from './simulate';

export type ShoppingItem = { ingredientId: string; aisle: string; need: number; packs: PackItem[]; leftover: number; usedBy: number[] };
export type ShoppingList = { items: ShoppingItem[]; unlisted: { recipeId: string; raw: string }[] };
type Total = { need: number; usedBy: number[]; bought: Map<Pack, number> };

export function buildShoppingList(plan: WeekPlan, recipes: Recipe[], household: Household): ShoppingList {
  const ids = plan.slots.map((slot) => slot.recipeId);
  const context = buildContext(recipes, household, plan.slots.map((slot) => slot.day));
  const log: Log = { carries: [], purchases: [] };
  simulate(ids, context, log);
  const totals = new Map<string, Total>();
  ids.forEach((recipeId, index) => {
    for (const { ingredientId, amount } of context.needs.get(recipeId) ?? []) {
      const total: Total = totals.get(ingredientId) ?? { need: 0, usedBy: [], bought: new Map() };
      total.need += amount;
      if (!total.usedBy.includes(index)) total.usedBy.push(index);
      totals.set(ingredientId, total);
    }
  });
  for (const { ingredientId, items } of log.purchases) {
    const { bought } = totals.get(ingredientId) ?? { bought: new Map<Pack, number>() };
    for (const { pack, count } of items) bought.set(pack, (bought.get(pack) ?? 0) + count);
  }
  const items = [...totals].map(([ingredientId, { need, usedBy, bought }]) => {
    const packs = [...bought].map(([pack, count]) => ({ pack, count })).sort((a, b) => b.pack.amount - a.pack.amount);
    const total = packs.reduce((sum, { pack, count }) => sum + pack.amount * count, 0);
    const aisle = ingredientById.get(ingredientId)?.aisle ?? '';
    return { ingredientId, aisle, need, packs, leftover: Math.max(0, total - need), usedBy };
  }).sort((a, b) => compare(a.aisle, b.aisle) || compare(a.ingredientId, b.ingredientId));
  const unlisted = [...new Set(ids)].flatMap((recipeId) => (context.unlisted.get(recipeId) ?? []).map((raw) => ({ recipeId, raw })));
  return { items, unlisted };
}
