const IPV4_PRIVATE: [number, number][] = [
  [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8], [0xa9fe0000, 16], [0xac100000, 12],
  [0xc0000000, 24], [0xc0000200, 24], [0xc0a80000, 16], [0xc6120000, 15], [0xc6336400, 24], [0xcb007100, 24],
  [0xe0000000, 4], [0xf0000000, 4],
];
const IPV6_BLOCKED: [number[], number][] = [
  [[0xfc], 7], [[0xfe, 0x80], 9], [[0xff], 8], [[0x20, 0x01, 0x0d, 0xb8], 32], [[0x20, 0x01, 0, 0], 32],
  [[0, 0x64, 0xff, 0x9b, 0, 1], 48], [[1, 0, 0, 0, 0, 0, 0, 0], 64],
];
const NAT64: number[] = [0, 0x64, 0xff, 0x9b, 0, 0, 0, 0, 0, 0, 0, 0];

function ipv4ToInt(ip: string): number | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return null;
  const parts = ip.split('.').map(Number);
  if (parts.some((p) => p > 255)) return null;
  return ((parts[0]! << 24) >>> 0) + (parts[1]! << 16) + (parts[2]! << 8) + parts[3]!;
}

const isPrivateV4 = (v4: number) => IPV4_PRIVATE.some(([base, bits]) => v4 >>> (32 - bits) === base >>> (32 - bits));

function ipv6Bytes(ip: string): number[] | null {
  let text = ip.toLowerCase();
  const dotted = /^(.*:)([^:]+\.[^:]+)$/.exec(text);
  if (dotted) {
    const v4 = ipv4ToInt(dotted[2]!);
    if (v4 === null) return null;
    text = `${dotted[1]}${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 1 ? 0 : missing).fill('0'), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.flatMap((g) => [parseInt(g, 16) >> 8, parseInt(g, 16) & 0xff]);
}

const inPrefix = (bytes: number[], prefix: number[], bits: number) =>
  prefix.every((b, i) => {
    const shift = 8 - Math.min(8, bits - i * 8);
    return bytes[i]! >> shift === b >> shift;
  });

const v4At = (b: number[], i: number) => ((b[i]! << 24) >>> 0) + (b[i + 1]! << 16) + (b[i + 2]! << 8) + b[i + 3]!;

function embeddedIPv4(b: number[]): number | null {
  const mappedOrCompatible = b.slice(0, 10).every((x) => x === 0) && b[10] === b[11] && (b[10] === 0 || b[10] === 0xff);
  if (mappedOrCompatible || inPrefix(b, NAT64, 96)) return v4At(b, 12);
  if (b[0] === 0x20 && b[1] === 0x02) return v4At(b, 2);
  return null;
}

export function isPrivateAddress(ip: string): boolean {
  const v4 = ipv4ToInt(ip);
  if (v4 !== null) return isPrivateV4(v4);
  if (!ip.includes(':')) return false;
  const bytes = ipv6Bytes(ip);
  if (!bytes) return true;
  const embedded = embeddedIPv4(bytes);
  if (embedded !== null) return isPrivateV4(embedded);
  return IPV6_BLOCKED.some(([prefix, bits]) => inPrefix(bytes, prefix, bits));
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
