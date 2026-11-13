export type Check = { itemId: string; checked: boolean; updatedAt: number };

export function mergeChecks(local: Check[], remote: Check[]): { apply: Check[]; push: Check[] } {
  const localById = new Map(local.map((check) => [check.itemId, check]));
  const remoteById = new Map(remote.map((check) => [check.itemId, check]));
  return {
    apply: remote.filter((r) => {
      const l = localById.get(r.itemId);
      return !l || (l.checked !== r.checked && r.updatedAt >= l.updatedAt);
    }),
    push: local.filter((l) => {
      const r = remoteById.get(l.itemId);
      return !r || (l.checked !== r.checked && l.updatedAt > r.updatedAt);
    }),
  };
}
