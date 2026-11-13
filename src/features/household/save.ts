import { getState, saveHousehold, savePlan } from '@/lib/store';

import { planWeek } from '../planner/plan';
import { rescale } from '../planner/swap';
import type { Household } from '../recipes/types';

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((item) => b.includes(item));

export const safetyChanged = (before: Household, after: Household) =>
  !sameSet(before.allergens, after.allergens) ||
  !sameSet(before.diets, after.diets) ||
  !sameSet(before.equipment, after.equipment) ||
  before.maxMinutes !== after.maxMinutes ||
  before.dinners !== after.dinners ||
  before.lunches !== after.lunches;

export async function applyHousehold(household: Household) {
  const { plan, recipes, household: before } = getState();
  await saveHousehold(household);
  if (!plan) return;
  if (!before || safetyChanged(before, household)) return savePlan(planWeek(recipes, household));
  if (before.people !== household.people || before.market !== household.market) await savePlan(rescale(plan, recipes, household));
}
