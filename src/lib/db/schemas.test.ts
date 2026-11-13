import type { Recipe } from '@/features/recipes/types';

import { decode, householdSchema, planSchema, recipeSchema } from './schemas';

const recipe: Recipe = {
  id: 'r1',
  title: 'Creamy mushroom orzo',
  servings: 4,
  totalMinutes: 30,
  equipment: ['stovetop'],
  ingredients: [
    { raw: '1 cup heavy cream', qty: 1, unit: 'cup', ingredientId: 'heavy_cream', status: 'matched' },
    { raw: 'a pinch of magic', qty: null, unit: null, ingredientId: null, status: 'unmatched' },
  ],
  steps: ['Cook the orzo.'],
  source: 'web',
  sourceUrl: 'https://example.com/orzo',
  imageUrl: null,
  needsReview: ['servings'],
  createdAt: 1_700_000_000_000,
};

describe('decode', () => {
  it('round-trips a valid recipe', () => {
    expect(decode(recipeSchema, JSON.stringify(recipe))).toEqual(recipe);
  });

  it('rejects a row that breaks the schema', () => {
    expect(decode(recipeSchema, JSON.stringify({ ...recipe, source: 'ai' }))).toBeNull();
  });

  it('rejects a row with extra fields', () => {
    expect(decode(recipeSchema, JSON.stringify({ ...recipe, rewritten: true }))).toBeNull();
  });

  it('rejects text that is not JSON', () => {
    expect(decode(recipeSchema, '{oops')).toBeNull();
  });

  it('round-trips a household', () => {
    const household = { people: 2, allergens: ['nuts'], diets: [], equipment: ['oven'], dinners: 5, lunches: 0, maxMinutes: 45, market: 'fr' };
    expect(decode(householdSchema, JSON.stringify(household))).toEqual(household);
  });

  it('rejects a household with zero people', () => {
    const household = { people: 0, allergens: [], diets: [], equipment: [], dinners: 5, lunches: 0, maxMinutes: null, market: 'us' };
    expect(decode(householdSchema, JSON.stringify(household))).toBeNull();
  });

  it('round-trips a plan', () => {
    const plan = { slots: [{ day: 0, meal: 'dinner', recipeId: 'r1' }], carries: [{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 2, amount: 120 }], score: 3 };
    expect(decode(planSchema, JSON.stringify(plan))).toEqual(plan);
  });
});
