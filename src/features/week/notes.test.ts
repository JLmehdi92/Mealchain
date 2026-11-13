import { household, line, recipe } from '../planner/fixtures';
import type { WeekPlan } from '../planner/plan';
import { allergySafe, fitCount, weekNotes } from './notes';

const plan = (ids: string[]): WeekPlan => ({ slots: ids.map((recipeId, day) => ({ day, meal: 'dinner', recipeId })), carries: [], score: 0 });

describe('weekNotes', () => {
  const curry = recipe('curry', [line('chicken_thigh', 500, 'g')], { title: 'Curry' });
  const cashew = recipe('cashew', [line('cashews', 100, 'g')], { title: 'Cashew chicken' });
  it('names recipes left out for a household allergy', () => {
    expect(weekNotes(plan(['curry']), [curry, cashew], household({ allergens: ['nuts'] })).allergyLeftOut).toEqual(['Cashew chicken']);
  });
  it('flags a plan that repeats a recipe', () => {
    expect(weekNotes(plan(['curry', 'curry']), [curry], household()).repeats).toBe(true);
    expect(weekNotes(plan(['curry']), [curry], household()).repeats).toBe(false);
  });
});

describe('fitCount', () => {
  const curry = recipe('curry', [line('chicken_thigh', 500, 'g')]);
  const cashew = recipe('cashew', [line('cashews', 100, 'g')]);
  it('counts only recipes that fit the household', () => {
    expect(fitCount([curry, cashew], household({ allergens: ['nuts'] }))).toBe(1);
    expect(fitCount([curry, cashew], household())).toBe(2);
  });
});

describe('allergySafe', () => {
  const curry = recipe('curry', [line('chicken_thigh', 500, 'g')]);
  const cashew = recipe('cashew', [line('cashews', 100, 'g')]);
  const unchecked = recipe('odd', [{ ...line('mystery', 1, 'g'), status: 'unmatched' }]);
  const nuts = household({ allergens: ['nuts'] });
  it('confirms a plan whose meals carry no household allergen', () => {
    expect(allergySafe(plan(['curry', 'curry']), [curry, cashew], nuts)).toBe(true);
  });
  it('is false when a planned meal contains a household allergen', () => {
    expect(allergySafe(plan(['curry', 'cashew']), [curry, cashew], nuts)).toBe(false);
  });
  it('is false when a planned meal has unchecked ingredients or is missing', () => {
    expect(allergySafe(plan(['odd']), [unchecked], nuts)).toBe(false);
    expect(allergySafe(plan(['gone']), [curry], nuts)).toBe(false);
  });
  it('is false without household allergies', () => {
    expect(allergySafe(plan(['curry']), [curry], household())).toBe(false);
  });
});
