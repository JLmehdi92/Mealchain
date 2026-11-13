import { checkRecipe } from './filter';
import { household, line, recipe } from './fixtures';

const unmatched = { raw: 'a pinch of magic', qty: null, unit: null, ingredientId: null, status: 'unmatched' as const };

describe('checkRecipe', () => {
  it('allows a recipe that breaks no rule', () => {
    expect(checkRecipe(recipe('r', [line('egg', 2, 'piece')]), household())).toEqual({ allowed: true, reasons: [] });
  });

  it('excludes a declared allergen', () => {
    const result = checkRecipe(recipe('r', [line('egg', 2, 'piece')]), household({ allergens: ['eggs'] }));
    expect(result).toEqual({ allowed: false, reasons: [{ kind: 'allergen', detail: 'egg:eggs' }] });
  });

  it('excludes a declared allergen that is only a may-contain trace', () => {
    const result = checkRecipe(recipe('r', [line('gnocchi', 500, 'g')]), household({ allergens: ['eggs'] }));
    expect(result.reasons).toEqual([{ kind: 'allergen', detail: 'gnocchi:eggs' }]);
  });

  it('excludes an ingredient not suited to a household diet', () => {
    const result = checkRecipe(recipe('r', [line('heavy_cream', 20, 'cl')]), household({ diets: ['vegan'] }));
    expect(result).toEqual({ allowed: false, reasons: [{ kind: 'diet', detail: 'heavy_cream:vegan' }] });
  });

  it('excludes a recipe needing equipment the household lacks', () => {
    const result = checkRecipe(recipe('r', [], { equipment: ['oven', 'blender'] }), household());
    expect(result).toEqual({ allowed: false, reasons: [{ kind: 'equipment', detail: 'blender' }] });
  });

  it('excludes a recipe longer than the time limit', () => {
    const result = checkRecipe(recipe('r', [], { totalMinutes: 45 }), household({ maxMinutes: 30 }));
    expect(result).toEqual({ allowed: false, reasons: [{ kind: 'time', detail: '45>30' }] });
  });

  it('allows any duration without a limit, and an unknown duration with one', () => {
    expect(checkRecipe(recipe('r', [], { totalMinutes: 300 }), household()).allowed).toBe(true);
    expect(checkRecipe(recipe('r', [], { totalMinutes: null }), household({ maxMinutes: 30 })).allowed).toBe(true);
  });

  it('excludes an unverified ingredient when the household declared a constraint', () => {
    const result = checkRecipe(recipe('r', [unmatched]), household({ diets: ['vegetarian'] }));
    expect(result).toEqual({ allowed: false, reasons: [{ kind: 'unverified', detail: 'a pinch of magic' }] });
  });

  it('treats an unknown ingredient id as unverified', () => {
    const result = checkRecipe(recipe('r', [line('not_in_catalog', 1, 'g')]), household({ allergens: ['milk'] }));
    expect(result.reasons).toEqual([{ kind: 'unverified', detail: '1 g not_in_catalog' }]);
  });

  it('allows an unverified ingredient when the household declared nothing', () => {
    expect(checkRecipe(recipe('r', [unmatched]), household()).allowed).toBe(true);
  });

  it('treats a needsReview line as unverified for a strict household, its id being only a guess', () => {
    const review = { ...line('heavy_cream', 20, 'cl'), status: 'needsReview' as const };
    expect(checkRecipe(recipe('r', [review]), household({ allergens: ['eggs'] })).reasons).toEqual([{ kind: 'unverified', detail: review.raw }]);
    expect(checkRecipe(recipe('r', [review]), household()).allowed).toBe(true);
  });

  it('excludes for a strict household a recipe without ingredient lines or whose ingredients need review', () => {
    const strict = household({ diets: ['vegetarian'] });
    const unverified = [{ kind: 'unverified', detail: 'ingredients' }];
    expect(checkRecipe(recipe('r', []), strict).reasons).toEqual(unverified);
    expect(checkRecipe(recipe('r', [line('egg', 2, 'piece')], { needsReview: ['ingredients'] }), strict).reasons).toEqual(unverified);
    expect(checkRecipe(recipe('r', [], { needsReview: ['ingredients'] }), household()).allowed).toBe(true);
  });

  it('collects every reason', () => {
    const r = recipe('r', [line('heavy_cream', 20, 'cl'), unmatched], { equipment: ['grill'], totalMinutes: 90 });
    const result = checkRecipe(r, household({ allergens: ['milk'], diets: ['vegan'], maxMinutes: 60 }));
    expect(result.reasons.map((reason) => reason.kind)).toEqual(['allergen', 'diet', 'unverified', 'equipment', 'time']);
  });
});
