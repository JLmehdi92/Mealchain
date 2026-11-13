import * as catalogModule from '../ingredients/catalog';
import { household, line, recipe } from './fixtures';
import type { WeekPlan } from './plan';
import { buildShoppingList } from './shopping';
import { buildContext, simulate, type Log } from './simulate';

const unmatched = { raw: 'a pinch of magic', qty: null, unit: null, ingredientId: null, status: 'unmatched' as const };
const recipes = [
  recipe('gratin', [line('heavy_cream', 10, 'cl'), line('egg', 2, 'piece')]),
  recipe('soup', [line('heavy_cream', 10, 'cl'), unmatched]),
  recipe('salad', [line('baby_spinach', 100, 'g'), line('egg', 2, 'piece')]),
];
const planOn = (days: number[], ...ids: string[]): WeekPlan => ({
  slots: ids.map((recipeId, i) => ({ day: days[i] ?? i, meal: 'dinner', recipeId })), carries: [], score: 0,
});
const planOf = (...ids: string[]) => planOn([], ...ids);
const carton = { amount: 200, container: 'carton' };

describe('buildShoppingList', () => {
  afterEach(() => jest.restoreAllMocks());

  it('aggregates the week, rounds to packs and sorts by aisle then ingredient', () => {
    expect(buildShoppingList(planOf('salad', 'gratin', 'soup'), recipes, household()).items).toEqual([
      { ingredientId: 'egg', aisle: 'dairy', need: 4, packs: [{ pack: { amount: 6, container: 'box' }, count: 1 }], leftover: 2, usedBy: [0, 1] },
      { ingredientId: 'heavy_cream', aisle: 'dairy', need: 200, packs: [{ pack: carton, count: 1 }], leftover: 0, usedBy: [1, 2] },
      { ingredientId: 'baby_spinach', aisle: 'produce', need: 100, packs: [{ pack: { amount: 125, container: 'bag' }, count: 1 }], leftover: 25, usedBy: [0] },
    ]);
  });

  it('buys exactly what the simulation buys, including again after a leftover expires', () => {
    const plan = planOn([0, 5], 'gratin', 'soup');
    const log: Log = { carries: [], purchases: [] };
    simulate(['gratin', 'soup'], buildContext(recipes, household(), [0, 5]), log);
    const cream = buildShoppingList(plan, recipes, household()).items.find((item) => item.ingredientId === 'heavy_cream');
    const bought = log.purchases.filter((p) => p.ingredientId === 'heavy_cream').flatMap((p) => p.items).reduce((sum, item) => sum + item.count, 0);
    expect(cream).toMatchObject({ need: 200, packs: [{ pack: carton, count: 2 }], leftover: 200 });
    expect(bought).toBe(2);
  });

  it('lists once per recipe the lines it could not count, to check by hand', () => {
    expect(buildShoppingList(planOf('soup', 'gratin', 'soup'), recipes, household()).unlisted).toEqual([
      { recipeId: 'soup', raw: 'a pinch of magic' },
    ]);
  });

  it('keeps the need of an ingredient without a usable pack, to check by hand', () => {
    jest.spyOn(catalogModule, 'packsFor').mockReturnValue([]);
    expect(buildShoppingList(planOf('gratin'), recipes, household()).items).toContainEqual(
      { ingredientId: 'heavy_cream', aisle: 'dairy', need: 100, packs: [], leftover: 0, usedBy: [0] },
    );
  });

  it('returns nothing for an empty plan', () => {
    expect(buildShoppingList(planOf(), recipes, household())).toEqual({ items: [], unlisted: [] });
  });
});
