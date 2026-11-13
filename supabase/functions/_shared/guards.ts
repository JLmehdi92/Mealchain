const IPV4_PRIVATE: [number, number][] = [
  [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8], [0xa9fe0000, 16],
  [0xac100000, 12], [0xc0000000, 24], [0xc0a80000, 16], [0xc6120000, 15], [0xe0000000, 4], [0xf0000000, 4],
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return ((parts[0]! << 24) >>> 0) + (parts[1]! << 16) + (parts[2]! << 8) + parts[3]!;
}

export function isPrivateAddress(ip: string): boolean {
  const v4 = ipv4ToInt(ip.startsWith('::ffff:') ? ip.slice(7) : ip);
  if (v4 !== null) return IPV4_PRIVATE.some(([base, bits]) => (v4 >>> (32 - bits)) === (base >>> (32 - bits)));
  const v6 = ip.toLowerCase();
  return v6 === '::' || v6 === '::1' || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || /^ff/.test(v6);
}

export function isAllowedUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (url.port && url.port !== '443') return null;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.')) return null;
  if (isPrivateAddress(host)) return null;
  return url;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();

export function keepVerbatim<T extends { title?: string; ingredients: string[]; steps: string[] }>(extracted: T, source: string): T {
  const text = normalize(source);
  const inSource = (line: string) => line.trim().length > 0 && text.includes(normalize(line));
  return {
    ...extracted,
    title: extracted.title && inSource(extracted.title) ? extracted.title : undefined,
    ingredients: extracted.ingredients.filter(inSource),
    steps: extracted.steps.filter(inSource),
  };
}
