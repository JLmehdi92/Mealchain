import { isAllowedUrl, isPrivateAddress, keepVerbatim } from './guards';

describe('isPrivateAddress', () => {
  it.each(['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1'])(
    'flags %s as private', (ip) => expect(isPrivateAddress(ip)).toBe(true));

  it.each(['8.8.8.8', '172.32.0.1', '151.101.1.69', '2606:4700::1111'])(
    'allows public %s', (ip) => expect(isPrivateAddress(ip)).toBe(false));
});

describe('isAllowedUrl', () => {
  it('accepts a public https page', () => {
    expect(isAllowedUrl('https://www.example.com/recipe/42')?.hostname).toBe('www.example.com');
  });

  it.each([
    'http://example.com/recipe', 'https://localhost/x', 'https://127.0.0.1/x', 'https://[::1]/x',
    'https://169.254.169.254/latest/meta-data', 'https://user:pass@example.com', 'https://example.com:8443/x',
    'https://intranet/x', 'https://printer.local/x', 'ftp://example.com', 'not a url',
  ])('rejects %s', (url) => expect(isAllowedUrl(url)).toBeNull());
});

describe('keepVerbatim', () => {
  const source = 'Gochujang noodles\n200 g wheat noodles\n2 tbsp gochujang\nBoil the noodles. Toss with the sauce.';

  it('keeps lines that appear in the pasted text, ignoring case and spacing', () => {
    expect(keepVerbatim({ title: 'gochujang  noodles', ingredients: ['200 g wheat noodles'], steps: ['Boil the noodles.'] }, source))
      .toEqual({ title: 'gochujang  noodles', ingredients: ['200 g wheat noodles'], steps: ['Boil the noodles.'] });
  });

  it('drops anything the model invented or rewrote', () => {
    expect(keepVerbatim({ title: 'Spicy Korean Noodles', ingredients: ['2 tbsp gochujang', '1 tsp sugar'], steps: ['Cook pasta al dente.', ' '] }, source))
      .toEqual({ title: undefined, ingredients: ['2 tbsp gochujang'], steps: [] });
  });
});
