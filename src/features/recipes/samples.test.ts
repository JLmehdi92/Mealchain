import candidatesEn from '../../../data/samples-en.json';
import candidatesFr from '../../../data/samples-fr.json';
import { household } from '../planner/fixtures';
import { checkRecipe } from '../planner/filter';
import { planWeek } from '../planner/plan';
import { attributionFor } from './attribution';
import { reviewCount } from './meta';
import { sampleRecipes } from './samples';

const languages = [
  { language: 'en', market: 'us', source: candidatesEn, distinctDinners: 5 },
  { language: 'fr', market: 'fr', source: candidatesFr, distinctDinners: 4 },
] as const;

describe.each(languages)('sampleRecipes($language)', ({ language, market, source, distinctDinners }) => {
  const recipes = sampleRecipes(language);

  it('builds every sample with all ingredients matched and nothing to review', () => {
    expect(recipes).toHaveLength(source.length);
    expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(recipes.length);
    for (const recipe of recipes) {
      expect(recipe.ingredients.filter((line) => line.status !== 'matched' || !line.ingredientId)).toEqual([]);
      expect({ id: recipe.id, review: reviewCount(recipe), fields: recipe.needsReview }).toEqual({ id: recipe.id, review: 0, fields: [] });
    }
  });

  it('keeps the source text word for word', () => {
    recipes.forEach((recipe, i) => {
      const original = source[i]!;
      expect({ title: recipe.title, lines: recipe.ingredients.map((line) => line.raw), steps: recipe.steps }).toEqual({
        title: original.title,
        lines: original.ingredients,
        steps: original.steps,
      });
      expect(recipe).toMatchObject({ source: 'web', sourceUrl: original.sourceUrl, servings: original.servings, totalMinutes: original.totalMinutes });
    });
  });

  it('credits every sample to its wiki under CC BY-SA 4.0', () => {
    for (const recipe of recipes) expect(attributionFor(recipe.sourceUrl)).toMatchObject({ license: 'CC BY-SA 4.0' });
  });

  it(`plans ${distinctDinners} different dinners for 2 people`, () => {
    const plan = planWeek(recipes, household({ people: 2, dinners: distinctDinners, market }));
    expect(plan.slots).toHaveLength(distinctDinners);
    expect(new Set(plan.slots.map((slot) => slot.recipeId)).size).toBe(distinctDinners);
  });

  it('keeps samples with a household allergen out of the plan', () => {
    const allergic = household({ allergens: ['milk'], market });
    const withMilk = recipes.filter((recipe) => checkRecipe(recipe, household({ market })).allowed && !checkRecipe(recipe, allergic).allowed);
    expect(withMilk.length).toBeGreaterThan(0);
    const plan = planWeek(recipes, { ...allergic, dinners: 5 });
    expect(plan.slots.some((slot) => withMilk.some((recipe) => recipe.id === slot.recipeId))).toBe(false);
  });
});

it('offers vegetarian and gluten-free samples in both languages', () => {
  for (const language of ['en', 'fr'] as const) {
    const recipes = sampleRecipes(language);
    for (const diet of ['vegetarian', 'gluten_free'] as const) {
      expect(recipes.some((recipe) => checkRecipe(recipe, household({ diets: [diet], equipment: ['oven', 'stovetop', 'blender', 'food_processor'] })).allowed)).toBe(true);
    }
  }
});
