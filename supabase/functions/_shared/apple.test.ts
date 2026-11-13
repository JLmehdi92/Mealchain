import { appleClientSecret, appleConfig, exchangeCode, revokeToken } from './apple';

const fromBase64Url = (part: string) => Uint8Array.from(atob(part.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const decodeJson = (part: string) => JSON.parse(new TextDecoder().decode(fromBase64Url(part)));
const toBase64Url = (value: unknown) => btoa(JSON.stringify(value)).replace(/=+$/, '');

let keys: CryptoKeyPair;
let pem: string;
const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

beforeAll(async () => {
  keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keys.privateKey));
  pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...der))}\n-----END PRIVATE KEY-----`;
});
beforeEach(() => fetchMock.mockReset());

const config = () => ({ teamId: 'TEAM', keyId: 'KEY', privateKey: pem, clientId: 'app.demidemi.ios' });

describe('appleConfig', () => {
  const env: Record<string, string> = { APPLE_TEAM_ID: 'T', APPLE_KEY_ID: 'K', APPLE_PRIVATE_KEY: 'P', APPLE_CLIENT_ID: 'C' };

  it('reads the four secrets', () => {
    expect(appleConfig((name) => env[name])).toEqual({ teamId: 'T', keyId: 'K', privateKey: 'P', clientId: 'C' });
  });

  it('is absent when any secret is missing', () => {
    expect(appleConfig((name) => (name === 'APPLE_KEY_ID' ? undefined : env[name]))).toBeNull();
  });
});

it('signs a short-lived ES256 client secret Apple can verify', async () => {
  const [header, payload, signature] = (await appleClientSecret(config(), 1000)).split('.');
  expect(decodeJson(header!)).toEqual({ alg: 'ES256', kid: 'KEY' });
  expect(decodeJson(payload!)).toEqual({ iss: 'TEAM', iat: 1000, exp: 1300, aud: 'https://appleid.apple.com', sub: 'app.demidemi.ios' });
  const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, keys.publicKey, fromBase64Url(signature!), new TextEncoder().encode(`${header}.${payload}`));
  expect(valid).toBe(true);
});

describe('exchangeCode', () => {
  it('returns the refresh token and the Apple subject of the code', async () => {
    const idToken = `${toBase64Url({ alg: 'RS256' })}.${toBase64Url({ sub: 'apple-sub' })}.sig`;
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ refresh_token: 'r1', id_token: idToken })));
    expect(await exchangeCode(config(), 'code1')).toEqual({ refreshToken: 'r1', subject: 'apple-sub' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://appleid.apple.com/auth/token');
    expect(Object.fromEntries(init.body)).toMatchObject({ client_id: 'app.demidemi.ios', code: 'code1', grant_type: 'authorization_code' });
  });

  it.each([
    [400, { error: 'invalid_grant' }],
    [200, { refresh_token: 'r1' }],
    [200, { refresh_token: 'r1', id_token: 'not-a-jwt' }],
  ])('returns null for a %s answer without a usable token', async (status, body) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
    expect(await exchangeCode(config(), 'code1')).toBeNull();
  });
});

it.each([[200, true], [400, false]])('revokeToken reports a %s answer as %s', async (status, revoked) => {
  fetchMock.mockResolvedValue(new Response('', { status }));
  expect(await revokeToken(config(), 'r1')).toBe(revoked);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://appleid.apple.com/auth/revoke');
  expect(Object.fromEntries(init.body)).toMatchObject({ token: 'r1', token_type_hint: 'refresh_token' });
});
