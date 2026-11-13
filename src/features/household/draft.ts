import { useSyncExternalStore } from 'react';

import { market } from '@/lib/i18n';

import type { Household } from '../recipes/types';

export const defaultHousehold = (): Household => ({
  people: 2,
  allergens: [],
  diets: [],
  equipment: ['oven', 'stovetop', 'microwave'],
  dinners: 5,
  lunches: 0,
  maxMinutes: 45,
  market: market(),
});

let draft = defaultHousehold();
const listeners = new Set<() => void>();

export function setDraft(patch: Partial<Household>) {
  draft = { ...draft, ...patch };
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useDraft = () => useSyncExternalStore(subscribe, () => draft);
