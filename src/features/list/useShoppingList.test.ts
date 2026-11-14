import { act, renderHook } from '@testing-library/react-native';

import * as repo from '@/lib/db/repo';
import * as sync from '@/lib/sync';

import { useShoppingList } from './useShoppingList';

jest.mock('@/lib/db/client', () => ({ db: {} }));
jest.mock('@/lib/db/repo');
jest.mock('@/lib/sync');
jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));
const mockedRepo = jest.mocked(repo);
const mockedSync = jest.mocked(sync);

beforeEach(() => {
  mockedRepo.getChecks.mockResolvedValue([]);
  mockedRepo.setCheck.mockResolvedValue();
  mockedSync.sharedHousehold.mockResolvedValue('h1');
  mockedSync.subscribeChecks.mockReturnValue(() => {});
  mockedSync.pullChecks.mockResolvedValue([]);
  mockedSync.pushChecks.mockResolvedValue(undefined);
});

it('flips the check twice on two quick taps and syncs each value', async () => {
  const { result } = await renderHook(useShoppingList);
  await act(async () => {
    result.current.toggle('milk');
    result.current.toggle('milk');
  });
  expect(mockedRepo.setCheck.mock.calls.map((call) => call[2])).toEqual([true, false]);
  expect(mockedSync.pushChecks.mock.calls.map((call) => call[2][0]?.checked)).toEqual([true, false]);
});
