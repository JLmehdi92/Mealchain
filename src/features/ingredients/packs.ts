import type { CONTAINERS } from './schema';

export type Container = (typeof CONTAINERS)[number];
export type Pack = { amount: number; container: Container };
export type PackItem = { pack: Pack; count: number };
export type PackChoice = { items: PackItem[]; total: number; leftover: number };

type Candidate = { counts: number[]; total: number; packCount: number };

const EPSILON = 1e-9;

const isBetter = (a: Candidate, b: Candidate | null) =>
  b === null || a.total < b.total - EPSILON || (Math.abs(a.total - b.total) <= EPSILON && a.packCount < b.packCount);

function cheapest(need: number, sizes: number[]): Candidate | null {
  let best: Candidate | null = null;
  const counts = sizes.map(() => 0);
  const search = (index: number, total: number, packCount: number) => {
    if (best !== null && total > best.total + EPSILON) return;
    if (total >= need - EPSILON) {
      const candidate = { counts: [...counts], total, packCount };
      if (isBetter(candidate, best)) best = candidate;
      return;
    }
    if (index === sizes.length) return;
    const size = sizes[index]!;
    for (let count = Math.ceil((need - total) / size - EPSILON); count >= 0; count -= 1) {
      counts[index] = count;
      search(index + 1, total + count * size, packCount + count);
    }
    counts[index] = 0;
  };
  search(0, 0, 0);
  return best;
}

export function roundToPacks(need: number, packs: Pack[]): PackChoice | null {
  const sizes = packs.filter((p) => Number.isFinite(p.amount) && p.amount > 0).sort((a, b) => b.amount - a.amount);
  if (sizes.length === 0) return null;
  if (need <= 0) return { items: [], total: 0, leftover: 0 };
  const best = cheapest(need, sizes.map((p) => p.amount));
  if (best === null) return null;
  const items = sizes.flatMap((pack, i) => (best.counts[i]! > 0 ? [{ pack, count: best.counts[i]! }] : []));
  return { items, total: best.total, leftover: Math.max(0, best.total - need) };
}
