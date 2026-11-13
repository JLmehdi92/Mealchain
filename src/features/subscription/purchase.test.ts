import Purchases, { type PurchasesPackage } from 'react-native-purchases';

import { track } from '@/lib/analytics';
import { scheduleTrialReminder } from '@/lib/notifications';

import { linkPurchases, purchase, restore, unlinkPurchases } from './purchase';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  PURCHASES_ERROR_CODE: { PAYMENT_PENDING_ERROR: '20' },
  default: { purchasePackage: jest.fn(), restorePurchases: jest.fn(), logIn: jest.fn(), logOut: jest.fn() },
}));
jest.mock('@/lib/analytics', () => ({ track: jest.fn() }));
jest.mock('@/lib/notifications', () => ({ scheduleTrialReminder: jest.fn(() => Promise.resolve()) }));
jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));

const buy = jest.mocked(Purchases.purchasePackage);
const restorePurchases = jest.mocked(Purchases.restorePurchases);
const pkg = {} as PurchasesPackage;
const info = (pro?: { periodType: string; expirationDate: string | null }) =>
  ({ entitlements: { active: pro ? { pro } : {} } }) as never;

beforeEach(() => jest.clearAllMocks());

describe('purchase', () => {
  it('starts a trial: tracks it and schedules the reminder at the trial end', async () => {
    buy.mockResolvedValue({ customerInfo: info({ periodType: 'TRIAL', expirationDate: '2026-11-20T10:00:00Z' }) } as never);
    await expect(purchase(pkg)).resolves.toBe('active');
    expect(track).toHaveBeenCalledWith('trial_started');
    expect(scheduleTrialReminder).toHaveBeenCalledWith(new Date('2026-11-20T10:00:00Z'));
  });

  it('still reports success when the reminder cannot be scheduled', async () => {
    buy.mockResolvedValue({ customerInfo: info({ periodType: 'TRIAL', expirationDate: '2026-11-20T10:00:00Z' }) } as never);
    jest.mocked(scheduleTrialReminder).mockRejectedValueOnce(new Error('denied'));
    await expect(purchase(pkg)).resolves.toBe('active');
  });

  it('subscribes without a trial: no reminder', async () => {
    buy.mockResolvedValue({ customerInfo: info({ periodType: 'NORMAL', expirationDate: '2026-12-13T10:00:00Z' }) } as never);
    await expect(purchase(pkg)).resolves.toBe('active');
    expect(track).not.toHaveBeenCalled();
    expect(scheduleTrialReminder).not.toHaveBeenCalled();
  });

  it('is inactive when the entitlement is not granted', async () => {
    buy.mockResolvedValue({ customerInfo: info() } as never);
    await expect(purchase(pkg)).resolves.toBe('inactive');
  });

  it('is inactive when the user cancels', async () => {
    buy.mockRejectedValue({ userCancelled: true });
    await expect(purchase(pkg)).resolves.toBe('inactive');
  });

  it('is pending while Ask to Buy waits for approval', async () => {
    buy.mockRejectedValue({ code: '20', userCancelled: false });
    await expect(purchase(pkg)).resolves.toBe('pending');
  });

  it('rethrows other errors', async () => {
    buy.mockRejectedValue(new Error('network'));
    await expect(purchase(pkg)).rejects.toThrow('network');
  });
});

describe('restore', () => {
  it('says whether the entitlement came back', async () => {
    restorePurchases.mockResolvedValueOnce(info({ periodType: 'NORMAL', expirationDate: null }));
    await expect(restore()).resolves.toBe(true);
    restorePurchases.mockResolvedValueOnce(info());
    await expect(restore()).resolves.toBe(false);
  });
});

describe('linking purchases to the account', () => {
  it('does nothing while RevenueCat is not configured', async () => {
    await linkPurchases('user-1');
    await unlinkPurchases();
    expect(Purchases.logIn).not.toHaveBeenCalled();
    expect(Purchases.logOut).not.toHaveBeenCalled();
  });

  it('logs RevenueCat in with the Supabase user id and out again when configured', async () => {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = 'appl_test';
    await jest.isolateModulesAsync(async () => {
      const configured = jest.requireActual<typeof import('./purchase')>('./purchase');
      const isolated = jest.requireMock<{ default: typeof Purchases }>('react-native-purchases').default;
      await configured.linkPurchases('user-1');
      await configured.unlinkPurchases();
      expect(isolated.logIn).toHaveBeenCalledWith('user-1');
      expect(isolated.logOut).toHaveBeenCalled();
    });
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  });
});
