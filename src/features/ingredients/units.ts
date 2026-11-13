export type BaseUnit = 'g' | 'ml' | 'piece';
export type RecipeUnit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'cl' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'fl_oz' | 'piece';

export type Convertible = { baseUnit: BaseUnit; gramsPerMl?: number; gramsPerPiece?: number };

const GRAMS: Partial<Record<RecipeUnit, number>> = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 };
const MILLILITRES: Partial<Record<RecipeUnit, number>> = {
  ml: 1, cl: 10, l: 1000, tsp: 4.92892159375, tbsp: 14.78676478125, cup: 236.5882365, fl_oz: 29.5735295625,
};

type Amount = { kind: BaseUnit; value: number };

function measure(qty: number, unit: RecipeUnit): Amount {
  const grams = GRAMS[unit];
  if (grams !== undefined) return { kind: 'g', value: qty * grams };
  const millilitres = MILLILITRES[unit];
  if (millilitres !== undefined) return { kind: 'ml', value: qty * millilitres };
  return { kind: 'piece', value: qty };
}

function toGrams(amount: Amount, ing: Convertible): number | null {
  if (amount.kind === 'g') return amount.value;
  if (amount.kind === 'ml') return ing.gramsPerMl ? amount.value * ing.gramsPerMl : null;
  return ing.gramsPerPiece ? amount.value * ing.gramsPerPiece : null;
}

export function toBase(qty: number, unit: RecipeUnit, ing: Convertible): number | null {
  if (!Number.isFinite(qty) || qty <= 0) return null;
  const amount = measure(qty, unit);
  if (amount.kind === ing.baseUnit) return amount.value;
  const grams = toGrams(amount, ing);
  if (grams === null) return null;
  if (ing.baseUnit === 'g') return grams;
  if (ing.baseUnit === 'ml') return ing.gramsPerMl ? grams / ing.gramsPerMl : null;
  return ing.gramsPerPiece ? grams / ing.gramsPerPiece : null;
}
