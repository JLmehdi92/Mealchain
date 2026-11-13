import { mergeChecks } from './merge';

describe('mergeChecks', () => {
  it('applies remote ticks that differ from the device', () => {
    const { apply } = mergeChecks({ egg: false, leek: true }, [
      { itemId: 'egg', checked: true },
      { itemId: 'leek', checked: true },
      { itemId: 'feta', checked: true },
    ]);
    expect(apply).toEqual([{ itemId: 'egg', checked: true }, { itemId: 'feta', checked: true }]);
  });

  it('pushes device ticks the household has never seen', () => {
    const { push } = mergeChecks({ egg: true, leek: false }, [{ itemId: 'egg', checked: false }]);
    expect(push).toEqual([{ itemId: 'leek', checked: false }]);
  });

  it('does nothing when both agree', () => {
    expect(mergeChecks({ egg: true }, [{ itemId: 'egg', checked: true }])).toEqual({ apply: [], push: [] });
  });
});
