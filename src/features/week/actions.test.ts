import { planWeek } from '@/features/planner/plan';
import { trackOnce } from '@/lib/analytics';
import { replaceSlot } from '@/features/planner/swap';
import { db } from '@/lib/db/client';
import { setSetting } from '@/lib/db/repo';
import { getState, savePlan } from '@/lib/store';

import { household, line, recipe } from '../planner/fixtures';
import { markPlanSeen, startPlan, swapSlot } from './actions';

jest.mock('@/lib/analytics', () => ({ trackOnce: jest.fn(() => Promise.resolve()) }));
jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));
jest.mock('@/lib/db/client', () => ({ db: { select: jest.fn() } }));
jest.mock('@/lib/db/repo', () => ({ setSetting: jest.fn() }));
jest.mock('@/lib/store', () => ({ getState: jest.fn(), savePlan: jest.fn() }));
jest.mock('@/features/planner/plan', () => ({ planWeek: jest.fn(() => PLAN) }));
jest.mock('@/features/planner/swap', () => ({ replaceSlot: jest.fn(() => PLAN) }));

const PLAN = { slots: [], carries: [], score: 0 };
const recipes = [recipe('a', [line('egg', 2, 'piece')])];
const home = household();
const weeks = (list: string[]) =>
  jest.mocked(db.select).mockReturnValue({ from: async () => list.map((weekStart) => ({ weekStart })) } as never);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getState).mockReturnValue({ ready: true, household: home, recipes, plan: PLAN, weekStart: '2026-11-16' });
});

describe('startPlan', () => {
  it('plans and saves the first week', async () => {
    weeks([]);
    await expect(startPlan(false)).resolves.toBe('planned');
    expect(planWeek).toHaveBeenCalledWith(recipes, home);
    expect(savePlan).toHaveBeenCalledWith(PLAN);
    expect(trackOnce).toHaveBeenCalledWith('first_plan');
  });

  it('sends a free household to the paywall for a new week', async () => {
    weeks(['2026-11-09']);
    await expect(startPlan(false)).resolves.toBe('paywall');
    expect(planWeek).not.toHaveBeenCalled();
  });

  it('lets Pro plan any week', async () => {
    weeks(['2026-11-09']);
    await expect(startPlan(true)).resolves.toBe('planned');
  });

  it('does nothing without a household', async () => {
    jest.mocked(getState).mockReturnValue({ ready: true, household: null, recipes, plan: null, weekStart: '2026-11-16' });
    await expect(startPlan(true)).resolves.toBe('skipped');
  });
});

describe('swapSlot', () => {
  it('saves the recomposed plan', async () => {
    await swapSlot(1, 'b');
    expect(replaceSlot).toHaveBeenCalledWith(PLAN, 1, 'b', recipes, home);
    expect(savePlan).toHaveBeenCalledWith(PLAN);
  });

  it('does nothing without a plan', async () => {
    jest.mocked(getState).mockReturnValue({ ready: true, household: home, recipes, plan: null, weekStart: '2026-11-16' });
    await swapSlot(1, 'b');
    expect(savePlan).not.toHaveBeenCalled();
  });
});

it('remembers that the first plan was seen', async () => {
  await markPlanSeen();
  expect(setSetting).toHaveBeenCalledWith('first_plan_seen', 'yes');
});
