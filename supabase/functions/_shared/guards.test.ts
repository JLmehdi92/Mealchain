import { isAllowedUrl, isPrivateAddress, keepVerbatim } from './guards';

describe('isPrivateAddress', () => {
  it.each(['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1'])(
    'flags %s as private', (ip) => expect(isPrivateAddress(ip)).toBe(true));

  it.each([
    '192.0.2.1', '198.51.100.7', '203.0.113.9', '198.18.0.1', '198.19.255.255', '255.255.255.255',
    '::', '0:0:0:0:0:0:0:1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::FFFF:A9FE:A9FE', '::127.0.0.1',
    '64:ff9b::a00:1', '64:ff9b::7f00:1', '64:ff9b:1::8.8.8.8', '2002:a00:1::1', '2002:c0a8:101::',
    'fec0::1', 'feff::1', 'ff02::1', '2001:db8::1', '2001:0:4136:e378::1', '100::1',
  ])('flags %s as private, including IPv4 hidden inside IPv6', (ip) => expect(isPrivateAddress(ip)).toBe(true));

  it.each(['1::2::3', '12345::1', '1:2:3:4:5:6:7', '1:2:3:4:5:6:7:8:9', '::ffff:999.0.0.1', 'gg::1'])(
    'treats the malformed address %s as private', (ip) => expect(isPrivateAddress(ip)).toBe(true));

  it.each(['8.8.8.8', '172.32.0.1', '151.101.1.69', '2606:4700::1111', '::ffff:8.8.8.8', '64:ff9b::808:808', '2002:808:808::1', '2001:4860:4860::8888'])(
    'allows public %s', (ip) => expect(isPrivateAddress(ip)).toBe(false));

  it('leaves host names to DNS', () => expect(isPrivateAddress('example.com')).toBe(false));
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
