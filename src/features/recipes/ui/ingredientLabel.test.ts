import { ingredientLabel } from './ingredientLabel';

const copy = { asWritten: 'As written (serves {servings})', forYou: 'For your {people}' };

describe('ingredientLabel', () => {
  it('names both values when scaled', () => {
    expect(ingredientLabel('2 leeks', '1', copy, 4, 2)).toBe('As written (serves 4): 2 leeks. For your 2: 1');
  });
  it('reads the original text alone when not scaled', () => {
    expect(ingredientLabel('2 leeks', null, copy, 4, 2)).toBe('2 leeks');
  });
});
