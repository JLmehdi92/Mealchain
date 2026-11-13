import { household, line, recipe } from '../planner/fixtures';
import type { WeekPlan } from '../planner/plan';
import { weekNotes } from './notes';

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
