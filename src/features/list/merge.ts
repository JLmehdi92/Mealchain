export type Check = { itemId: string; checked: boolean };

export function mergeChecks(local: Record<string, boolean>, remote: Check[]): { apply: Check[]; push: Check[] } {
  const remoteIds = new Set(remote.map((check) => check.itemId));
  return {
    apply: remote.filter((check) => local[check.itemId] !== check.checked),
    push: Object.entries(local)
      .filter(([itemId]) => !remoteIds.has(itemId))
      .map(([itemId, checked]) => ({ itemId, checked })),
  };
}
