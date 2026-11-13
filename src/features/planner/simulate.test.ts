import { household, line, recipe } from './fixtures';
import { buildContext, simulate, type Log } from './simulate';

const recipes = [
  recipe('gratin', [line('heavy_cream', 10, 'cl')]),
  recipe('soup', [line('heavy_cream', 10, 'cl')]),
  recipe('steak', [line('beef_steak', 150, 'g')]),
  recipe('rest', []),
];
const run = (ids: string[], days: number[]) => {
  const log: Log = { carries: [], purchases: [] };
  return { ...simulate(ids, buildContext(recipes, household(), days), log), ...log };
};

describe('simulate', () => {
  it('carries dairy up to four days after purchase', () => {
    const result = run(['gratin', 'soup'], [0, 4]);
    expect(result.carries).toEqual([{ ingredientId: 'heavy_cream', fromSlot: 0, toSlot: 1, amount: 100 }]);
    expect(result).toMatchObject({ carried: 0.5, waste: 0, packCount: 1 });
  });

  it('does not carry cream bought Monday to Saturday: it is wasted and bought again', () => {
    const result = run(['gratin', 'rest', 'soup'], [0, 2, 5]);
    expect(result.carries).toEqual([]);
    expect(result).toMatchObject({ carried: 0, waste: 1, packCount: 2 });
    expect(result.purchases.map(({ slot }) => slot)).toEqual([0, 2]);
  });

  it('keeps meat two days only', () => {
    expect(run(['steak', 'steak'], [0, 2]).packCount).toBe(1);
    expect(run(['steak', 'steak'], [0, 3]).packCount).toBe(2);
  });

  it('treats a tiny remainder or shortfall as zero: no phantom carry, no extra pack', () => {
    const tiny = [
      recipe('almost', [line('heavy_cream', 99.999999999, 'ml')]),
      recipe('full', [line('heavy_cream', 100, 'ml')]),
      recipe('over', [line('heavy_cream', 100.0000001, 'ml')]),
    ];
    const carriesOf = (ids: string[]) => {
      const log: Log = { carries: [], purchases: [] };
      const result = simulate(ids, buildContext(tiny, household(), [0, 1, 2]), log);
      return { toSlots: log.carries.map(({ toSlot }) => toSlot), packCount: result.packCount };
    };
    expect(carriesOf(['almost', 'full', 'full'])).toEqual({ toSlots: [1], packCount: 2 });
    expect(carriesOf(['full', 'over'])).toEqual({ toSlots: [1], packCount: 1 });
  });
});
