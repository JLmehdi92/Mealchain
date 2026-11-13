import { ingredientById } from '../ingredients/catalog';
import { toBase } from '../ingredients/units';
import { household } from '../planner/fixtures';
import { planWeek } from '../planner/plan';
import { sampleRecipes } from './samples';

const languages = [
  { language: 'en', market: 'us' },
  { language: 'fr', market: 'fr' },
] as const;
const SHARED_PACKS = ['heavy_cream', 'coconut_milk', 'baby_spinach', 'egg', 'feta', 'leek'];

describe.each(languages)('sampleRecipes($language)', ({ language, market }) => {
  const recipes = sampleRecipes(language);

  it('ships 8 recipes kept as written, with nothing to review', () => {
    expect(recipes).toHaveLength(8);
    expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(8);
    for (const recipe of recipes) {
      expect(recipe).toMatchObject({ source: 'web', sourceUrl: null, imageUrl: null, needsReview: [], servings: 4 });
      expect(recipe.title.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
    }
  });

  it('uses only catalog ingredients whose quantities convert', () => {
    for (const line of recipes.flatMap((recipe) => recipe.ingredients)) {
      const ingredient = ingredientById.get(line.ingredientId ?? '');
      expect({ raw: line.raw, found: !!ingredient, status: line.status }).toEqual({ raw: line.raw, found: true, status: 'matched' });
      if (!ingredient || line.qty === null || line.unit === null) throw new Error(`incomplete line: ${line.raw}`);
      expect({ raw: line.raw, base: toBase(line.qty, line.unit, ingredient) }).toEqual({ raw: line.raw, base: expect.any(Number) });
    }
  });

  it('plans 5 dinners for 4 people that carry at least 2 opened packs forward', () => {
    const plan = planWeek(recipes, household({ people: 4, dinners: 5, market }));
    expect(plan.slots).toHaveLength(5);
    expect(plan.slots.every((slot) => recipes.some((recipe) => recipe.id === slot.recipeId))).toBe(true);
    const sharedPacks = new Set(plan.carries.map((carry) => carry.ingredientId).filter((id) => SHARED_PACKS.includes(id)));
    expect(sharedPacks.size).toBeGreaterThanOrEqual(2);
  });
});

it('keeps the same recipes, ingredients and quantities structure in both languages', () => {
  const [en, fr] = [sampleRecipes('en'), sampleRecipes('fr')];
  expect(fr.map((recipe) => recipe.id)).toEqual(en.map((recipe) => recipe.id));
  expect(fr.map((recipe) => recipe.ingredients.map((line) => line.ingredientId))).toEqual(
    en.map((recipe) => recipe.ingredients.map((line) => line.ingredientId)),
  );
  expect(fr.map((recipe) => recipe.steps.length)).toEqual(en.map((recipe) => recipe.steps.length));
});
