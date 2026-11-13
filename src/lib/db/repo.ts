import { desc, eq } from 'drizzle-orm';

import type { WeekPlan } from '@/features/planner/plan';
import type { Household, Recipe } from '@/features/recipes/types';

import { db } from './client';
import { household, plans, recipes, settings, shoppingChecks } from './schema';
import { decode, householdSchema, planSchema, recipeSchema } from './schemas';

export type SettingKey =
  | 'ai_consent'
  | 'onboarded'
  | 'first_plan_seen'
  | 'first_list_seen'
  | 'paywall_offered'
  | 'installed'
  | 'remote_household';

export async function getHousehold(): Promise<Household | null> {
  const [row] = await db.select().from(household).where(eq(household.id, 1));
  return row ? decode(householdSchema, row.data) : null;
}

export async function saveHousehold(value: Household): Promise<void> {
  const data = JSON.stringify(householdSchema.parse(value));
  await db.insert(household).values({ id: 1, data }).onConflictDoUpdate({ target: household.id, set: { data } });
}

export async function listRecipes(): Promise<Recipe[]> {
  const rows = await db.select().from(recipes).orderBy(desc(recipes.createdAt));
  return rows.flatMap((row) => decode(recipeSchema, row.data) ?? []);
}

export async function saveRecipe(value: Recipe): Promise<void> {
  const data = JSON.stringify(recipeSchema.parse(value));
  await db
    .insert(recipes)
    .values({ id: value.id, data, createdAt: value.createdAt })
    .onConflictDoUpdate({ target: recipes.id, set: { data } });
}

export async function deleteRecipe(id: string): Promise<void> {
  await db.delete(recipes).where(eq(recipes.id, id));
}

export async function getPlan(weekStart: string): Promise<WeekPlan | null> {
  const [row] = await db.select().from(plans).where(eq(plans.weekStart, weekStart));
  return row ? decode(planSchema, row.data) : null;
}

export async function savePlan(weekStart: string, value: WeekPlan): Promise<void> {
  const data = JSON.stringify(planSchema.parse(value));
  await db.insert(plans).values({ weekStart, data }).onConflictDoUpdate({ target: plans.weekStart, set: { data } });
}

export async function getChecks(weekStart: string): Promise<Record<string, boolean>> {
  const rows = await db.select().from(shoppingChecks).where(eq(shoppingChecks.weekStart, weekStart));
  return Object.fromEntries(rows.map((row) => [row.itemId, row.checked]));
}

export async function setCheck(weekStart: string, itemId: string, checked: boolean): Promise<void> {
  const updatedAt = Date.now();
  await db
    .insert(shoppingChecks)
    .values({ weekStart, itemId, checked, updatedAt })
    .onConflictDoUpdate({ target: [shoppingChecks.weekStart, shoppingChecks.itemId], set: { checked, updatedAt } });
}

export async function getSetting(key: SettingKey): Promise<string | null> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  return row?.value ?? null;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}
