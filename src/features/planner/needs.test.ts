import { household, line, recipe } from './fixtures';
import { recipeNeeds } from './needs';

describe('recipeNeeds', () => {
  it('converts to base units and scales to the household', () => {
    const r = recipe('r', [line('heavy_cream', 10, 'cl'), line('egg', 2, null)], { servings: 2 });
    expect(recipeNeeds(r, 4)).toEqual({ needs: new Map([['heavy_cream', 200], ['egg', 4]]), unlisted: [] });
  });

  it('sums repeated ingredients and keeps the recipe size when servings is unknown', () => {
    const r = recipe('r', [line('baby_spinach', 50, 'g'), line('baby_spinach', 0.1, 'kg')], { servings: null });
    expect(recipeNeeds(r, household().people).needs).toEqual(new Map([['baby_spinach', 150]]));
  });

  it('returns as unlisted the lines without quantity, without catalog match, or not convertible', () => {
    const unmatched = { ...line('egg', 1, 'piece'), status: 'unmatched' as const };
    const r = recipe('r', [line('egg', null, null), unmatched, line('brie', 2, 'cup')]);
    expect(recipeNeeds(r, 2)).toEqual({ needs: new Map(), unlisted: r.ingredients.map((l) => l.raw) });
  });
});
