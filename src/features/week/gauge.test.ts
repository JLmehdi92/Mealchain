import { line, recipe } from '../planner/fixtures';
import type { WeekPlan } from '../planner/plan';
import { gaugeFor } from './gauge';

const recipes = [recipe('orzo', [line('heavy_cream', 10, 'cl')]), recipe('gratin', [line('heavy_cream', 10, 'cl')])];
const plan: WeekPlan = {
  slots: [{ day: 0, meal: 'dinner', recipeId: 'orzo' }, { day: 2, meal: 'dinner', recipeId: 'gratin' }],
  carries: [{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 100 }],
  score: 1,
};

describe('gaugeFor', () => {
  it('splits the pack between the meal that opened it and the meals it carries to', () => {
    expect(gaugeFor(plan, 1, recipes, 2)).toEqual({
      ingredientId: 'heavy_cream',
      fromSlot: 0,
      segments: [{ slot: 0, amount: 100 }, { slot: 1, amount: 100 }],
    });
  });

  it('is null for a meal that uses no carried pack', () => {
    expect(gaugeFor(plan, 0, recipes, 2)).toBeNull();
  });
});
