import { useEffect, useState } from 'react';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

import { market } from '@/lib/i18n';
import { report } from '@/lib/monitoring';

import { purchasesEnabled } from './purchase';

export type Plan = { id: 'yearly' | 'monthly'; price: string; perMonth: string | null; trial: boolean; pkg: PurchasesPackage | null };

const FALLBACK: Record<'us' | 'fr', Plan[]> = {
  us: [
    { id: 'yearly', price: '$34.99', perMonth: '$2.92', trial: true, pkg: null },
    { id: 'monthly', price: '$6.99', perMonth: null, trial: false, pkg: null },
  ],
  fr: [
    { id: 'yearly', price: '29,99 €', perMonth: '2,50 €', trial: true, pkg: null },
    { id: 'monthly', price: '5,99 €', perMonth: null, trial: false, pkg: null },
  ],
};

const fromPackage = (id: Plan['id'], pkg: PurchasesPackage): Plan => ({
  id,
  price: pkg.product.priceString,
  perMonth: id === 'yearly' ? pkg.product.pricePerMonthString : null,
  trial: pkg.product.introPrice?.price === 0,
  pkg,
});

export function usePlans(): Plan[] {
  const [plans, setPlans] = useState(() => FALLBACK[market()]);
  useEffect(() => {
    if (!purchasesEnabled) return;
    Purchases.getOfferings()
      .then(({ current }) => {
        if (current?.annual && current.monthly) setPlans([fromPackage('yearly', current.annual), fromPackage('monthly', current.monthly)]);
      })
      .catch(report);
  }, []);
  return plans;
}
