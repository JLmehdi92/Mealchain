import { canAddRecipe, canPlanWeek, FREE_RECIPE_LIMIT, trialReminderAt } from './rules';

describe('free tier rules', () => {
  it('allows 15 recipes for free, unlimited with Pro', () => {
    expect(FREE_RECIPE_LIMIT).toBe(15);
    expect(canAddRecipe(14, false)).toBe(true);
    expect(canAddRecipe(15, false)).toBe(false);
    expect(canAddRecipe(500, true)).toBe(true);
  });

  it('gives one full first week for free, including re-planning and swaps of that week', () => {
    expect(canPlanWeek([], '2026-11-16', false)).toBe(true);
    expect(canPlanWeek(['2026-11-16'], '2026-11-16', false)).toBe(true);
    expect(canPlanWeek(['2026-11-16'], '2026-11-23', false)).toBe(false);
    expect(canPlanWeek(['2026-11-16', '2026-11-23'], '2026-11-30', true)).toBe(true);
  });

  it('schedules the trial reminder two days before the trial ends, never in the past', () => {
    const now = new Date('2026-11-13T10:00:00Z');
    expect(trialReminderAt(new Date('2026-11-20T10:00:00Z'), now)?.toISOString()).toBe('2026-11-18T10:00:00.000Z');
    expect(trialReminderAt(new Date('2026-11-14T10:00:00Z'), now)).toBeNull();
  });
});
