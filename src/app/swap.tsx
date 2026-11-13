import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { SwapList } from '@/features/week/ui/SwapSheet';
import { usePlan } from '@/lib/store';

export default function Swap() {
  const plan = usePlan();
  const { slot } = useLocalSearchParams<{ slot?: string }>();
  const index = Number(slot);
  const valid = Number.isInteger(index) && index >= 0 && index < (plan?.slots.length ?? 0);
  return valid ? <SwapList slot={index} onClose={router.back} /> : <Redirect href="/week" />;
}
