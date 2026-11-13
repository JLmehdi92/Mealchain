import { ingredientById } from '@/features/ingredients/catalog';
import type { Market } from '@/features/ingredients/schema';
import type { WeekPlan } from '@/features/planner/plan';
import { formatAmount } from '@/features/recipes/format';
import type { Thumb } from '@/features/recipes/meta';
import { fill, language, pick } from '@/lib/i18n';

import { dayLabel, usesOf, type Chain } from '../chains';
import { weekCopy } from '../copy';

export type Pill = { key: string; thumb: Thumb | null; text: string; to?: string; carry: boolean };

const THUMB: Record<string, Thumb> = { carton: 'carton', can: 'can', jar: 'jar', bottle: 'jar', tub: 'jar', bag: 'bag', bunch: 'bunch', tray: 'tray', block: 'block' };

export const ingredientName = (id: string) => ingredientById.get(id)?.name[language()] ?? id;

export function chainThumb(chain: Chain, market: Market): Thumb | null {
  const ingredient = ingredientById.get(chain.ingredientId);
  if (ingredient?.id === 'egg') return 'eggs';
  return THUMB[ingredient?.packs[market][0]?.container ?? ''] ?? null;
}

export function amountOf(chain: Chain, amount: number, market: Market): string {
  const ingredient = ingredientById.get(chain.ingredientId);
  return ingredient ? formatAmount(amount, ingredient.baseUnit, market) : '';
}

export const finishLabel = (chain: Chain, finishes: boolean) =>
  fill(finishes ? pick(weekCopy).finishes : pick(weekCopy).uses, { name: ingredientName(chain.ingredientId).toLowerCase() });

export function pillsFor(plan: WeekPlan, slot: number, weekStart: string, market: Market): Pill[] {
  const s = pick(weekCopy);
  const { outgoing, incoming } = usesOf(plan, slot);
  const day = (index: number) => dayLabel(weekStart, plan.slots[index]?.day ?? 0, language(), 'short');
  return [
    ...incoming.map(({ chain, finishes }) => ({ key: `in-${chain.ingredientId}`, thumb: chainThumb(chain, market), text: finishLabel(chain, finishes), carry: false })),
    ...outgoing.map((chain) => ({
      key: `out-${chain.ingredientId}`,
      thumb: chainThumb(chain, market),
      text: `${ingredientName(chain.ingredientId)} ${amountOf(chain, chain.amount, market)}`.trim(),
      to: fill(s.to, { days: [...new Set(chain.toSlots.map(day))].join(', ') }),
      carry: true,
    })),
  ];
}
