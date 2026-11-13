import { useCallback, useEffect, useState } from 'react';
import Purchases, { INTRO_ELIGIBILITY_STATUS, type PurchasesPackage } from 'react-native-purchases';

import { report } from '@/lib/monitoring';

import { purchasesEnabled } from './purchase';

export type Plan = { id: 'yearly' | 'monthly'; price: string; perMonth: string | null; trial: boolean; pkg: PurchasesPackage };
export type Offer = { status: 'loading' | 'failed' | 'unavailable' } | { status: 'ready'; plans: Plan[] };

async function trialEligible(pkg: PurchasesPackage): Promise<boolean> {
  if (pkg.product.introPrice?.price !== 0) return false;
  const id = pkg.product.identifier;
  const status = await Purchases.checkTrialOrIntroductoryPriceEligibility([id]).then((result) => result[id]?.status, () => undefined);
  return status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
}

export async function loadPlans(): Promise<Plan[] | null> {
  const { current } = await Purchases.getOfferings();
  if (!current?.annual || !current.monthly) return null;
  const { annual, monthly } = current;
  return [
    { id: 'yearly', price: annual.product.priceString, perMonth: annual.product.pricePerMonthString, trial: await trialEligible(annual), pkg: annual },
    { id: 'monthly', price: monthly.product.priceString, perMonth: null, trial: false, pkg: monthly },
  ];
}

export function usePlans(): { offer: Offer; retry: () => void } {
  const [offer, setOffer] = useState<Offer>({ status: purchasesEnabled ? 'loading' : 'unavailable' });
  const fetchPlans = useCallback(() => {
    if (!purchasesEnabled) return () => {};
    let alive = true;
    loadPlans()
      .then((plans) => alive && setOffer(plans ? { status: 'ready', plans } : { status: 'failed' }))
      .catch((error: unknown) => {
        report(error);
        if (alive) setOffer({ status: 'failed' });
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(fetchPlans, [fetchPlans]);
  const retry = () => {
    setOffer({ status: 'loading' });
    fetchPlans();
  };
  return { offer, retry };
}
