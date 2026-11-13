import { roundToPacks } from './packs';

const carton = (amount: number) => ({ amount, container: 'carton' as const });

describe('roundToPacks', () => {
  it('uses one pack when the need matches it exactly', () => {
    expect(roundToPacks(200, [carton(200), carton(500)])).toEqual({
      items: [{ pack: carton(200), count: 1 }], total: 200, leftover: 0,
    });
  });

  it('rounds up to the smallest total that covers the need', () => {
    expect(roundToPacks(250, [carton(200), carton(500)])).toEqual({
      items: [{ pack: carton(200), count: 2 }], total: 400, leftover: 150,
    });
  });

  it('prefers the combination that wastes the least', () => {
    expect(roundToPacks(700, [carton(200), carton(500)])).toEqual({
      items: [{ pack: carton(500), count: 1 }, { pack: carton(200), count: 1 }], total: 700, leftover: 0,
    });
  });

  it('breaks a waste tie with fewer packs', () => {
    expect(roundToPacks(400, [carton(200), carton(400)])).toEqual({
      items: [{ pack: carton(400), count: 1 }], total: 400, leftover: 0,
    });
  });

  it('does not buy an extra pack because of floating-point drift', () => {
    expect(roundToPacks(0.1 + 0.2, [carton(0.3)])?.items).toEqual([{ pack: carton(0.3), count: 1 }]);
    expect(roundToPacks((236.5882365 / 3) * 3, [carton(236.5882365)])?.leftover).toBe(0);
  });

  it('returns nothing to buy for a zero need', () => {
    expect(roundToPacks(0, [carton(200)])).toEqual({ items: [], total: 0, leftover: 0 });
  });

  it('returns null when no pack size is known', () => {
    expect(roundToPacks(100, [])).toBeNull();
  });

  it('ignores invalid pack sizes', () => {
    expect(roundToPacks(100, [carton(0), carton(-5)])).toBeNull();
  });

  it('handles large needs with small packs without blowing up', () => {
    const result = roundToPacks(5000, [carton(100), carton(250), carton(500), carton(1000)]);
    expect(result?.leftover).toBe(0);
    expect(result?.items).toEqual([{ pack: carton(1000), count: 5 }]);
  });
});
