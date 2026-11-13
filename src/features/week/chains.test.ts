import type { WeekPlan } from '../planner/plan';
import { chainsOf, dateOf, dayLabel, daysOf, rangeLabel, usesOf } from './chains';

const plan: WeekPlan = {
  slots: [
    { day: 0, meal: 'dinner', recipeId: 'orzo' },
    { day: 1, meal: 'lunch', recipeId: 'dal' },
    { day: 1, meal: 'dinner', recipeId: 'curry' },
    { day: 2, meal: 'dinner', recipeId: 'gratin' },
  ],
  carries: [
    { ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 3, amount: 50 },
    { ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 2, amount: 30 },
    { ingredientId: 'spinach', fromSlot: 2, toSlot: 3, amount: 40 },
  ],
  score: 1,
};

describe('chainsOf', () => {
  it('groups the carries of one opened pack', () => {
    expect(chainsOf(plan)).toEqual([
      { ingredientId: 'heavy_cream', fromSlot: 0, toSlots: [2, 3], amount: 80 },
      { ingredientId: 'spinach', fromSlot: 2, toSlots: [3], amount: 40 },
    ]);
  });
});

describe('usesOf', () => {
  it('lists the packs a meal opens and passes on', () => {
    expect(usesOf(plan, 0)).toEqual({ outgoing: [chainsOf(plan)[0]], incoming: [] });
  });

  it('marks the meal that finishes a pack', () => {
    const [cream, spinach] = chainsOf(plan);
    expect(usesOf(plan, 3).incoming).toEqual([{ chain: cream, finishes: true }, { chain: spinach, finishes: true }]);
    expect(usesOf(plan, 2)).toEqual({ outgoing: [spinach], incoming: [{ chain: cream, finishes: false }] });
  });
});

describe('daysOf', () => {
  it('groups slots by day in order', () => {
    expect(daysOf(plan)).toEqual([{ day: 0, slots: [0] }, { day: 1, slots: [1, 2] }, { day: 2, slots: [3] }]);
  });
});

describe('dates', () => {
  it('finds the date of a plan day', () => {
    expect(dateOf('2026-11-16', 2).getDate()).toBe(18);
  });

  it('names a plan day', () => {
    expect(dayLabel('2026-11-16', 2, 'en', 'short')).toBe('Wed');
    expect(dayLabel('2026-11-16', 2, 'fr', 'long')).toBe('mercredi');
  });

  it('writes a range within one month', () => {
    expect(rangeLabel('2026-11-16', 0, 4, 'en')).toBe('Nov 16–20');
    expect(rangeLabel('2026-11-16', 0, 4, 'fr')).toBe('16–20 nov.');
  });

  it('writes a range across two months', () => {
    expect(rangeLabel('2026-11-30', 0, 4, 'en')).toBe('Nov 30–Dec 4');
  });
});
