import { buildRecipe, detectEquipment } from './buildRecipe';
import type { RawRecipe } from './jsonld';

const raw: RawRecipe = {
  title: 'Shakshuka',
  servings: 4,
  totalMinutes: 30,
  ingredients: ['4 eggs', '1 (14.5 oz) can crushed tomatoes', 'salt to taste'],
  steps: ['Simmer the tomatoes in a skillet.', 'Crack the eggs and cook.'],
  imageUrl: 'https://example.com/s.jpg',
  sourceUrl: 'https://example.com/s',
};

describe('buildRecipe', () => {
  it('builds a fully matched recipe with nothing to review', () => {
    expect(buildRecipe(raw, 'web', 'r1', 1000)).toEqual({
      id: 'r1',
      title: 'Shakshuka',
      servings: 4,
      totalMinutes: 30,
      equipment: ['stovetop'],
      ingredients: [
        { raw: '4 eggs', qty: 4, unit: 'piece', ingredientId: 'egg', status: 'matched' },
        { raw: '1 (14.5 oz) can crushed tomatoes', qty: 14.5, unit: 'oz', ingredientId: 'crushed_tomatoes', status: 'matched' },
        { raw: 'salt to taste', qty: null, unit: null, ingredientId: 'salt', status: 'matched' },
      ],
      steps: raw.steps,
      source: 'web',
      sourceUrl: 'https://example.com/s',
      imageUrl: 'https://example.com/s.jpg',
      needsReview: [],
      createdAt: 1000,
    });
  });

  it('flags missing quantities, unconvertible units and unknown ingredients', () => {
    const recipe = buildRecipe({ ...raw, ingredients: ['sel, poivre', '1 can crushed tomatoes', '2 dragon fruits'] }, 'web', 'r2', 0);
    expect(recipe.ingredients.map((i) => [i.ingredientId, i.status])).toEqual([
      ['salt', 'needsReview'],
      ['crushed_tomatoes', 'needsReview'],
      [null, 'unmatched'],
    ]);
    expect(recipe.ingredients[2]).toMatchObject({ qty: 2, unit: 'piece' });
    expect(recipe.needsReview).toEqual(['ingredients']);
  });

  it('never invents missing fields and lists them for review', () => {
    const recipe = buildRecipe({ ingredients: [], steps: [], sourceUrl: '' }, 'caption', 'r3', 5);
    expect(recipe).toMatchObject({
      title: '',
      servings: null,
      totalMinutes: null,
      equipment: [],
      sourceUrl: null,
      imageUrl: null,
      needsReview: ['title', 'servings', 'totalMinutes', 'ingredients', 'steps'],
    });
  });
});

describe('detectEquipment', () => {
  it.each([
    ['Preheat the oven to 400°F.', ['oven']],
    ['Préchauffer le four à 180 °C.', ['oven']],
    ['Enfourner au four 20 min.', ['oven']],
    ['Bake until golden.', ['oven']],
    ['Cut into four pieces.', []],
    ['Faire revenir dans une poêle.', ['stovetop']],
    ['Bring to a boil in a large pan.', ['stovetop']],
    ['Verser dans une casserole.', ['stovetop']],
    ['Blend until smooth.', ['blender']],
    ['Mixer au mixeur plongeant.', ['blender']],
    ['Pulse in a food processor.', ['food_processor']],
    ['Hacher au robot.', ['food_processor']],
    ['Cook in the air fryer at 200°C.', ['air_fryer']],
    ['Cuire à la friteuse à air.', ['air_fryer']],
    ['Cook in a slow cooker for 8 hours.', ['slow_cooker']],
    ['Laisser cuire à la mijoteuse.', ['slow_cooker']],
    ['Microwave for 2 minutes.', ['microwave']],
    ['Réchauffer au micro-ondes.', ['microwave']],
    ['Grill the chicken.', ['grill']],
    ['Cuire au barbecue.', ['grill']],
    ['Mix the salad.', []],
  ])('%p → %p', (text, equipment) => {
    expect(detectEquipment([text])).toEqual(equipment);
  });

  it('lists each tool once, in a stable order', () => {
    expect(detectEquipment(['Grill the peppers.', 'Preheat oven.', 'Bake 10 min.'])).toEqual(['oven', 'grill']);
  });
});
