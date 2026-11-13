import type { WeekPlan } from '@/features/planner/plan';

import { amountOf, pillsFor } from './pills';

describe('amountOf', () => {
  it('shows a leftover worth carrying', () => {
    expect(amountOf('heavy_cream', 120, 'us')).not.toBe('');
  });
  it('hides a crumb under a tenth of a typical pack', () => {
    expect(amountOf('cherry_tomato', 3, 'us')).toBe('');
  });
});

describe('amountOf for counted items', () => {
  it('still shows two garlic cloves', () => {
    expect(amountOf('garlic', 2, 'us')).not.toBe('');
  });
});

describe('pillsFor', () => {
  it('capitalizes the ingredient name on outgoing leftovers', () => {
    const plan: WeekPlan = {
      slots: [
        { day: 0, meal: 'dinner', recipeId: 'a' },
        { day: 1, meal: 'dinner', recipeId: 'b' },
      ],
      carries: [{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 120 }],
      score: 0,
    };
    const [leftover] = pillsFor(plan, 0, '2026-11-16', 'us').filter((pill) => pill.carry);
    expect(leftover?.text).toMatch(/^Heavy cream/);
  });
});
