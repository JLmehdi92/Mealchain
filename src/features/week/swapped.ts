import { useSyncExternalStore } from 'react';

let slot: number | null = null;
const listeners = new Set<() => void>();

const set = (next: number | null) => {
  slot = next;
  listeners.forEach((listener) => listener());
};

export const markSwapped = (next: number) => set(next);
export const clearSwapped = () => set(null);
export const swappedSlot = () => slot;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSwappedSlot = () => useSyncExternalStore(subscribe, swappedSlot);
