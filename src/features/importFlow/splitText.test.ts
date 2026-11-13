import { splitText } from './splitText';

describe('splitText', () => {
  it('reads sections under English headers', () => {
    const text = 'Gochujang noodles\n\nIngredients:\n- 200 g wheat noodles\n• 2 tbsp gochujang\nSalt\n\nSteps\n1. Boil the noodles.\n2) Stir in the sauce.';
    expect(splitText(text)).toEqual({
      title: 'Gochujang noodles',
      ingredients: ['200 g wheat noodles', '2 tbsp gochujang', 'Salt'],
      steps: ['Boil the noodles.', 'Stir in the sauce.'],
      sourceUrl: '',
    });
  });

  it.each(['Ingrédients', 'INGREDIENTS :'])('detects the ingredient header %s', (header) => {
    expect(splitText(`${header}\nsel`).ingredients).toEqual(['sel']);
  });

  it.each(['Instructions', 'Préparation :', 'Method', 'Directions', 'Étapes'])('detects the step header %s', (header) => {
    expect(splitText(`${header}\nMélanger.`).steps).toEqual(['Mélanger.']);
  });

  it('keeps unheaded lines with a quantity as ingredients and numbered lines as steps', () => {
    const text = 'Quick dal\n1 can coconut milk\n200 g red lentils\nSo good!!\n1. Simmer everything.';
    expect(splitText(text)).toMatchObject({
      title: 'Quick dal',
      ingredients: ['1 can coconut milk', '200 g red lentils'],
      steps: ['Simmer everything.'],
    });
  });

  it('never uses an ingredient line as the title', () => {
    expect(splitText('2 eggs\n1 cup milk').title).toBeUndefined();
  });

  it('never uses a long first line as the title', () => {
    expect(splitText(`${'This is a very long caption that rambles on about dinner '.repeat(2)}\n2 eggs`).title).toBeUndefined();
  });

  it('skips screenshot noise above the title', () => {
    expect(splitText('9:41\n•dll\nGratin de courgettes à la feta\nIngrédients :\n3 courgettes').title).toBe('Gratin de courgettes à la feta');
  });

  it('keeps a vowel-less title and a leading quantity line', () => {
    expect(splitText('BLT\nIngredients:\n2 slices bacon').title).toBe('BLT');
    expect(splitText('500 ml\nmilk\nIngredients:\n2 eggs').ingredients).toContain('500 ml');
  });

  it('never uses a header as the title', () => {
    expect(splitText('Ingredients\n2 eggs').title).toBeUndefined();
  });

  it('drops hashtag lines', () => {
    expect(splitText('Steps\nBake it.\n#dinner #easy').steps).toEqual(['Bake it.']);
  });

  it('finds nothing in text without a recipe', () => {
    expect(splitText('What a lovely evening\nSee you soon')).toMatchObject({ ingredients: [], steps: [] });
  });

  it('returns nothing for empty text', () => {
    expect(splitText('  \n ')).toEqual({ title: undefined, ingredients: [], steps: [], sourceUrl: '' });
  });
});
