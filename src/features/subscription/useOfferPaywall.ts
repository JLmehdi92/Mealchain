import { router } from 'expo-router';
import { useEffect } from 'react';

import { getSetting, setSetting } from '@/lib/db/repo';
import { report } from '@/lib/monitoring';

import { proEntitlement, purchasesEnabled } from './purchase';
import { shouldOfferPaywall } from './rules';
import { useCustomerInfo } from './useCustomerInfo';

export function useOfferPaywall(firstListSeen: boolean) {
  const info = useCustomerInfo();
  const known = !purchasesEnabled || info !== null;
  const pro = !!proEntitlement(info);
  useEffect(() => {
    if (!firstListSeen || !known) return;
    let alive = true;
    (async () => {
      const [planSeen, offered] = await Promise.all([getSetting('first_plan_seen'), getSetting('paywall_offered')]);
      if (!alive || offered || !shouldOfferPaywall({ firstPlanSeen: !!planSeen, firstListSeen, pro })) return;
      await setSetting('paywall_offered', 'yes');
      router.push('/paywall');
    })().catch(report);
    return () => {
      alive = false;
    };
  }, [firstListSeen, known, pro]);
}
