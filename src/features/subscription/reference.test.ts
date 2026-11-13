import { referencePlans } from './reference';

describe('referencePlans', () => {
  it('shows US dollar prices with the yearly trial first for the US market', () => {
    expect(referencePlans('us')).toEqual([
      { id: 'yearly', price: '$34.99', perMonth: '$2.92', trial: true },
      { id: 'monthly', price: '$6.99', perMonth: null, trial: false },
    ]);
  });

  it('shows euro prices for the French market', () => {
    expect(referencePlans('fr')).toEqual([
      { id: 'yearly', price: '29,99 €', perMonth: '2,50 €', trial: true },
      { id: 'monthly', price: '5,99 €', perMonth: null, trial: false },
    ]);
  });
});
