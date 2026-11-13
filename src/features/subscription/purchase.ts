import Purchases, { PURCHASES_ERROR_CODE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { track } from '@/lib/analytics';
import { report } from '@/lib/monitoring';
import { scheduleTrialReminder } from '@/lib/notifications';

const ENTITLEMENT = 'pro';
const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
export const purchasesEnabled = !!apiKey;

export function initPurchases() {
  if (apiKey) Purchases.configure({ apiKey });
}

export const proEntitlement = (info: CustomerInfo | null) => info?.entitlements.active[ENTITLEMENT] ?? null;

const cancelled = (error: unknown) => typeof error === 'object' && error !== null && 'userCancelled' in error && !!error.userCancelled;
const pending = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR;

export async function purchase(pkg: PurchasesPackage): Promise<'active' | 'inactive' | 'pending'> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const entitlement = proEntitlement(customerInfo);
    if (!entitlement) return 'inactive';
    if (entitlement.periodType === 'TRIAL') {
      track('trial_started');
      if (entitlement.expirationDate) scheduleTrialReminder(new Date(entitlement.expirationDate)).catch(report);
    }
    return 'active';
  } catch (error) {
    if (pending(error)) return 'pending';
    if (cancelled(error)) return 'inactive';
    throw error;
  }
}

export async function restore(): Promise<boolean> {
  return !!proEntitlement(await Purchases.restorePurchases());
}

export async function linkPurchases(userId: string): Promise<void> {
  if (purchasesEnabled) await Purchases.logIn(userId);
}

export async function unlinkPurchases(): Promise<void> {
  if (purchasesEnabled) await Purchases.logOut();
}
