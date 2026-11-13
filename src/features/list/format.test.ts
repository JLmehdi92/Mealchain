import { ingredientById, packsFor } from '../ingredients/catalog';
import type { Ingredient, Market } from '../ingredients/schema';
import { amountLabel, packLabel, whyLine } from './format';

const ing = (id: string): Ingredient => ingredientById.get(id)!;
const pack = (id: string, market: Market, index: number, count = 1) => ({ pack: packsFor(ing(id), market)[index]!, count });

describe('packLabel', () => {
  it('names the container and the size in English', () => {
    expect(packLabel([pack('heavy_cream', 'us', 0)], ing('heavy_cream'), 'us', 'en')).toBe('1 carton (8 fl oz)');
    expect(packLabel([pack('coconut_milk', 'us', 0, 2)], ing('coconut_milk'), 'us', 'en')).toBe('2 cans (13.5 fl oz)');
  });

  it('names the container and the size in French, with a decimal comma', () => {
    expect(packLabel([pack('heavy_cream', 'fr', 0)], ing('heavy_cream'), 'fr', 'fr')).toBe('1 brique 20 cl');
    expect(packLabel([pack('coconut_milk', 'us', 0)], ing('coconut_milk'), 'us', 'fr')).toBe('1 boîte 13,5 fl oz');
  });

  it('counts pieces in a box instead of giving a size', () => {
    expect(packLabel([pack('egg', 'fr', 0)], ing('egg'), 'fr', 'en')).toBe('1 box of 6');
    expect(packLabel([pack('egg', 'fr', 0)], ing('egg'), 'fr', 'fr')).toBe('1 boîte de 6');
  });

  it('gives loose items as a whole count', () => {
    expect(packLabel([pack('lemon', 'fr', 0, 3)], ing('lemon'), 'fr', 'en')).toBe('3');
  });

  it('uses irregular plurals', () => {
    expect(packLabel([pack('egg', 'fr', 1, 2)], ing('egg'), 'fr', 'en')).toBe('2 boxes of 12');
    expect(packLabel([pack('green_olives', 'fr', 0, 2)], ing('green_olives'), 'fr', 'fr')).toBe('2 bocaux 160 g');
  });

  it('joins several pack sizes', () => {
    const items = [pack('heavy_cream', 'fr', 1), pack('heavy_cream', 'fr', 0)];
    expect(packLabel(items, ing('heavy_cream'), 'fr', 'fr')).toBe('1 brique 50 cl + 1 brique 20 cl');
  });

  it('falls back to the amount when the pack is not in the catalogue', () => {
    expect(packLabel([{ pack: { amount: 300, container: 'tub' }, count: 1 }], ing('feta'), 'fr', 'en')).toBe('300 g');
  });
});

describe('amountLabel', () => {
  it('rounds metric amounts and switches to kg and l', () => {
    expect(amountLabel(350.4, ing('feta'), 'fr', 'en')).toBe('350 g');
    expect(amountLabel(1500, ing('feta'), 'fr', 'fr')).toBe('1,5 kg');
    expect(amountLabel(1200, ing('heavy_cream'), 'fr', 'en')).toBe('1.2 l');
    expect(amountLabel(120, ing('heavy_cream'), 'fr', 'en')).toBe('120 ml');
  });

  it('converts to US units', () => {
    expect(amountLabel(118.29, ing('heavy_cream'), 'us', 'en')).toBe('4 fl oz');
    expect(amountLabel(340.2, ing('feta'), 'us', 'en')).toBe('12 oz');
    expect(amountLabel(56.7, ing('feta'), 'us', 'en')).toBe('2 oz');
  });

  it('never shows a fraction of a piece', () => {
    expect(amountLabel(0.64, ing('egg'), 'fr', 'en')).toBe('1');
  });
});

describe('whyLine', () => {
  it('says the pack is all used, on which days', () => {
    const line = whyLine({ ingredientId: 'heavy_cream', need: 200, leftover: 0, days: [2, 0, 2], weekStart: '2026-11-09' }, 'fr', 'en');
    expect(line).toEqual({ text: 'All used · Mon, Wed', used: true, ratio: 1 });
    expect(whyLine({ ingredientId: 'heavy_cream', need: 200, leftover: 0, days: [0], weekStart: '2026-11-09' }, 'fr', 'fr').text).toBe('Tout utilisé · lun.');
  });

  it('rounds pieces up and shows what is left', () => {
    const line = whyLine({ ingredientId: 'egg', need: 3.36, leftover: 2.64, days: [4], weekStart: '2026-11-09' }, 'fr', 'en');
    expect(line).toEqual({ text: '4 for Fri · 2 left over', used: false, ratio: 4 / 6 });
    expect(whyLine({ ingredientId: 'egg', need: 3.36, leftover: 2.64, days: [4], weekStart: '2026-11-09' }, 'fr', 'fr').text).toBe('4 pour ven. · reste 2');
  });

  it('treats a leftover under a whole piece as all used', () => {
    expect(whyLine({ ingredientId: 'egg', need: 5.5, leftover: 0.5, days: [1], weekStart: '2026-11-09' }, 'fr', 'en').used).toBe(true);
  });

  it('shows a measured leftover with its unit', () => {
    const line = whyLine({ ingredientId: 'feta', need: 150, leftover: 50, days: [6, 5], weekStart: '2026-11-09' }, 'fr', 'en');
    expect(line.text).toBe('150 g for Sat, Sun · 50 g left over');
    expect(line.ratio).toBeCloseTo(0.75);
  });

  it('treats a leftover that rounds to nothing as all used', () => {
    expect(whyLine({ ingredientId: 'feta', need: 199.7, leftover: 0.3, days: [0], weekStart: '2026-11-09' }, 'fr', 'en').used).toBe(true);
  });

  it('handles an unknown ingredient', () => {
    expect(whyLine({ ingredientId: 'nope', need: 1, leftover: 0, days: [0], weekStart: '2026-11-09' }, 'fr', 'en').text).toBe('All used · Mon');
  });
});
