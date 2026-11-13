import { trackOnce } from '@/lib/analytics';
import { getState, saveRecipe } from '@/lib/store';

import { recipe } from '../planner/fixtures';
import { saveImported } from './saveImported';

jest.mock('@/lib/store', () => ({ getState: jest.fn(), saveRecipe: jest.fn() }));
jest.mock('@/lib/analytics', () => ({ trackOnce: jest.fn(() => Promise.resolve()) }));

const boxOf = (count: number) => Array.from({ length: count }, (_, i) => recipe(`r${i}`, []));
const box = (recipes: ReturnType<typeof boxOf>) => jest.mocked(getState).mockReturnValue({ recipes } as never);

beforeEach(() => jest.clearAllMocks());

describe('saveImported', () => {
  it('saves a recipe under the free limit and counts the first import', async () => {
    box([]);
    await expect(saveImported(recipe('new', []), false)).resolves.toBe('saved');
    expect(saveRecipe).toHaveBeenCalledWith(recipe('new', []));
    expect(trackOnce).toHaveBeenCalledWith('first_import');
  });

  it('sends a free household at the limit to the paywall without saving', async () => {
    box(boxOf(15));
    await expect(saveImported(recipe('new', []), false)).resolves.toBe('paywall');
    expect(saveRecipe).not.toHaveBeenCalled();
  });

  it('lets Pro save past the limit', async () => {
    box(boxOf(15));
    await expect(saveImported(recipe('new', []), true)).resolves.toBe('saved');
  });

  it('lets a free household edit a recipe it already has at the limit', async () => {
    box(boxOf(15));
    await expect(saveImported(recipe('r3', []), false)).resolves.toBe('saved');
  });
});
