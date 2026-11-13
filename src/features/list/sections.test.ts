import { packsFor, ingredientById } from '../ingredients/catalog';
import type { ShoppingList } from '../planner/shopping';
import { listSections, listText } from './sections';

const eggs = { pack: packsFor(ingredientById.get('egg')!, 'fr')[0]!, count: 1 };
const cream = { pack: packsFor(ingredientById.get('heavy_cream')!, 'fr')[0]!, count: 1 };
const leek = { pack: packsFor(ingredientById.get('leek')!, 'fr')[0]!, count: 3 };

const list: ShoppingList = {
  items: [
    { ingredientId: 'heavy_cream', aisle: 'dairy', need: 200, packs: [cream], leftover: 0, usedBy: [0, 1] },
    { ingredientId: 'egg', aisle: 'dairy', need: 4, packs: [eggs], leftover: 2, usedBy: [1] },
    { ingredientId: 'leek', aisle: 'produce', need: 3, packs: [leek], leftover: 0, usedBy: [1] },
  ],
  unlisted: [{ recipeId: 'gratin', raw: 'a pinch of saffron' }],
};
const days = [0, 2];
const titles = new Map([['gratin', 'Chicken and leek gratin']]);

describe('listSections', () => {
  it('groups unchecked items by aisle in shop order', () => {
    const sections = listSections({ list, days, titles, checks: {}, market: 'fr', lang: 'en', weekStart: '2026-11-09' });
    expect(sections.aisles.map((group) => group.aisle)).toEqual(['produce', 'dairy']);
    expect(sections.aisles[1]!.rows.map((row) => row.name)).toEqual(['Heavy cream', 'Egg']);
    expect(sections.aisles[1]!.rows[0]).toMatchObject({ id: 'heavy_cream', qty: '1 carton (20 cl)', detail: 'All used · Mon, Wed', used: true, ratio: null });
    expect(sections.aisles[1]!.rows[1]).toMatchObject({ detail: '4 eggs across the week (Wed) · 2 eggs left over', used: false, ratio: 4 / 6 });
  });

  it('moves checked items to the cart', () => {
    const sections = listSections({ list, days, titles, checks: { leek: true, egg: false }, market: 'fr', lang: 'en', weekStart: '2026-11-09' });
    expect(sections.aisles.map((group) => group.aisle)).toEqual(['dairy']);
    expect(sections.cart.map((row) => row.id)).toEqual(['leek']);
    expect(sections.cart[0]!.checked).toBe(true);
  });

  it('lists lines it could not price, with their recipe, under to check', () => {
    const id = 'u:gratin:a pinch of saffron';
    const sections = listSections({ list, days, titles, checks: {}, market: 'fr', lang: 'fr', weekStart: '2026-11-09' });
    expect(sections.toCheck).toEqual([{ id, name: 'a pinch of saffron', qty: '', detail: 'Chicken and leek gratin', used: false, ratio: null, checked: false }]);
    const checked = listSections({ list, days, titles, checks: { [id]: true }, market: 'fr', lang: 'fr', weekStart: '2026-11-09' });
    expect(checked.toCheck).toEqual([]);
    expect(checked.cart.map((row) => row.id)).toEqual([id]);
  });

  it('counts the packs to buy', () => {
    expect(listSections({ list, days, titles, checks: {}, market: 'fr', lang: 'en', weekStart: '2026-11-09' }).packCount).toBe(5);
  });
});

describe('listText', () => {
  const row = (name: string, qty: string, checked = false) => ({ id: name, name, qty, detail: '', used: false, ratio: null, checked });
  it('writes unchecked items by aisle and leaves checked ones out', () => {
    const text = listText({ aisles: [{ aisle: 'dairy', rows: [row('Cream', '1 carton 20 cl')] }], toCheck: [row('Saffron', '')], cart: [row('Eggs', '1 box of 6', true)], packCount: 2 }, { dairy: 'Dairy' }, 'To check');
    expect(text).toBe('Dairy\n- Cream, 1 carton 20 cl\n\nTo check\n- Saffron');
  });
});
