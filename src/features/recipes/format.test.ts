import { formatQty, quarters } from './format';

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
