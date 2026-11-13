import { z } from 'zod';

import { ALLERGENS, DIETS, UNITS } from '@/features/ingredients/schema';
import type { WeekPlan } from '@/features/planner/plan';
import { EQUIPMENT, type Household, type Recipe } from '@/features/recipes/types';

const count = z.number().int().nonnegative();
const equipment = z.array(z.enum(EQUIPMENT));

export const recipeSchema: z.ZodType<Recipe> = z.strictObject({
  id: z.string().min(1),
  title: z.string(),
  servings: z.number().positive().nullable(),
  totalMinutes: z.number().nonnegative().nullable(),
  equipment,
  ingredients: z.array(
    z.strictObject({
      raw: z.string(),
      qty: z.number().nonnegative().finite().nullable(),
      unit: z.enum(UNITS).nullable(),
      ingredientId: z.string().nullable(),
      status: z.enum(['matched', 'unmatched', 'needsReview']),
    }),
  ),
  steps: z.array(z.string()),
  source: z.enum(['web', 'caption', 'screenshot']),
  sourceUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  needsReview: z.array(z.enum(['title', 'servings', 'totalMinutes', 'ingredients', 'steps'])),
  createdAt: z.number(),
});

export const householdSchema: z.ZodType<Household> = z.strictObject({
  people: z.number().int().positive(),
  allergens: z.array(z.enum(ALLERGENS)),
  diets: z.array(z.enum(DIETS)),
  equipment,
  dinners: count,
  lunches: count,
  maxMinutes: z.number().positive().nullable(),
  market: z.enum(['us', 'fr']),
});

export const planSchema: z.ZodType<WeekPlan> = z.strictObject({
  slots: z.array(z.strictObject({ day: count, meal: z.enum(['dinner', 'lunch']), recipeId: z.string() })),
  carries: z.array(
    z.strictObject({ ingredientId: z.string(), fromSlot: count, toSlot: count, amount: z.number().nonnegative() }),
  ),
  score: z.number(),
});

export function decode<T>(schema: z.ZodType<T>, text: string): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
