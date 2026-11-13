import { clearSwapped, markSwapped, swappedSlot } from './swapped';

describe('swapped slot', () => {
  afterEach(clearSwapped);

  it('starts with nothing swapped', () => {
    expect(swappedSlot()).toBeNull();
  });

  it('remembers the last swapped slot', () => {
    markSwapped(2);
    markSwapped(4);
    expect(swappedSlot()).toBe(4);
  });

  it('forgets it once cleared', () => {
    markSwapped(2);
    clearSwapped();
    expect(swappedSlot()).toBeNull();
  });
});
