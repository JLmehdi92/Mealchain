import { formatAmount, formatQty, quarters } from './format';

describe('quarters', () => {
  it.each([
    [4, '4'],
    [4.5, '4½'],
    [0.26, '¼'],
    [1.74, '1¾'],
    [0.05, '¼'],
  ])('writes %d as %s', (n, text) => {
    expect(quarters(n)).toBe(text);
  });
});

describe('formatAmount', () => {
  it('writes millilitres as fl oz in the US', () => {
    expect(formatAmount(118, 'ml', 'us')).toBe('4 fl oz');
  });

  it('writes millilitres as is in France', () => {
    expect(formatAmount(100.4, 'ml', 'fr')).toBe('100 ml');
  });

  it('writes grams as oz, then lb, in the US', () => {
    expect(formatAmount(85, 'g', 'us')).toBe('3 oz');
    expect(formatAmount(567, 'g', 'us')).toBe('1¼ lb');
  });

  it('writes grams, then kg, in France', () => {
    expect(formatAmount(90, 'g', 'fr')).toBe('90 g');
    expect(formatAmount(1250, 'g', 'fr')).toBe('1,3 kg');
  });

  it('writes pieces as a count', () => {
    expect(formatAmount(3, 'piece', 'us')).toBe('3');
  });
});

describe('formatQty', () => {
  it('rounds spoons and cups to quarters', () => {
    expect(formatQty(1.25, 'tbsp', 'en')).toBe('1¼ tbsp');
    expect(formatQty(2.5, 'cup', 'en')).toBe('2½ cups');
    expect(formatQty(1, 'cup', 'en')).toBe('1 cup');
  });

  it('rounds metric weights to whole numbers', () => {
    expect(formatQty(312.5, 'g', 'fr')).toBe('313 g');
  });

  it('keeps one decimal for small metric amounts', () => {
    expect(formatQty(1.25, 'l', 'fr')).toBe('1,3 l');
  });

  it('keeps a point in English', () => {
    expect(formatQty(1.5, 'kg', 'en')).toBe('1.5 kg');
  });

  it('uses French spoon names', () => {
    expect(formatQty(2, 'tsp', 'fr')).toBe('2 c. à c.');
  });

  it('writes pieces and lines without a unit as a count', () => {
    expect(formatQty(3.75, 'piece', 'en')).toBe('3¾');
    expect(formatQty(2, null, 'en')).toBe('2');
  });
});
