import { getState, saveHousehold, savePlan } from '@/lib/store';

import { household } from '../planner/fixtures';
import { planWeek } from '../planner/plan';
import { rescale } from '../planner/swap';
import { applyHousehold, safetyChanged } from './save';

jest.mock('@/lib/store', () => ({ getState: jest.fn(), saveHousehold: jest.fn(), savePlan: jest.fn() }));
jest.mock('../planner/plan', () => ({ planWeek: jest.fn(() => 'new plan') }));
jest.mock('../planner/swap', () => ({ rescale: jest.fn(() => 'rescaled plan') }));

const PLAN = { slots: [], carries: [], score: 0 };
const state = (current = household()) => jest.mocked(getState).mockReturnValue({ plan: PLAN, recipes: [], household: current } as never);

beforeEach(() => jest.clearAllMocks());

describe('applyHousehold', () => {
  it('saves the household and replans the current week so new rules apply at once', async () => {
    state();
    await applyHousehold(household({ allergens: ['nuts'] }));
    expect(saveHousehold).toHaveBeenCalledWith(household({ allergens: ['nuts'] }));
    expect(planWeek).toHaveBeenCalledWith([], household({ allergens: ['nuts'] }));
    expect(savePlan).toHaveBeenCalledWith('new plan');
  });

  it('keeps the chosen recipes when only the head count changes', async () => {
    state();
    await applyHousehold(household({ people: 5 }));
    expect(planWeek).not.toHaveBeenCalled();
    expect(rescale).toHaveBeenCalledWith(PLAN, [], household({ people: 5 }));
    expect(savePlan).toHaveBeenCalledWith('rescaled plan');
  });

  it('leaves the plan alone when nothing that shapes it changed', async () => {
    state();
    await applyHousehold(household());
    expect(savePlan).not.toHaveBeenCalled();
  });

  it('does not create a plan when none exists yet', async () => {
    jest.mocked(getState).mockReturnValue({ plan: null, recipes: [], household: null } as never);
    await applyHousehold(household());
    expect(savePlan).not.toHaveBeenCalled();
  });
});

describe('safetyChanged', () => {
  it.each([
    ['allergens', { allergens: ['milk' as const] }],
    ['diets', { diets: ['vegan' as const] }],
    ['equipment', { equipment: ['oven' as const] }],
    ['max time', { maxMinutes: 20 }],
    ['dinners', { dinners: 5 }],
    ['lunches', { lunches: 1 }],
  ])('is true when %s change', (_, patch) => {
    expect(safetyChanged(household(), household(patch))).toBe(true);
  });

  it('ignores order and the head count', () => {
    const a = household({ allergens: ['milk', 'eggs'] });
    expect(safetyChanged(a, { ...a, allergens: ['eggs', 'milk'], people: 6, market: 'us' })).toBe(false);
  });
});
