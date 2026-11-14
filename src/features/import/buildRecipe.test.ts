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
    const recipe = buildRecipe({ ...raw, ingredients: ['2 ou 3 œufs', '1 can crushed tomatoes', '2 dragon fruits'] }, 'web', 'r2', 0);
    expect(recipe.ingredients.map((i) => [i.ingredientId, i.status])).toEqual([
      ['egg', 'needsReview'],
      ['crushed_tomatoes', 'needsReview'],
      [null, 'unmatched'],
    ]);
    expect(recipe.ingredients[2]).toMatchObject({ qty: 2, unit: 'piece' });
    expect(recipe.needsReview).toEqual(['ingredients']);
  });

  it('reads a bare spice or condiment line as to taste, but not a bare fresh ingredient', () => {
    const recipe = buildRecipe({ ...raw, ingredients: ['Salt', 'Olive oil,', 'Butter'] }, 'web', 'r4', 0);
    expect(recipe.ingredients.map((i) => [i.raw, i.ingredientId, i.qty, i.status])).toEqual([
      ['Salt', 'salt', null, 'matched'],
      ['Olive oil,', 'olive_oil', null, 'matched'],
      ['Butter', 'butter', null, 'needsReview'],
    ]);
  });

  it('keeps a seasoning line listing several items for review, so a hidden allergen is never passed', () => {
    const lines = ['Salt, sesame oil', 'Salt, pepper and fish sauce', 'Sel, poivre et sauce de poisson', 'Black pepper; soy sauce', 'Salt/pepper'];
    const recipe = buildRecipe({ ...raw, ingredients: lines }, 'web', 'r5', 0);
    expect(recipe.ingredients.map((i) => i.status)).toEqual(lines.map(() => 'needsReview'));
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

describe('equipment and multi-ingredient lines, review fixes', () => {
  it('detects French stovetop wording', () => {
    expect(detectEquipment(["Faire revenir l'oignon à feu moyen dans une sauteuse"])).toEqual(['stovetop']);
    expect(detectEquipment(['Saisir le poulet au wok'])).toEqual(['stovetop']);
  });

  it('does not read a sheet pan or baking pan as a stovetop', () => {
    expect(detectEquipment(['Spread on a sheet pan and bake for 20 minutes'])).toEqual(['oven']);
    expect(detectEquipment(['Pour into a baking pan and bake'])).toEqual(['oven']);
  });

  it('flags a line that names two different ingredients for review', () => {
    const recipe = buildRecipe({ title: 'T', servings: 2, totalMinutes: 10, ingredients: ['1 cup milk or almond milk'], steps: ['Mix.'], sourceUrl: 'https://x.example' }, 'web', 'id', 0);
    expect(recipe.ingredients[0]?.status).toBe('needsReview');
  });
});

describe('safe ingredient matching', () => {
  const lineOf = (line: string) => buildRecipe({ ...raw, ingredients: [line] }, 'web', 'id', 0).ingredients[0];

  it.each([
    '2 cups gluten-free flour', '100 g farine sans gluten', '1 cup rice flour', '1 cup vegan butter', '1 cup lactose-free milk',
    '1 cup nut milk', '1 cup milk chocolate', '1 cup peanut oil', '1 cup peanut-free granola', '1 cup milk (dairy-free)',
  ])('never matches %p', (line) => {
    expect(lineOf(line)?.status).not.toBe('matched');
  });

  it.each(['2 large eggs', '1 onion, finely chopped', '200 g de farine', '20 cl de crème liquide', '1 (14.5 oz) can diced tomatoes', '1 cup coconut milk'])(
    'still matches %p',
    (line) => {
      expect(lineOf(line)?.status).toBe('matched');
    },
  );

  it('keeps the catalog suggestion on a line that needs review', () => {
    expect(lineOf('1 cup rice flour')).toMatchObject({ ingredientId: 'all_purpose_flour', status: 'needsReview' });
  });
});

