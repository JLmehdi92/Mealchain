import type { Market } from '../ingredients/schema';
import type { BaseUnit, RecipeUnit } from '../ingredients/units';

type Language = 'en' | 'fr';

const FRACTION = ['', '¼', '½', '¾'];
const ML_PER_FL_OZ = 29.5735295625;
const G_PER_OZ = 28.349523125;
const METRIC = new Set<RecipeUnit>(['g', 'kg', 'ml', 'cl', 'l']);
const LABELS: Record<Language, Record<RecipeUnit, string>> = {
  en: { g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', ml: 'ml', cl: 'cl', l: 'l', tsp: 'tsp', tbsp: 'tbsp', cup: 'cup', fl_oz: 'fl oz', piece: '' },
  fr: { g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', ml: 'ml', cl: 'cl', l: 'l', tsp: 'c. à c.', tbsp: 'c. à s.', cup: 'tasse', fl_oz: 'fl oz', piece: '' },
};

export function quarters(n: number): string {
  const total = Math.max(1, Math.round(n * 4));
  const whole = Math.floor(total / 4);
  return `${whole > 0 ? whole : ''}${FRACTION[total % 4]}`;
}

const decimal = (n: number, comma: boolean) => {
  const text = n >= 10 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
  return comma ? text.replace('.', ',') : text;
};

export function formatAmount(amount: number, baseUnit: BaseUnit, market: Market): string {
  if (baseUnit === 'piece') return quarters(amount);
  if (baseUnit === 'ml') return market === 'us' ? `${quarters(amount / ML_PER_FL_OZ)} fl oz` : `${Math.round(amount)} ml`;
  if (market === 'fr') return amount >= 1000 ? `${decimal(amount / 1000, true)} kg` : `${Math.round(amount)} g`;
  const oz = amount / G_PER_OZ;
  return oz >= 16 ? `${quarters(oz / 16)} lb` : `${quarters(oz)} oz`;
}

export function formatQty(qty: number, unit: RecipeUnit | null, lang: Language): string {
  if (unit === null || unit === 'piece') return quarters(qty);
  const label = unit === 'cup' && lang === 'en' && qty > 1 ? 'cups' : LABELS[lang][unit];
  return `${METRIC.has(unit) ? decimal(qty, lang === 'fr') : quarters(qty)} ${label}`;
}
