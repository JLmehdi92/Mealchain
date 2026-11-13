import { mergeChecks } from './merge';

const check = (itemId: string, checked: boolean, updatedAt: number) => ({ itemId, checked, updatedAt });

describe('mergeChecks', () => {
  it('applies remote ticks that are newer than the device or unknown to it', () => {
    const { apply } = mergeChecks([check('egg', false, 1), check('leek', true, 1)], [check('egg', true, 2), check('leek', true, 2), check('feta', true, 1)]);
    expect(apply).toEqual([check('egg', true, 2), check('feta', true, 1)]);
  });

  it('keeps a newer device tick and pushes it instead of taking the older remote one', () => {
    const { apply, push } = mergeChecks([check('egg', false, 5)], [check('egg', true, 3)]);
    expect(apply).toEqual([]);
    expect(push).toEqual([check('egg', false, 5)]);
  });

  it('pushes device ticks the household has never seen', () => {
    const { push } = mergeChecks([check('egg', true, 1), check('leek', false, 1)], [check('egg', false, 2)]);
    expect(push).toEqual([check('leek', false, 1)]);
  });

  it('takes the remote value on a tie', () => {
    expect(mergeChecks([check('egg', false, 4)], [check('egg', true, 4)])).toEqual({ apply: [check('egg', true, 4)], push: [] });
  });

  it('does nothing when both agree', () => {
    expect(mergeChecks([check('egg', true, 1)], [check('egg', true, 9)])).toEqual({ apply: [], push: [] });
  });
});
