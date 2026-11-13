import { z } from 'zod';

export const ALLERGENS = ['gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs'] as const;
export const DIETS = ['vegetarian', 'vegan', 'pescatarian', 'gluten_free', 'lactose_free', 'halal', 'no_pork'] as const;
export const AISLES = ['produce', 'dairy', 'meat', 'fish', 'bakery', 'pantry', 'spices', 'condiments', 'frozen', 'drinks'] as const;
export const PROTEINS = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'egg', 'legume', 'tofu', 'cheese'] as const;
export const CONTAINERS = ['carton', 'can', 'jar', 'bottle', 'bag', 'box', 'bunch', 'pack', 'tub', 'block', 'tray', 'loose'] as const;
export const BASE_UNITS = ['g', 'ml', 'piece'] as const;
export const UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'cl', 'l', 'tsp', 'tbsp', 'cup', 'fl_oz', 'piece'] as const;

const packSchema = z.strictObject({
  size: z.number().positive(),
  unit: z.enum(UNITS),
  container: z.enum(CONTAINERS),
});

export const ingredientSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  name: z.strictObject({ en: z.string().min(1), fr: z.string().min(1) }),
  synonyms: z.strictObject({ en: z.array(z.string().min(1)), fr: z.array(z.string().min(1)) }),
  aisle: z.enum(AISLES),
  allergens: z.array(z.enum(ALLERGENS)),
  notFor: z.array(z.enum(DIETS)),
  protein: z.enum(PROTEINS).optional(),
  baseUnit: z.enum(BASE_UNITS),
  gramsPerMl: z.number().positive().optional(),
  gramsPerPiece: z.number().positive().optional(),
  packs: z.strictObject({ us: z.array(packSchema).min(1), fr: z.array(packSchema).min(1) }),
  review: z.string().min(1).optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type Allergen = (typeof ALLERGENS)[number];
export type Diet = (typeof DIETS)[number];
export type Market = 'us' | 'fr';
