import type { Language } from '@/lib/i18n';

import { ingredientById } from '../ingredients/catalog';
import { AISLES, type Market } from '../ingredients/schema';
import type { ShoppingItem, ShoppingList } from '../planner/shopping';
import { packLabel, whyLine } from './format';

type Aisle = (typeof AISLES)[number];
export type ListRow = { id: string; name: string; qty: string; detail: string; used: boolean; ratio: number | null; checked: boolean };
export type ListSections = { aisles: { aisle: Aisle; rows: ListRow[] }[]; toCheck: ListRow[]; cart: ListRow[]; packCount: number };
type Input = {
  list: ShoppingList;
  days: number[];
  titles: Map<string, string>;
  checks: Record<string, boolean>;
  market: Market;
  lang: Language;
  weekStart: string;
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function itemRow(item: ShoppingItem, { days, checks, market, lang, weekStart }: Input): ListRow {
  const ingredient = ingredientById.get(item.ingredientId);
  const usedDays = item.usedBy.map((slot) => days[slot] ?? slot);
  const why = whyLine({ ingredientId: item.ingredientId, need: item.need, leftover: item.leftover, days: usedDays, weekStart }, market, lang);
  return {
    id: item.ingredientId,
    name: capitalize(ingredient?.name[lang] ?? item.ingredientId),
    qty: ingredient ? packLabel(item.packs, ingredient, market, lang) : '',
    detail: why.text,
    used: why.used,
    ratio: why.used ? null : why.ratio,
    checked: !!checks[item.ingredientId],
  };
}

export function listSections(input: Input): ListSections {
  const { list, titles, checks } = input;
  const items = list.items.map((item) => ({ aisle: item.aisle, row: itemRow(item, input) }));
  const unlisted = list.unlisted.map(({ recipeId, raw }): ListRow => {
    const id = `u:${recipeId}:${raw}`;
    return { id, name: raw, qty: '', detail: titles.get(recipeId) ?? '', used: false, ratio: null, checked: !!checks[id] };
  });
  const aisles = AISLES.map((aisle) => ({
    aisle,
    rows: items.filter((item) => item.aisle === aisle && !item.row.checked).map((item) => item.row),
  })).filter((group) => group.rows.length > 0);
  return {
    aisles,
    toCheck: unlisted.filter((row) => !row.checked),
    cart: [...items.map((item) => item.row), ...unlisted].filter((row) => row.checked),
    packCount: list.items.reduce((sum, item) => sum + item.packs.reduce((n, p) => n + p.count, 0), 0),
  };
}

const lines = (label: string, rows: ListRow[]) =>
  rows.length ? [label, ...rows.map((row) => `- ${row.qty ? `${row.name}, ${row.qty}` : row.name}`)].join('\n') : '';

export function listText(sections: ListSections, aisleLabels: Partial<Record<Aisle, string>>, toCheckLabel: string): string {
  const groups = sections.aisles.map((group) => lines(aisleLabels[group.aisle] ?? group.aisle, group.rows.filter((row) => !row.checked)));
  return [...groups, lines(toCheckLabel, sections.toCheck.filter((row) => !row.checked))].filter(Boolean).join('\n\n');
}
