import { useEffect, useState } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';

import { report } from '@/lib/monitoring';

import { purchasesEnabled } from './purchase';

let latest: CustomerInfo | null = null;

export function useCustomerInfo(): CustomerInfo | null {
  const [info, setInfo] = useState<CustomerInfo | null>(latest);
  useEffect(() => {
    if (!purchasesEnabled) return;
    let alive = true;
    const listener = (value: CustomerInfo) => {
      latest = value;
      if (alive) setInfo(value);
    };
    Purchases.getCustomerInfo().then(listener).catch(report);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      alive = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);
  return info;
}
