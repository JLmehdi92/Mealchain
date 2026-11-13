import { matchIngredient } from './match';

describe('matchIngredient', () => {
  it.each([
    ['diced tomatoes', 'diced_tomatoes'], ['can diced tomatoes', 'diced_tomatoes'], ['tomates concassées', 'diced_tomatoes'],
    ['crushed tomatoes', 'crushed_tomatoes'], ['tomato sauce', 'passata'], ['coulis de tomates', 'passata'],
  ])('maps canned tomato wording "%s" to %s, never to fresh tomatoes', (name, id) => {
    expect(matchIngredient(name)?.ingredient.id).toBe(id);
  });

  it.each([
    ['onion', 'yellow_onion'],
    ['red onion', 'red_onion'],
    ['large red onions', 'red_onion'],
    ['oignons', 'yellow_onion'],
    ['milk', 'whole_milk'],
    ['coconut milk', 'coconut_milk'],
    ['lait de coco', 'coconut_milk'],
    ['œufs', 'egg'],
    ['oeufs', 'egg'],
    ['Huile d’olive', 'olive_oil'],
    ['ail', 'garlic'],
    ['garlic powder', 'garlic_powder'],
    ['pommes de terre', 'potato'],
    ['canned diced tomatoes', 'diced_tomatoes'],
    ['ripe tomatoes', 'tomato'],
    ['crème fraîche épaisse', 'creme_fraiche'],
    ['thym', 'dried_thyme'],
  ])('matches %p to %p', (name, id) => {
    expect(matchIngredient(name)?.ingredient.id).toBe(id);
  });

  it.each([['unicorn tears'], [''], ['onionskin paper']])('returns null for %p', (name) => {
    expect(matchIngredient(name)).toBeNull();
  });

  it.each([
    ['large eggs', true],
    ['diced tomatoes', true],
    ['oignons émincés', true],
    ['extra-virgin olive oil', true],
    ['rice flour', false],
    ['can diced tomatoes', false],
    ['chicken stock or water', false],
  ])('says whether %p is wholly covered by the catalog phrase (%p)', (name, whole) => {
    expect(matchIngredient(name)?.whole).toBe(whole);
  });
});
