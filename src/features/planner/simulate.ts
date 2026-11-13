import { ingredientById, packsFor } from '../ingredients/catalog';
import { roundToPacks, type Pack, type PackItem } from '../ingredients/packs';
import type { Ingredient } from '../ingredients/schema';
import type { Household, Recipe } from '../recipes/types';
import { catalogIngredient, recipeNeeds } from './needs';

export type Carry = { ingredientId: string; fromSlot: number; toSlot: number; amount: number };
export type Bought = { ingredientId: string; slot: number; items: PackItem[] };
export type Log = { carries: Carry[]; purchases: Bought[] };
type Purchase = { leftover: number; packCount: number; items: PackItem[] };
type Stock = { packs: Pack[]; unit: number; shelfLife: number | undefined; rounding: Map<number, Purchase | null>; left: number; from: number };
export type Need = { ingredientId: string; amount: number; stock: Stock };
export type Context = {
  needs: Map<string, Need[]>;
  proteins: Map<string, string | undefined>;
  unlisted: Map<string, string[]>;
  days: number[];
  stocks: Stock[];
};
type Run = { carried: number; waste: number; packCount: number };

const SAME_PROTEIN_PENALTY = 0.5;
const REPEAT_PENALTY = 5;
const TINY = 1e-6;
const MAX_CARRY_DAYS: Partial<Record<Ingredient['aisle'], number>> = { meat: 2, fish: 2, dairy: 4, produce: 4, bakery: 3 };

export const compare = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

const mainProtein = (recipe: Recipe) => recipe.ingredients.map((line) => catalogIngredient(line)?.protein).find(Boolean);

export function buildContext(recipes: Recipe[], household: Household, days: number[]): Context {
  const context: Context = { needs: new Map(), proteins: new Map(), unlisted: new Map(), days, stocks: [] };
  const stocks = new Map<string, Stock>();
  const stockOf = (ingredient: Ingredient) => {
    if (!stocks.has(ingredient.id)) {
      const packs = packsFor(ingredient, household.market);
      const unit = Math.min(...packs.map((pack) => pack.amount));
      const stock: Stock = { packs, unit, shelfLife: MAX_CARRY_DAYS[ingredient.aisle], rounding: new Map(), left: 0, from: 0 };
      stocks.set(ingredient.id, stock);
      context.stocks.push(stock);
    }
    return stocks.get(ingredient.id);
  };
  for (const recipe of new Map(recipes.map((r) => [r.id, r])).values()) {
    const { needs, unlisted } = recipeNeeds(recipe, household.people);
    context.needs.set(recipe.id, [...needs].sort(([a], [b]) => compare(a, b)).flatMap(([ingredientId, amount]) => {
      const ingredient = ingredientById.get(ingredientId);
      const stock = ingredient && stockOf(ingredient);
      return stock ? [{ ingredientId, amount, stock }] : [];
    }));
    context.proteins.set(recipe.id, mainProtein(recipe));
    context.unlisted.set(recipe.id, unlisted);
  }
  return context;
}

function purchase(stock: Stock, need: number): Purchase | null {
  if (!stock.rounding.has(need)) {
    const choice = roundToPacks(need, stock.packs);
    const packCount = choice?.items.reduce((sum, item) => sum + item.count, 0) ?? 0;
    stock.rounding.set(need, choice && { leftover: choice.leftover, packCount, items: choice.items });
  }
  return stock.rounding.get(need) ?? null;
}

function use({ ingredientId, amount, stock }: Need, slot: number, context: Context, run: Run, log?: Log) {
  const fresh = stock.shelfLife !== undefined;
  const day = context.days[slot] ?? slot;
  if (stock.shelfLife !== undefined && day - (context.days[stock.from] ?? stock.from) > stock.shelfLife) {
    run.waste += stock.left / stock.unit;
    stock.left = 0;
  }
  const take = stock.left > TINY ? Math.min(stock.left, amount) : 0;
  if (take > 0) {
    stock.left = stock.left - take > TINY ? stock.left - take : 0;
    if (fresh) {
      run.carried += take / stock.unit;
      log?.carries.push({ ingredientId, fromSlot: stock.from, toSlot: slot, amount: take });
    }
  }
  const bought = amount - take > TINY ? purchase(stock, amount - take) : null;
  if (!bought) return;
  if (fresh) run.packCount += bought.packCount;
  log?.purchases.push({ ingredientId, slot, items: bought.items });
  stock.left = bought.leftover;
  stock.from = slot;
}

export function simulate(ids: string[], context: Context, log?: Log): Run {
  const run = { carried: 0, waste: 0, packCount: 0 };
  for (const stock of context.stocks) stock.left = 0;
  ids.forEach((recipeId, slot) => {
    for (const need of context.needs.get(recipeId) ?? []) use(need, slot, context, run, log);
  });
  for (const stock of context.stocks) if (stock.shelfLife !== undefined) run.waste += stock.left / stock.unit;
  return run;
}

function sameProteinPairs(ids: string[], context: Context): number {
  let pairs = 0;
  ids.forEach((id, i) => {
    const protein = context.proteins.get(id);
    if (i > 0 && protein !== undefined && protein === context.proteins.get(ids[i - 1] ?? '')) pairs += 1;
  });
  return pairs;
}

export function scoreOf(ids: string[], context: Context, run = simulate(ids, context)): number {
  const repeats = ids.length - new Set(ids).size;
  return run.carried - run.waste - SAME_PROTEIN_PENALTY * sameProteinPairs(ids, context) - REPEAT_PENALTY * repeats;
}
