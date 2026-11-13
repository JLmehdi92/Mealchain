import { getLocales } from 'expo-localization';

import { language, market, t } from './i18n';

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));

const locale = (languageCode: string | null, regionCode: string | null) =>
  jest.mocked(getLocales).mockReturnValue([{ languageCode, regionCode } as ReturnType<typeof getLocales>[number]]);

describe('language', () => {
  it('is fr for a French device', () => {
    locale('fr', 'CA');
    expect(language()).toBe('fr');
  });

  it('is en for any other language', () => {
    locale('de', 'DE');
    expect(language()).toBe('en');
  });

  it('is en when the language is unknown', () => {
    locale(null, null);
    expect(language()).toBe('en');
  });
});

describe('market', () => {
  it.each(['FR', 'BE', 'CH', 'LU', 'MC'])('is fr for region %s', (region) => {
    locale('en', region);
    expect(market()).toBe('fr');
  });

  it('is fr for a French speaker outside those regions', () => {
    locale('fr', 'CA');
    expect(market()).toBe('fr');
  });

  it('is us otherwise', () => {
    locale('en', 'US');
    expect(market()).toBe('us');
  });
});

describe('t', () => {
  it('returns the French string on a French device', () => {
    locale('fr', 'FR');
    expect(t('tabs.week')).toBe('Semaine');
  });

  it('fills params', () => {
    locale('en', 'US');
    expect(t('onboarding.step', { current: 1, total: 3 })).toBe('1 / 3');
  });

  it('leaves a missing param visible', () => {
    locale('en', 'US');
    expect(t('onboarding.step', { current: 1 })).toBe('1 / {total}');
  });
});
