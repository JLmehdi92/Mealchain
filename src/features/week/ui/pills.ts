import { ingredientById } from '@/features/ingredients/catalog';
import type { Market } from '@/features/ingredients/schema';
import type { WeekPlan } from '@/features/planner/plan';
import { amountLabel } from '@/features/list/format';
import { thumbOfIngredient, type Thumb } from '@/features/recipes/meta';
import { fill, language, pick } from '@/lib/i18n';

import { dayLabel, usesOf, type Chain } from '../chains';
import { weekCopy } from '../copy';

export type Pill = { key: string; ingredientId: string; thumb: Thumb | null; text: string; to?: string; carry: boolean };

export const ingredientName = (id: string) => ingredientById.get(id)?.name[language()] ?? id;

export const chainThumb = (ingredientId: string, market: Market): Thumb | null => thumbOfIngredient(ingredientById.get(ingredientId), market);

export function amountOf(ingredientId: string, amount: number, market: Market): string {
  const ingredient = ingredientById.get(ingredientId);
  return ingredient ? amountLabel(amount, ingredient, market, language()) : '';
}

export const finishLabel = (chain: Chain, finishes: boolean) =>
  fill(finishes ? pick(weekCopy).finishes : pick(weekCopy).uses, { name: ingredientName(chain.ingredientId).toLocaleLowerCase() });

export function pillsFor(plan: WeekPlan, slot: number, weekStart: string, market: Market): Pill[] {
  const s = pick(weekCopy);
  const { outgoing, incoming } = usesOf(plan, slot);
  const day = (index: number) => dayLabel(weekStart, plan.slots[index]?.day ?? 0, language(), 'short');
  return [
    ...incoming.map(({ chain, finishes }) => ({ key: `in-${chain.ingredientId}`, ingredientId: chain.ingredientId, thumb: chainThumb(chain.ingredientId, market), text: finishLabel(chain, finishes), carry: false })),
    ...outgoing.map((chain) => ({
      key: `out-${chain.ingredientId}`,
      ingredientId: chain.ingredientId,
      thumb: chainThumb(chain.ingredientId, market),
      text: `${ingredientName(chain.ingredientId)} ${amountOf(chain.ingredientId, chain.amount, market)}`.trim(),
      to: fill(s.to, { days: [...new Set(chain.toSlots.map(day))].join(', ') }),
      carry: true,
    })),
  ];
}
