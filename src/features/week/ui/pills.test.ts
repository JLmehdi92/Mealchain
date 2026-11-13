import { amountOf } from './pills';

describe('amountOf', () => {
  it('shows a leftover worth carrying', () => {
    expect(amountOf('heavy_cream', 120, 'us')).not.toBe('');
  });
  it('hides a crumb under a tenth of a typical pack', () => {
    expect(amountOf('cherry_tomato', 3, 'us')).toBe('');
  });
});

describe('amountOf for counted items', () => {
  it('still shows two garlic cloves', () => {
    expect(amountOf('garlic', 2, 'us')).not.toBe('');
  });
});
