import type { WeekPlan } from '@/features/planner/plan';
import { chainsOf } from '@/features/week/chains';
import { fill } from '@/lib/i18n';

type ValueCopy = { weekValue: string; packs: string[]; dinners: string[] };

const count = (n: number, [one, many]: string[]) => `${n} ${n === 1 ? one : many}`;

export function weekValue(plan: WeekPlan | null, copy: ValueCopy): string | null {
  const packs = plan ? chainsOf(plan).length : 0;
  if (!plan || packs === 0) return null;
  return fill(copy.weekValue, { packs: count(packs, copy.packs), dinners: count(plan.slots.length, copy.dinners) });
}
