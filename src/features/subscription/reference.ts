import type { Market } from '@/features/ingredients/schema';

import type { PlanView } from './plans';

const PRICES: Record<Market, { yearly: string; perMonth: string; monthly: string }> = {
  us: { yearly: '$34.99', perMonth: '$2.92', monthly: '$6.99' },
  fr: { yearly: '29,99 €', perMonth: '2,50 €', monthly: '5,99 €' },
};

export function referencePlans(market: Market): PlanView[] {
  const prices = PRICES[market];
  return [
    { id: 'yearly', price: prices.yearly, perMonth: prices.perMonth, trial: true },
    { id: 'monthly', price: prices.monthly, perMonth: null, trial: false },
  ];
}
