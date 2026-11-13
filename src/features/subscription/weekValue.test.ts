import { PAYWALL_COPY } from './copy';
import { weekValue } from './weekValue';

const slot = (day: number) => ({ day, meal: 'dinner' as const, recipeId: `r${day}` });
const carry = (ingredientId: string, fromSlot: number, toSlot: number) => ({ ingredientId, fromSlot, toSlot, amount: 100 });

describe('weekValue', () => {
  it('counts each pack carried across dinners once', () => {
    const plan = { slots: [0, 1, 2, 3, 4].map(slot), carries: [carry('leek', 0, 1), carry('leek', 0, 2), carry('cream', 1, 3)], score: 1 };
    expect(weekValue(plan, PAYWALL_COPY.en)).toBe('This week: 2 packs finished across your 5 dinners.');
    expect(weekValue(plan, PAYWALL_COPY.fr)).toBe('Cette semaine : 2 paquets finis grâce à vos 5 dîners.');
  });

  it('uses the singular for one pack', () => {
    const plan = { slots: [0, 1].map(slot), carries: [carry('leek', 0, 1)], score: 1 };
    expect(weekValue(plan, PAYWALL_COPY.en)).toBe('This week: 1 pack finished across your 2 dinners.');
  });

  it('shows nothing without a plan or without a finished pack', () => {
    expect(weekValue(null, PAYWALL_COPY.en)).toBeNull();
    expect(weekValue({ slots: [slot(0)], carries: [], score: 0 }, PAYWALL_COPY.en)).toBeNull();
  });
});
