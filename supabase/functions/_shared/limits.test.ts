import { fitsLimits, readCapped } from './limits';

const recipe = { ingredients: ['1 egg'], steps: ['Whisk.'] };

describe('fitsLimits', () => {
  it('accepts a realistic recipe with a 600-character step', () => {
    expect(fitsLimits({ ...recipe, title: 'Dal', servings: 4, steps: ['x'.repeat(600)] })).toBe(true);
  });

  it.each([
    ['a line over 2000 characters', { ...recipe, steps: ['x'.repeat(2001)] }],
    ['a title over 2000 characters', { ...recipe, title: 'x'.repeat(2001) }],
    ['more than 200 ingredients', { ...recipe, ingredients: Array<string>(201).fill('1 egg') }],
    ['more than 200 steps', { ...recipe, steps: Array<string>(201).fill('Stir.') }],
    ['0 servings', { ...recipe, servings: 0 }],
    ['101 servings', { ...recipe, servings: 101 }],
    ['fractional servings', { ...recipe, servings: 2.5 }],
  ])('refuses %s', (_label, value) => expect(fitsLimits(value)).toBe(false));
});

describe('readCapped', () => {
  it('reads a body under the cap', async () => {
    expect(await readCapped(new Response('héllo').body, 100)).toBe('héllo');
  });

  it('gives up on a body over the cap or a missing body', async () => {
    expect(await readCapped(new Response('x'.repeat(11)).body, 10)).toBeNull();
    expect(await readCapped(null, 10)).toBeNull();
  });
});
