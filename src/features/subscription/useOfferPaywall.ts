import { router } from 'expo-router';
import { useEffect } from 'react';

import { getSetting, setSetting } from '@/lib/db/repo';
import { report } from '@/lib/monitoring';

import { shouldOfferPaywall } from './rules';
import { usePro } from './useIsPro';

export function useOfferPaywall(firstListSeen: boolean) {
  const { known, entitlement } = usePro();
  const pro = entitlement !== null;
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
