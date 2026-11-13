import { line, recipe } from '../planner/fixtures';
import { lineAllergens, mainReason, reviewCount, thumbFor } from './meta';

describe('thumbFor', () => {
  it('draws the first ingredient that has a pack picture', () => {
    expect(thumbFor(recipe('a', [line('banana', 1, 'piece'), line('heavy_cream', 20, 'cl')]), 'fr')).toBe('carton');
  });

  it.each([
    ['bottle', 'olive_oil', 'jar'],
    ['tub', 'gochujang', 'jar'],
    ['box of eggs', 'egg', 'eggs'],
    ['bunch', 'parsley', 'bunch'],
    ['tray', 'chicken_thigh', 'tray'],
    ['block', 'feta', 'block'],
    ['can', 'anchovies', 'can'],
    ['bag', 'shrimp', 'bag'],
  ])('maps a %s', (_, id, thumb) => {
    expect(thumbFor(recipe('a', [line(id, 1, 'piece')]), 'us')).toBe(thumb);
  });

  it('ignores unmatched lines and packs without a picture', () => {
    const lines = [{ ...line('heavy_cream', 1, 'cup'), status: 'unmatched' as const }, line('butter', 1, 'tbsp'), line('banana', 1, 'piece')];
    expect(thumbFor(recipe('a', lines), 'us')).toBeNull();
  });
});

describe('reviewCount', () => {
  it('counts flagged fields and lines that are not matched', () => {
    const lines = [line('egg', 2, 'piece'), { ...line('egg', 1, null), status: 'needsReview' as const }, { ...line('x', 1, null), status: 'unmatched' as const }];
    expect(reviewCount(recipe('a', lines, { needsReview: ['totalMinutes', 'ingredients', 'steps'] }))).toBe(3);
  });

  it('is zero for a clean recipe', () => {
    expect(reviewCount(recipe('a', [line('egg', 2, 'piece')]))).toBe(0);
  });
});

describe('mainReason', () => {
  it('puts allergens first', () => {
    const reasons = [{ kind: 'time' as const, detail: '60>45' }, { kind: 'allergen' as const, detail: 'cashew:nuts' }];
    expect(mainReason(reasons)).toEqual({ kind: 'allergen', detail: 'cashew:nuts' });
  });

  it('orders diet, equipment, time, then unverified', () => {
    expect(mainReason([{ kind: 'unverified', detail: 'x' }, { kind: 'equipment', detail: 'oven' }])?.kind).toBe('equipment');
    expect(mainReason([{ kind: 'time', detail: '1' }, { kind: 'diet', detail: 'pork:no_pork' }])?.kind).toBe('diet');
  });

  it('is undefined when nothing is wrong', () => {
    expect(mainReason([])).toBeUndefined();
  });
});

describe('lineAllergens', () => {
  it('lists allergens and traces from the catalog', () => {
    expect(lineAllergens(line('burger_bun', 1, 'piece'))).toEqual({ contains: ['gluten'], mayContain: ['sesame', 'milk', 'eggs'] });
  });

  it('also reads lines waiting for review', () => {
    expect(lineAllergens({ ...line('heavy_cream', 1, 'cup'), status: 'needsReview' }).contains).toEqual(['milk']);
  });

  it('is empty for an unmatched line', () => {
    expect(lineAllergens({ ...line('heavy_cream', 1, 'cup'), status: 'unmatched' })).toEqual({ contains: [], mayContain: [] });
  });
});
