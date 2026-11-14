import { getState, saveRecipe } from '@/lib/store';

import { recipe } from '../planner/fixtures';
import { FREE_RECIPE_LIMIT } from '../subscription/rules';
import { loadSamples } from './loadSamples';
import { sampleRecipes } from './samples';

jest.mock('@/lib/store', () => ({ getState: jest.fn(), saveRecipe: jest.fn(() => Promise.resolve()) }));

const NOW = 1_800_000_000_000;
const boxOf = (count: number) => Array.from({ length: count }, (_, i) => recipe(`r${i}`, []));
const box = (recipes: ReturnType<typeof boxOf>) => jest.mocked(getState).mockReturnValue({ recipes } as never);
const savedIds = () => jest.mocked(saveRecipe).mock.calls.map(([saved]) => saved.id);

beforeEach(() => jest.clearAllMocks());

describe('loadSamples', () => {
  it('saves every sample in the chosen language, dated now', async () => {
    box([]);
    await expect(loadSamples('fr', NOW, false)).resolves.toEqual({ added: sampleRecipes('fr').length });
    const expected = sampleRecipes('fr').map((sample) => ({ ...sample, createdAt: NOW }));
    expect(jest.mocked(saveRecipe).mock.calls.map(([saved]) => saved)).toEqual(expected);
  });

  it('skips samples already in the box', async () => {
    const [first, second] = sampleRecipes('en');
    box([first!, second!]);
    await expect(loadSamples('en', NOW, false)).resolves.toEqual({ added: sampleRecipes('en').length - 2 });
    expect(savedIds()).not.toContain(first!.id);
    expect(savedIds()).not.toContain(second!.id);
  });

  it('adds nothing when every sample is already there', async () => {
    box(sampleRecipes('en'));
    await expect(loadSamples('en', NOW, false)).resolves.toEqual({ added: 0 });
    expect(saveRecipe).not.toHaveBeenCalled();
  });

  it('counts samples toward the free limit, which an empty box can hold in full', () => {
    expect(sampleRecipes('en').length).toBeLessThanOrEqual(FREE_RECIPE_LIMIT);
    expect(sampleRecipes('fr').length).toBeLessThanOrEqual(FREE_RECIPE_LIMIT);
  });

  it('stops a free household at the recipe limit', async () => {
    box(boxOf(12));
    await expect(loadSamples('en', NOW, false)).resolves.toEqual({ added: 3 });
  });

  it('sends a full free household to the paywall without saving', async () => {
    box(boxOf(15));
    await expect(loadSamples('en', NOW, false)).resolves.toBe('paywall');
    expect(saveRecipe).not.toHaveBeenCalled();
  });

  it('lets Pro add every sample past the limit', async () => {
    box(boxOf(15));
    await expect(loadSamples('en', NOW, true)).resolves.toEqual({ added: sampleRecipes('en').length });
  });
});
