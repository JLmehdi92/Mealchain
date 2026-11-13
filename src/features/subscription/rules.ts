export const FREE_RECIPE_LIMIT = 15;
const DAY_MS = 86_400_000;

export const canAddRecipe = (recipeCount: number, pro: boolean) => pro || recipeCount < FREE_RECIPE_LIMIT;

export const canPlanWeek = (plannedWeeks: string[], weekStart: string, pro: boolean) =>
  pro || plannedWeeks.every((week) => week === weekStart);

export function trialReminderAt(trialEnd: Date, now: Date): Date | null {
  const at = new Date(trialEnd.getTime() - 2 * DAY_MS);
  return at > now ? at : null;
}
