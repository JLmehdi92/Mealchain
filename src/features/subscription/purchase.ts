import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { track } from '@/lib/analytics';
import { report } from '@/lib/monitoring';
import { scheduleTrialReminder } from '@/lib/notifications';

export const ENTITLEMENT = 'pro';
const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
export const purchasesEnabled = !!apiKey;

export function initPurchases() {
  if (apiKey) Purchases.configure({ apiKey });
}

export const proEntitlement = (info: CustomerInfo | null) => info?.entitlements.active[ENTITLEMENT] ?? null;

const cancelled = (error: unknown) => typeof error === 'object' && error !== null && 'userCancelled' in error && !!error.userCancelled;

export async function purchase(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const entitlement = proEntitlement(customerInfo);
    if (!entitlement) return false;
    if (entitlement.periodType === 'TRIAL') {
      track('trial_started');
      if (entitlement.expirationDate) scheduleTrialReminder(new Date(entitlement.expirationDate)).catch(report);
    }
    return true;
  } catch (error) {
    if (cancelled(error)) return false;
    throw error;
  }
}

export async function restore(): Promise<boolean> {
  return !!proEntitlement(await Purchases.restorePurchases());
}
