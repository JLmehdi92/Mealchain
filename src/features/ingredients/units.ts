import type { BASE_UNITS, UNITS } from './schema';

export type BaseUnit = (typeof BASE_UNITS)[number];
export type RecipeUnit = (typeof UNITS)[number];
export type Convertible = { baseUnit: BaseUnit; gramsPerMl?: number; gramsPerPiece?: number };

const GRAMS: Partial<Record<RecipeUnit, number>> = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 };
const MILLILITRES: Partial<Record<RecipeUnit, number>> = {
  ml: 1, cl: 10, l: 1000, tsp: 4.92892159375, tbsp: 14.78676478125, cup: 236.5882365, fl_oz: 29.5735295625,
};

function measure(qty: number, unit: RecipeUnit): { kind: BaseUnit; value: number } {
  const grams = GRAMS[unit];
  if (grams !== undefined) return { kind: 'g', value: qty * grams };
  const millilitres = MILLILITRES[unit];
  if (millilitres !== undefined) return { kind: 'ml', value: qty * millilitres };
  return { kind: 'piece', value: qty };
}

export function toBase(qty: number, unit: RecipeUnit, ing: Convertible): number | null {
  if (!Number.isFinite(qty) || qty <= 0) return null;
  const amount = measure(qty, unit);
  if (amount.kind === ing.baseUnit) return amount.value;
  const gramsPer: Record<BaseUnit, number | undefined> = { g: 1, ml: ing.gramsPerMl, piece: ing.gramsPerPiece };
  const from = gramsPer[amount.kind];
  const to = gramsPer[ing.baseUnit];
  return from && to ? (amount.value * from) / to : null;
}
