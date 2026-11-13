import { line, recipe } from '../planner/fixtures';
import { confirmIngredient, finalize, parseCount, recipeAllergens, reviewList, uncheckedCount } from './review';

const unmatched = { raw: '1 knob secret butter', qty: 1, unit: 'piece' as const, ingredientId: null, status: 'unmatched' as const };

describe('finalize', () => {
  it('flags every field still missing', () => {
    const draft = recipe('a', [unmatched], { title: ' ', servings: null, totalMinutes: null, steps: [], needsReview: [] });
    expect(finalize(draft).needsReview).toEqual(['title', 'servings', 'totalMinutes', 'ingredients', 'steps']);
  });

  it('clears the flags the user resolved', () => {
    const draft = recipe('a', [line('egg', 2, 'piece')], { steps: ['Fry.'], needsReview: ['title', 'servings', 'totalMinutes', 'ingredients'] });
    expect(finalize(draft).needsReview).toEqual([]);
  });

  it('flags a recipe without ingredients', () => {
    expect(finalize(recipe('a', [], { steps: ['Mix.'] })).needsReview).toEqual(['ingredients']);
  });

  it('trims the title', () => {
    expect(finalize(recipe(' Dal ', [line('egg', 1, 'piece')], { steps: ['x'] })).title).toBe('Dal');
  });
});

describe('confirmIngredient', () => {
  it('records the ingredient the user chose and keeps the line as written', () => {
    const next = confirmIngredient(recipe('a', [unmatched], { steps: ['x'], needsReview: ['ingredients'] }), 0, 'butter');
    expect(next.ingredients[0]).toEqual({ ...unmatched, ingredientId: 'butter', status: 'matched' });
    expect(next.needsReview).toEqual([]);
  });
});

describe('recipeAllergens', () => {
  it('lists allergens and traces once, in label order', () => {
    const lines = [line('heavy_cream', 1, 'cup'), line('burger_bun', 1, 'piece'), unmatched];
    expect(recipeAllergens(recipe('a', lines))).toEqual(['gluten', 'eggs', 'milk', 'sesame']);
  });
});

describe('uncheckedCount', () => {
  it('counts lines not matched yet, so the screen never claims there are no allergens', () => {
    const waiting = { ...line('egg', 1, 'piece'), status: 'needsReview' as const };
    expect(uncheckedCount(recipe('a', [line('egg', 1, 'piece'), unmatched, waiting]))).toBe(2);
    expect(uncheckedCount(recipe('a', [line('egg', 1, 'piece')]))).toBe(0);
  });
});

describe('parseCount', () => {
  it.each([
    ['4', 4],
    [' 12 ', 12],
    ['', null],
    ['0', null],
    ['2.5', null],
    ['abc', null],
    ['101', null],
  ])('reads %p as %p', (text, value) => {
    expect(parseCount(text, 100)).toBe(value);
  });
});

describe('reviewList', () => {
  const names = { title: 'Name', servings: 'Serves', totalMinutes: 'Time', lines: (n: number) => `${n} ingredients` };
  it('names the flagged header fields, then counts the lines to check', () => {
    const draft = recipe('a', [line('egg', 2, 'piece'), unmatched, unmatched], { needsReview: ['servings', 'totalMinutes', 'steps'] });
    expect(reviewList(draft, names)).toBe('Serves, Time, 2 ingredients');
  });
  it('leaves out lines when every ingredient is matched', () => {
    expect(reviewList(recipe('a', [line('egg', 2, 'piece')], { needsReview: ['title'] }), names)).toBe('Name');
  });
});
