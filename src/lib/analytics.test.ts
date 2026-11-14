import { statsDefault, statsEnabled } from './analytics';
import { getSetting } from './db/repo';
import { market } from './i18n';

jest.mock('posthog-react-native', () => jest.fn());
jest.mock('expo-sqlite/kv-store', () => ({}));
jest.mock('./db/repo', () => ({ getSetting: jest.fn(), setSetting: jest.fn() }));
jest.mock('./i18n', () => ({ market: jest.fn() }));

it.each([['us', true], ['fr', false]] as const)('anonymous stats default for market %s is %s', (m, on) => {
  expect(statsDefault(m)).toBe(on);
});

describe('statsEnabled', () => {
  it('follows the market default until the user chooses', async () => {
    jest.mocked(getSetting).mockResolvedValue(null);
    jest.mocked(market).mockReturnValue('fr');
    expect(await statsEnabled()).toBe(false);
    jest.mocked(market).mockReturnValue('us');
    expect(await statsEnabled()).toBe(true);
  });

  it('keeps the user choice over the default', async () => {
    jest.mocked(market).mockReturnValue('fr');
    jest.mocked(getSetting).mockResolvedValue('on');
    expect(await statsEnabled()).toBe(true);
    jest.mocked(market).mockReturnValue('us');
    jest.mocked(getSetting).mockResolvedValue('off');
    expect(await statsEnabled()).toBe(false);
  });
});
