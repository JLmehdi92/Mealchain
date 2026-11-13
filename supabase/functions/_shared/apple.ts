export type AppleConfig = { teamId: string; keyId: string; privateKey: string; clientId: string };

export function appleConfig(read: (name: string) => string | undefined): AppleConfig | null {
  const [teamId, keyId, privateKey, clientId] = ['APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY', 'APPLE_CLIENT_ID'].map(read);
  return teamId && keyId && privateKey && clientId ? { teamId, keyId, privateKey, clientId } : null;
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const encodeJson = (value: unknown) => base64Url(new TextEncoder().encode(JSON.stringify(value)));

function signingKey(pem: string) {
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----|\s/g, '')), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

export async function appleClientSecret(config: AppleConfig, nowSeconds: number): Promise<string> {
  const header = encodeJson({ alg: 'ES256', kid: config.keyId });
  const claims = encodeJson({ iss: config.teamId, iat: nowSeconds, exp: nowSeconds + 300, aud: 'https://appleid.apple.com', sub: config.clientId });
  const key = await signingKey(config.privateKey);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${header}.${claims}`));
  return `${header}.${claims}.${base64Url(new Uint8Array(signature))}`;
}

async function post(path: 'token' | 'revoke', config: AppleConfig, fields: Record<string, string>) {
  const clientSecret = await appleClientSecret(config, Math.floor(Date.now() / 1000));
  return fetch(`https://appleid.apple.com/auth/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: clientSecret, ...fields }),
    signal: AbortSignal.timeout(8000),
  });
}

function text(value: unknown, key: string): string | null {
  const field = typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined;
  return typeof field === 'string' ? field : null;
}

// The id_token comes straight from Apple over TLS in this response, so its subject is read without
// re-verifying the signature.
function subjectOf(idToken: string): string | null {
  try {
    return text(JSON.parse(atob(idToken.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))), 'sub');
  } catch {
    return null;
  }
}

export async function exchangeCode(config: AppleConfig, code: string): Promise<{ refreshToken: string; subject: string } | null> {
  const res = await post('token', config, { code, grant_type: 'authorization_code' });
  const body: unknown = await res.json().catch(() => null);
  const refreshToken = text(body, 'refresh_token');
  const idToken = text(body, 'id_token');
  const subject = idToken ? subjectOf(idToken) : null;
  return res.ok && refreshToken && subject ? { refreshToken, subject } : null;
}

export async function revokeToken(config: AppleConfig, token: string): Promise<boolean> {
  const res = await post('revoke', config, { token, token_type_hint: 'refresh_token' });
  return res.ok;
}
