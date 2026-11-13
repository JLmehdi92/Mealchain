import Purchases from 'react-native-purchases';

import { loadPlans } from './plans';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  INTRO_ELIGIBILITY_STATUS: { INTRO_ELIGIBILITY_STATUS_ELIGIBLE: 2 },
  default: { getOfferings: jest.fn(), checkTrialOrIntroductoryPriceEligibility: jest.fn() },
}));

jest.mock('@/lib/monitoring', () => ({ report: jest.fn() }));
jest.mock('@/lib/analytics', () => ({ track: jest.fn() }));
jest.mock('@/lib/notifications', () => ({ scheduleTrialReminder: jest.fn() }));

const product = (identifier: string, priceString: string, introPrice: { price: number } | null) => ({
  identifier, priceString, pricePerMonthString: '$2.92', introPrice,
});
const offering = (intro: { price: number } | null) => ({
  current: {
    annual: { product: product('pro_yearly', '$34.99', intro) },
    monthly: { product: product('pro_monthly', '$6.99', null) },
  },
});
const eligibility = jest.mocked(Purchases.checkTrialOrIntroductoryPriceEligibility);

beforeEach(() => jest.clearAllMocks());

describe('loadPlans', () => {
  it('offers the free trial only when the App Store says this account is eligible', async () => {
    jest.mocked(Purchases.getOfferings).mockResolvedValue(offering({ price: 0 }) as never);
    eligibility.mockResolvedValue({ pro_yearly: { status: 2, description: '' } });
    const plans = await loadPlans();
    expect(eligibility).toHaveBeenCalledWith(['pro_yearly']);
    expect(plans?.map((p) => [p.id, p.price, p.perMonth, p.trial])).toEqual([
      ['yearly', '$34.99', '$2.92', true],
      ['monthly', '$6.99', null, false],
    ]);
  });

  it('shows no trial to an account that already used it', async () => {
    jest.mocked(Purchases.getOfferings).mockResolvedValue(offering({ price: 0 }) as never);
    eligibility.mockResolvedValue({ pro_yearly: { status: 1, description: '' } });
    expect((await loadPlans())?.[0]?.trial).toBe(false);
  });

  it('shows no trial when eligibility cannot be checked', async () => {
    jest.mocked(Purchases.getOfferings).mockResolvedValue(offering({ price: 0 }) as never);
    eligibility.mockRejectedValue(new Error('offline'));
    expect((await loadPlans())?.[0]?.trial).toBe(false);
  });

  it('skips the eligibility check when the product has no free intro offer', async () => {
    jest.mocked(Purchases.getOfferings).mockResolvedValue(offering(null) as never);
    expect((await loadPlans())?.[0]?.trial).toBe(false);
    expect(eligibility).not.toHaveBeenCalled();
  });

  it('returns nothing when the offering is incomplete', async () => {
    jest.mocked(Purchases.getOfferings).mockResolvedValue({ current: null } as never);
    await expect(loadPlans()).resolves.toBeNull();
  });
});
