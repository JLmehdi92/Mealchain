import type { CONTAINERS } from './schema';

export type Container = (typeof CONTAINERS)[number];

export type Pack = { amount: number; container: Container };
export type PackItem = { pack: Pack; count: number };
export type PackChoice = { items: PackItem[]; total: number; leftover: number };

type Candidate = { counts: number[]; total: number; packCount: number };

const isBetter = (a: Candidate, b: Candidate | null) =>
  b === null || a.total < b.total || (a.total === b.total && a.packCount < b.packCount);

export function roundToPacks(need: number, packs: Pack[]): PackChoice | null {
  const sizes = packs.filter((p) => Number.isFinite(p.amount) && p.amount > 0).sort((a, b) => b.amount - a.amount);
  if (sizes.length === 0) return null;
  if (need <= 0) return { items: [], total: 0, leftover: 0 };

  let best: Candidate | null = null;
  const search = (index: number, counts: number[], total: number, packCount: number) => {
    if (total >= need) {
      const candidate = { counts: [...counts], total, packCount };
      if (isBetter(candidate, best)) best = candidate;
      return;
    }
    if (index === sizes.length) return;
    const size = sizes[index]!.amount;
    const max = Math.ceil((need - total) / size);
    for (let count = max; count >= 0; count -= 1) {
      counts[index] = count;
      search(index + 1, counts, total + count * size, packCount + count);
    }
    counts[index] = 0;
  };
  search(0, sizes.map(() => 0), 0, 0);

  const chosen = best as Candidate | null;
  if (chosen === null) return null;
  const items = sizes.flatMap((pack, i) => (chosen.counts[i]! > 0 ? [{ pack, count: chosen.counts[i]! }] : []));
  return { items, total: chosen.total, leftover: chosen.total - need };
}
