import { catalog, packsFor } from './catalog';
import type { Allergen, Diet, Ingredient } from './schema';

const named = (ing: Ingredient, pattern: RegExp) => pattern.test(`${ing.id} ${ing.name.en}`.toLowerCase());
const has = (ing: Ingredient, allergen: Allergen) => ing.allergens.includes(allergen) || ing.mayContain.includes(allergen);
const excludes = (ing: Ingredient, diet: Diet) => ing.notFor.includes(diet);
const offenders = (rule: (ing: Ingredient) => boolean) => catalog.filter(rule).map((ing) => ing.id);

describe('ingredient catalog', () => {
  it('holds about 300 ingredients with unique ids', () => {
    expect(catalog.length).toBeGreaterThanOrEqual(280);
    expect(new Set(catalog.map((i) => i.id)).size).toBe(catalog.length);
  });

  it('converts every US and FR pack to the base unit', () => {
    expect(offenders((i) => packsFor(i, 'us').length !== i.packs.us.length || packsFor(i, 'fr').length !== i.packs.fr.length)).toEqual([]);
  });

  it('marks dairy as milk, unless it is a plant or nut product', () => {
    const dairy = /\b(butter|cream|cheese|milk|yogurt|yoghurt|ghee|mozzarella|parmesan|cheddar|feta|ricotta|brie|gruy[eè]re|mascarpone|cr[eè]me)\b/;
    const plant = /\b(peanut|almond|coconut|oat|soy|cashew|nut|tartar|cocoa|shea)\b/;
    expect(offenders((i) => named(i, dairy) && !named(i, plant) && !has(i, 'milk'))).toEqual([]);
  });

  it('marks nuts, peanuts, sesame, soy and shellfish by name', () => {
    expect(offenders((i) => named(i, /\b(almond|walnut|hazelnut|cashew|pecan|pistachio|macadamia|brazil nut|pine nut)/) && !has(i, 'nuts'))).toEqual([]);
    expect(offenders((i) => named(i, /peanut/) && !has(i, 'peanuts'))).toEqual([]);
    expect(offenders((i) => named(i, /sesame|tahini/) && !has(i, 'sesame'))).toEqual([]);
    expect(offenders((i) => named(i, /\b(soy|tofu|miso|edamame|tempeh)/) && !has(i, 'soy'))).toEqual([]);
    expect(offenders((i) => named(i, /\b(shrimp|prawn|crab|lobster|crayfish)/) && !has(i, 'crustaceans'))).toEqual([]);
    expect(offenders((i) => named(i, /\b(mussel|clam|oyster|squid|octopus|scallop)/) && !has(i, 'molluscs'))).toEqual([]);
  });

  it('marks wheat products as gluten', () => {
    const wheat = /\b(wheat|flour|pasta|spaghetti|penne|orzo|noodle|bread|baguette|tortilla|couscous|bulgur|breadcrumb|panko|semolina|puff pastry|pie crust|barley|rye)/;
    const free = /\b(rice|corn|chickpea|almond|buckwheat|gluten.free|coconut|tapioca|potato)\b/;
    expect(offenders((i) => named(i, wheat) && !named(i, free) && !has(i, 'gluten'))).toEqual([]);
  });

  it('keeps diet exclusions consistent with allergens and proteins', () => {
    expect(offenders((i) => has(i, 'milk') && !(excludes(i, 'vegan') && excludes(i, 'lactose_free')))).toEqual([]);
    expect(offenders((i) => has(i, 'eggs') && !excludes(i, 'vegan'))).toEqual([]);
    expect(offenders((i) => has(i, 'gluten') && !excludes(i, 'gluten_free'))).toEqual([]);
    expect(offenders((i) => (has(i, 'fish') || has(i, 'crustaceans') || has(i, 'molluscs')) && !(excludes(i, 'vegetarian') && excludes(i, 'vegan')))).toEqual([]);
    expect(offenders((i) => ['chicken', 'beef', 'pork', 'lamb'].includes(i.protein ?? '') && !(excludes(i, 'vegetarian') && excludes(i, 'vegan') && excludes(i, 'pescatarian')))).toEqual([]);
    expect(offenders((i) => i.protein === 'pork' && !(excludes(i, 'halal') && excludes(i, 'no_pork')))).toEqual([]);
  });

  it('excludes pork, alcohol and gelatin from halal', () => {
    const haram = /\b(pork|bacon|ham|prosciutto|chorizo|pancetta|lard|gelatin|wine|beer|rum|brandy|cognac|sake|mirin)\b/;
    expect(offenders((i) => named(i, haram) && !excludes(i, 'halal'))).toEqual([]);
  });

  it('declares every allergen that a review note mentions', () => {
    const mentions: [Allergen, RegExp][] = [
      ['sesame', /sesame/], ['milk', /\b(milk|dairy|butter|cheese|yogurt|whey)\b/], ['eggs', /\beggs?\b/], ['soy', /\bsoy/],
      ['gluten', /\b(gluten|wheat|barley)\b/], ['nuts', /\b(tree nuts?|almond|walnut|hazelnut|cashew)/], ['peanuts', /peanut/],
      ['fish', /\b(fish|anchov)/], ['crustaceans', /\b(shrimp|crustacean)/], ['celery', /celery/], ['mustard', /mustard/],
    ];
    const negated = /\b(no|not|without|free of|free)\b/;
    expect(catalog.flatMap((i) => mentions
      .filter(([allergen, word]) => i.review !== undefined && word.test(i.review.toLowerCase()) && !negated.test(i.review.toLowerCase()) && !has(i, allergen))
      .map(([allergen]) => `${i.id}:${allergen}`))).toEqual([]);
  });

  it('keeps proteins consistent with allergens', () => {
    expect(offenders((i) => i.protein === 'cheese' && !has(i, 'milk'))).toEqual([]);
    expect(offenders((i) => i.protein === 'fish' && !has(i, 'fish'))).toEqual([]);
    expect(offenders((i) => i.protein === 'seafood' && !(has(i, 'crustaceans') || has(i, 'molluscs')))).toEqual([]);
    expect(offenders((i) => i.protein === 'egg' && !has(i, 'eggs'))).toEqual([]);
    expect(offenders((i) => named(i, /\bhoney\b/) && !excludes(i, 'vegan'))).toEqual([]);
  });

  it('lists each allergen and diet at most once', () => {
    const dup = (list: string[]) => new Set(list).size !== list.length;
    expect(offenders((i) => dup(i.allergens) || dup(i.mayContain) || dup(i.notFor))).toEqual([]);
  });

  it('gives a piece weight to every ingredient counted in pieces', () => {
    expect(offenders((i) => i.baseUnit === 'piece' && i.gramsPerPiece === undefined)).toEqual([]);
  });
});
