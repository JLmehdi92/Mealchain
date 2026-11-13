import { getState, saveHousehold, savePlan } from '@/lib/store';

import { planWeek } from '../planner/plan';
import type { Household } from '../recipes/types';

export async function applyHousehold(household: Household) {
  await saveHousehold(household);
  const { plan, recipes } = getState();
  if (plan) await savePlan(planWeek(recipes, household));
}
