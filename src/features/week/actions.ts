import { planWeek } from '@/features/planner/plan';
import { replaceSlot } from '@/features/planner/swap';
import { canPlanWeek } from '@/features/subscription/rules';
import { trackOnce } from '@/lib/analytics';
import { db } from '@/lib/db/client';
import { setSetting } from '@/lib/db/repo';
import { plans } from '@/lib/db/schema';
import { report } from '@/lib/monitoring';
import { getState, savePlan } from '@/lib/store';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

async function plannedWeeks(): Promise<string[]> {
  const rows = await db.select({ weekStart: plans.weekStart }).from(plans);
  return rows.map((row) => row.weekStart);
}

export async function startPlan(pro: boolean): Promise<'planned' | 'paywall' | 'skipped'> {
  const { household, weekStart } = getState();
  if (!household) return 'skipped';
  if (!canPlanWeek(await plannedWeeks(), weekStart, pro)) return 'paywall';
  await nextFrame();
  const { recipes } = getState();
  await savePlan(planWeek(recipes, household));
  trackOnce('first_plan').catch(report);
  return 'planned';
}

export async function swapSlot(slot: number, recipeId: string): Promise<void> {
  const { plan, recipes, household } = getState();
  if (plan && household) await savePlan(replaceSlot(plan, slot, recipeId, recipes, household));
}

export const markPlanSeen = () => setSetting('first_plan_seen', 'yes');
