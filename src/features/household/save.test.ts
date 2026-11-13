import { getState, saveHousehold, savePlan } from '@/lib/store';

import { household } from '../planner/fixtures';
import { planWeek } from '../planner/plan';
import { applyHousehold } from './save';

jest.mock('@/lib/store', () => ({ getState: jest.fn(), saveHousehold: jest.fn(), savePlan: jest.fn() }));
jest.mock('../planner/plan', () => ({ planWeek: jest.fn(() => 'new plan') }));

beforeEach(() => jest.clearAllMocks());

describe('applyHousehold', () => {
  it('saves the household and replans the current week so new rules apply at once', async () => {
    jest.mocked(getState).mockReturnValue({ plan: { slots: [] }, recipes: [] } as never);
    await applyHousehold(household({ allergens: ['nuts'] }));
    expect(saveHousehold).toHaveBeenCalledWith(household({ allergens: ['nuts'] }));
    expect(planWeek).toHaveBeenCalledWith([], household({ allergens: ['nuts'] }));
    expect(savePlan).toHaveBeenCalledWith('new plan');
  });

  it('does not create a plan when none exists yet', async () => {
    jest.mocked(getState).mockReturnValue({ plan: null, recipes: [] } as never);
    await applyHousehold(household());
    expect(savePlan).not.toHaveBeenCalled();
  });
});
