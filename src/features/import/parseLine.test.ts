import { isToTaste, parseIngredientLine } from './parseLine';

describe('parseIngredientLine', () => {
  it.each([
    ['2 cups all-purpose flour', 2, 'cup', 'all-purpose flour'],
    ['1 c. sugar', 1, 'cup', 'sugar'],
    ['1.5 kg pommes de terre', 1.5, 'kg', 'pommes de terre'],
    ['1,5 l de lait', 1.5, 'l', 'lait'],
    ['1 1/2 cups milk', 1.5, 'cup', 'milk'],
    ['1/2 tsp salt', 0.5, 'tsp', 'salt'],
    ['½ cup butter', 0.5, 'cup', 'butter'],
    ['1½ tbsp honey', 1.5, 'tbsp', 'honey'],
    ['¼ c olive oil', 0.25, 'cup', 'olive oil'],
    ['¾ cup cream', 0.75, 'cup', 'cream'],
    ['⅓ cup rice', 1 / 3, 'cup', 'rice'],
    ['⅔ cup water', 2 / 3, 'cup', 'water'],
    ['⅛ tsp nutmeg', 0.125, 'tsp', 'nutmeg'],
    ['2-3 carrots', 3, 'piece', 'carrots'],
    ['2 à 3 carottes', 3, 'piece', 'carottes'],
    ['2 to 3 tablespoons soy sauce', 3, 'tbsp', 'soy sauce'],
    ['2 T butter', 2, 'tbsp', 'butter'],
    ['1 Tbsp oil', 1, 'tbsp', 'oil'],
    ['1 t vanilla', 1, 'tsp', 'vanilla'],
    ['3 teaspoons cumin', 3, 'tsp', 'cumin'],
    ['8 oz cheddar', 8, 'oz', 'cheddar'],
    ['2 ounces feta', 2, 'oz', 'feta'],
    ['4 fl oz cream', 4, 'fl_oz', 'cream'],
    ['1 lb ground beef', 1, 'lb', 'ground beef'],
    ['2 pounds chicken thighs', 2, 'lb', 'chicken thighs'],
    ['500g farine', 500, 'g', 'farine'],
    ['200 grammes de sucre', 200, 'g', 'sucre'],
    ['100 gr de beurre', 100, 'g', 'beurre'],
    ['250 ml water', 250, 'ml', 'water'],
    ['20 cl de crème', 20, 'cl', 'crème'],
    ['1 litre de bouillon', 1, 'l', 'bouillon'],
    ['2 c. à s. d\'huile d\'olive', 2, 'tbsp', "huile d'olive"],
    ['1 c.à.s de miel', 1, 'tbsp', 'miel'],
    ['3 cuillères à soupe de sucre', 3, 'tbsp', 'sucre'],
    ['1 cs moutarde', 1, 'tbsp', 'moutarde'],
    ['1 c. à c. de sel', 1, 'tsp', 'sel'],
    ['2 cuillère à café de cannelle', 2, 'tsp', 'cannelle'],
    ['1 cc cumin', 1, 'tsp', 'cumin'],
    ['2 gousses d\'ail', 2, 'piece', 'ail'],
    ['3 cloves garlic, minced', 3, 'piece', 'garlic'],
    ['3 eggs', 3, 'piece', 'eggs'],
    ['2 oignons', 2, 'piece', 'oignons'],
    ['1 (14.5 oz) can diced tomatoes', 14.5, 'oz', 'diced tomatoes'],
    ['2 (400 g) boîtes de pois chiches', 800, 'g', 'pois chiches'],
    ['1 (large) onion', 1, 'piece', 'onion'],
    ['2 cups of flour', 2, 'cup', 'flour'],
    ['1 Onion, finely chopped', 1, 'piece', 'onion'],
    ['2 tomatoes (about 1 lb)', 2, 'piece', 'tomatoes'],
  ])('parses %p', (raw, qty, unit, name) => {
    const parsed = parseIngredientLine(raw);
    expect(parsed.qty).toBeCloseTo(qty, 5);
    expect(parsed).toEqual({ qty: parsed.qty, unit, name });
  });

  it.each([
    ['salt to taste', 'salt'],
    ['une pincée de sel', 'sel'],
    ['A pinch of nutmeg', 'nutmeg'],
    ['sel, poivre', 'sel'],
    ['Fresh basil', 'fresh basil'],
  ])('leaves %p without quantity', (raw, name) => {
    expect(parseIngredientLine(raw)).toEqual({ qty: null, unit: null, name });
  });
});

describe('isToTaste', () => {
  it.each([
    ['salt to taste', true],
    ['poivre au goût', true],
    ['une pincée de sel', true],
    ['a pinch of salt', true],
    ['herbes à volonté', true],
    ['oil as needed', true],
    ['sel, poivre', false],
    ['2 eggs', false],
  ])('%p → %p', (raw, expected) => {
    expect(isToTaste(raw)).toBe(expected);
  });
});
