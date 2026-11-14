import { type Candidate, eligible, pickGreedy, proteinOf } from './selectSamples';

const base: Candidate = {
  title: 'Leek and chicken skillet',
  servings: 4,
  totalMinutes: 30,
  ingredients: ['2 chicken breasts', '2 leeks', '1 tbsp olive oil', 'Salt'],
  steps: ['Cook the chicken and leeks in a skillet.'],
  sourceUrl: 'https://en.wikibooks.org/wiki/Cookbook:Test',
  sourceName: 'Wikibooks',
  license: 'CC BY-SA 4.0',
  author: 'Wikibooks contributors',
};
const none = new Set<string>();
const sample = (over: Partial<Candidate>) => eligible({ ...base, ...over }, none) ?? (() => { throw new Error('not eligible'); })();

describe('eligible', () => {
  it('keeps a fully matched main dish, with nothing to confirm', () => {
    expect(eligible(base, none)).toEqual({ ...base, confirmed: [] });
  });

  it.each([
    ['a dessert or sauce title', { title: 'Chocolate cake' }],
    ['more than 60 minutes', { totalMinutes: 75 }],
    ['a barbecue', { steps: ['Grill the chicken.'] }],
    ['fewer than 4 lines', { ingredients: base.ingredients.slice(0, 3) }],
    ['no step', { steps: [] }],
    ['leftover markup', { steps: ['Cook it&#8217;s way.'] }],
    ['an unknown ingredient', { ingredients: [...base.ingredients, '2 dragon fruits'] }],
    ['an unreviewed partial match', { ingredients: [...base.ingredients, '2 cups low-fat sour cream'] }],
    ['a bare fresh ingredient', { ingredients: [...base.ingredients, 'Butter'] }],
  ])('drops a recipe with %s', (_, over) => {
    expect(eligible({ ...base, ...over }, none)).toBeNull();
  });

  it('keeps a reviewed partial match and lists it as confirmed', () => {
    const line = '2 cups low-fat sour cream';
    expect(eligible({ ...base, ingredients: [...base.ingredients, line] }, new Set([line]))?.confirmed).toEqual([line]);
  });
});

describe('pickGreedy', () => {
  const chicken = sample({});
  const chickenAgain = sample({ title: 'Chicken stew', ingredients: ['2 chicken breasts', '2 carrots', '1 onion', 'Salt'] });
  const beefLeek = sample({ title: 'Beef and leeks', ingredients: ['1 lb ground beef', '2 leeks', '1 onion', 'Salt'] });
  const beefPlain = sample({ title: 'Beef bowl', ingredients: ['1 lb ground beef', '1 cup white rice', '2 carrots', 'Salt'] });

  it('reads the main protein, vegetarian when there is none', () => {
    expect(proteinOf(beefLeek)).toBe('beef');
    expect(proteinOf(sample({ ingredients: ['2 leeks', '2 carrots', '1 onion', 'Salt'] }))).toBe('vegetarian');
  });

  it('prefers a new protein, then the recipe sharing the most fresh ingredients', () => {
    expect(pickGreedy([chicken, chickenAgain, beefPlain, beefLeek], 3).map((s) => s.title)).toEqual([
      'Leek and chicken skillet',
      'Beef and leeks',
      'Chicken stew',
    ]);
  });

  it('never returns more than the pool', () => {
    expect(pickGreedy([chicken], 30)).toEqual([chicken]);
  });
});
