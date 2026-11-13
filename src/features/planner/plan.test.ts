import { catalog } from '../ingredients/catalog';
import { household, line, recipe } from './fixtures';
import { planWeek } from './plan';

const gratin = recipe('a_gratin', [line('heavy_cream', 10, 'cl')]);
const soup = recipe('b_soup', [line('heavy_cream', 10, 'cl')]);
const salad = recipe('c_salad', [line('baby_spinach', 100, 'g')]);
const quiche = recipe('d_quiche', [line('heavy_cream', 15, 'cl')]);
const chickenA = recipe('chicken_a', [line('chicken_breast', 400, 'g')]);
const chickenB = recipe('chicken_b', [line('chicken_breast', 400, 'g')]);
const fish = recipe('fish', [line('salmon_fillet', 2, 'piece')]);

const ids = (plan: ReturnType<typeof planWeek>) => plan.slots.map((slot) => slot.recipeId);

describe('planWeek', () => {
  it('pairs two recipes that each use half a cream carton so nothing is wasted', () => {
    const plan = planWeek([salad, quiche, gratin, soup], household());
    expect([...ids(plan)].sort()).toEqual(['a_gratin', 'b_soup']);
    expect(plan.carries).toEqual([{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 100 }]);
    expect(plan.score).toBeCloseTo(0.5);
  });

  it('ignores pantry staples when pairing perishables', () => {
    const oily = recipe('a_gratin', [line('heavy_cream', 10, 'cl'), line('olive_oil', 2, 'tbsp')]);
    const plan = planWeek([salad, quiche, oily, soup], household());
    expect([...ids(plan)].sort()).toEqual(['a_gratin', 'b_soup']);
    expect(plan.carries).toEqual([{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 100 }]);
    expect(plan.score).toBeCloseTo(0.5);
  });

  it('avoids the same main protein on consecutive slots', () => {
    expect(ids(planWeek([chickenA, chickenB, fish], household({ dinners: 3 })))).toEqual(['chicken_a', 'fish', 'chicken_b']);
  });

  it('never repeats a recipe while others are available', () => {
    expect(new Set(ids(planWeek([gratin, salad, fish], household({ dinners: 3 })))).size).toBe(3);
  });

  it('repeats recipes only when there are fewer allowed recipes than slots', () => {
    expect(ids(planWeek([fish], household({ dinners: 3 })))).toEqual(['fish', 'fish', 'fish']);
  });

  it('only plans allowed recipes', () => {
    expect(ids(planWeek([gratin, soup, fish], household({ diets: ['vegan'], dinners: 1 })))).toEqual([]);
    expect(ids(planWeek([gratin, fish], household({ allergens: ['milk'], dinners: 1 })))).toEqual(['fish']);
  });

  it('refuses a recipe id when any recipe carrying it is forbidden', () => {
    const unsafeTwin = recipe('fish', [line('egg', 2, 'piece')]);
    expect(ids(planWeek([fish, unsafeTwin], household({ allergens: ['eggs'], dinners: 1 })))).toEqual([]);
  });

  it('lays out lunches before dinners each day, within a week', () => {
    const plan = planWeek([gratin, salad, fish], household({ lunches: 1, dinners: 9 }));
    expect(plan.slots.slice(0, 3).map(({ day, meal }) => [day, meal])).toEqual([[0, 'lunch'], [0, 'dinner'], [1, 'dinner']]);
    expect(plan.slots).toHaveLength(8);
  });

  it('is deterministic whatever the input order', () => {
    const recipes = [salad, quiche, gratin, soup, chickenA, chickenB, fish];
    const h = household({ dinners: 5, lunches: 2 });
    expect(planWeek([...recipes].reverse(), h)).toEqual(planWeek(recipes, h));
  });

  it('returns an empty plan for empty or impossible input', () => {
    const empty = { slots: [], carries: [], score: 0 };
    expect(planWeek([], household())).toEqual(empty);
    expect(planWeek([gratin], household({ dinners: 0 }))).toEqual(empty);
  });

  it('plans 300 recipes of 8 ingredients over 14 slots in under 600 ms', () => {
    const many = Array.from({ length: 300 }, (_, r) => recipe(`r${r}`, Array.from({ length: 8 }, (_, k) => {
      const ingredient = catalog[(r * 37 + k * 101) % catalog.length]!;
      return line(ingredient.id, ingredient.baseUnit === 'piece' ? 1 + (k % 3) : 50 + 30 * ((r + k) % 5), ingredient.baseUnit);
    })));
    const start = performance.now();
    const plan = planWeek(many, household({ dinners: 7, lunches: 7 }));
    expect(performance.now() - start).toBeLessThan(600);
    expect(plan.slots).toHaveLength(14);
  });
});
