import { act, renderHook } from '@testing-library/react-native';

import { household, recipe } from '@/features/planner/fixtures';

import * as repo from './db/repo';
import { deleteRecipe, load, refreshWeek, saveHousehold, savePlan, saveRecipe, useHousehold, usePlan, useReady, useRecipes, useWeekStart } from './store';

jest.mock('./db/client', () => ({ db: {} }));
jest.mock('./db/repo');
const mocked = jest.mocked(repo);

const plan = { slots: [{ day: 0, meal: 'dinner' as const, recipeId: 'a' }], carries: [], score: 1 };

beforeEach(async () => {
  mocked.getHousehold.mockResolvedValue(null);
  mocked.listRecipes.mockResolvedValue([recipe('a', []), recipe('b', [])]);
  mocked.getPlan.mockResolvedValue(null);
  await load();
});

const current = async <T,>(hook: () => T) => (await renderHook(hook)).result.current;
const recipeIds = async () => (await current(useRecipes)).map((r) => r.id);

it('loads household, recipes and plan from the repo', async () => {
  expect(await current(useReady)).toBe(true);
  expect(await current(useHousehold)).toBeNull();
  expect(await recipeIds()).toEqual(['a', 'b']);
});

it('persists and exposes the household', async () => {
  const { result } = await renderHook(useHousehold);
  await act(() => saveHousehold(household()));
  expect(mocked.saveHousehold).toHaveBeenCalledWith(household());
  expect(result.current).toEqual(household());
});

it('puts a new recipe first', async () => {
  await act(() => saveRecipe(recipe('c', [])));
  expect(await recipeIds()).toEqual(['c', 'a', 'b']);
});

it('replaces an edited recipe in place', async () => {
  await act(() => saveRecipe(recipe('b', [], { title: 'Edited' })));
  expect(await recipeIds()).toEqual(['a', 'b']);
  expect((await current(useRecipes))[1]?.title).toBe('Edited');
});

it('removes a deleted recipe', async () => {
  await act(() => deleteRecipe('a'));
  expect(mocked.deleteRecipe).toHaveBeenCalledWith('a');
  expect(await recipeIds()).toEqual(['b']);
});

it('saves the plan under the current week', async () => {
  await act(() => savePlan(plan));
  expect(mocked.savePlan).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), plan);
  expect(await current(usePlan)).toEqual(plan);
});

describe('refreshWeek', () => {
  afterEach(() => jest.useRealTimers());

  it('moves to the new week and its plan when the week turns', async () => {
    jest.useFakeTimers({ now: new Date(2026, 10, 15, 20), advanceTimers: true });
    await load();
    mocked.getPlan.mockResolvedValue(plan);
    jest.setSystemTime(new Date(2026, 10, 16, 8));
    await act(() => refreshWeek());
    expect(mocked.getPlan).toHaveBeenLastCalledWith('2026-11-16');
    expect(await current(useWeekStart)).toBe('2026-11-16');
    expect(await current(usePlan)).toEqual(plan);
  });

  it('does nothing within the same week', async () => {
    jest.useFakeTimers({ now: new Date(2026, 10, 10), advanceTimers: true });
    await load();
    mocked.getPlan.mockClear();
    jest.setSystemTime(new Date(2026, 10, 12));
    await act(() => refreshWeek());
    expect(mocked.getPlan).not.toHaveBeenCalled();
    expect(await current(useWeekStart)).toBe('2026-11-09');
  });
});
