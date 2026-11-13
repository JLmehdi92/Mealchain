import { household, line, recipe } from './fixtures';
import { planWeek } from './plan';
import { alternativesFor, replaceSlot, unsafeSlots } from './swap';

const recipes = [
  recipe('a_gratin', [line('heavy_cream', 10, 'cl')]),
  recipe('b_soup', [line('heavy_cream', 10, 'cl')]),
  recipe('c_salad', [line('baby_spinach', 100, 'g')]),
  recipe('d_quiche', [line('heavy_cream', 15, 'cl')]),
  recipe('e_long', [line('egg', 6, 'piece')], { totalMinutes: 120 }),
];
const h = household({ maxMinutes: 60 });
const plan = planWeek(recipes, h);

describe('alternativesFor', () => {
  it('ranks allowed replacements best first, without the current recipe', () => {
    const current = plan.slots[1]?.recipeId;
    const other = plan.slots[0]?.recipeId;
    const alternatives = alternativesFor(plan, 1, recipes, h);
    expect(alternatives.map((a) => a.recipeId)).toEqual(['d_quiche', 'c_salad', other]);
    expect(alternatives.map((a) => a.recipeId)).not.toContain(current);
    expect(alternatives.map((a) => a.extraPacks)).toEqual([1, 1, 0]);
    expect(alternatives[0]?.score).toBeCloseTo(-0.25);
  });

  it('returns nothing for a slot outside the plan', () => {
    expect(alternativesFor(plan, 5, recipes, h)).toEqual([]);
  });
});

describe('replaceSlot', () => {
  it('recomputes carries and score', () => {
    const next = replaceSlot(plan, 1, 'd_quiche', recipes, h);
    expect(next.slots[1]).toEqual({ ...plan.slots[1], recipeId: 'd_quiche' });
    expect(next.carries).toEqual([{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 100 }]);
    expect(next.score).toBeCloseTo(-0.25);
  });

  it('keeps the plan for a forbidden or unknown recipe, or a slot outside the plan', () => {
    expect(replaceSlot(plan, 1, 'e_long', recipes, h)).toBe(plan);
    expect(replaceSlot(plan, 1, 'nope', recipes, h)).toBe(plan);
    expect(replaceSlot(plan, -1, 'c_salad', recipes, h)).toBe(plan);
  });
});

describe('unsafeSlots', () => {
  it('lists the slots whose recipe no longer passes the household rules', () => {
    expect(unsafeSlots(plan, recipes, h)).toEqual([]);
    expect(unsafeSlots(plan, recipes, { ...h, allergens: ['milk'] })).toEqual([0, 1]);
    expect(unsafeSlots(replaceSlot(plan, 1, 'c_salad', recipes, h), recipes, { ...h, allergens: ['milk'] })).toEqual([0]);
    expect(unsafeSlots(plan, recipes.slice(2), h)).toEqual([0, 1]);
  });
});
