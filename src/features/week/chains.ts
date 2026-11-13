import type { WeekPlan } from '../planner/plan';

export type Chain = { ingredientId: string; fromSlot: number; toSlots: number[]; amount: number };
type Language = 'en' | 'fr';

const LOCALE: Record<Language, string> = { en: 'en-US', fr: 'fr-FR' };

export function chainsOf(plan: WeekPlan): Chain[] {
  const chains = new Map<string, Chain>();
  for (const { ingredientId, fromSlot, toSlot, amount } of plan.carries) {
    const key = `${ingredientId}:${fromSlot}`;
    const chain = chains.get(key) ?? { ingredientId, fromSlot, toSlots: [], amount: 0 };
    chain.toSlots = [...new Set([...chain.toSlots, toSlot])].sort((a, b) => a - b);
    chain.amount += amount;
    chains.set(key, chain);
  }
  return [...chains.values()];
}

export function usesOf(plan: WeekPlan, slot: number) {
  const chains = chainsOf(plan);
  return {
    outgoing: chains.filter((chain) => chain.fromSlot === slot),
    incoming: chains.filter((chain) => chain.toSlots.includes(slot)).map((chain) => ({ chain, finishes: chain.toSlots.at(-1) === slot })),
  };
}

export function daysOf(plan: WeekPlan): { day: number; slots: number[] }[] {
  const days = new Map<number, number[]>();
  plan.slots.forEach((slot, i) => days.set(slot.day, [...(days.get(slot.day) ?? []), i]));
  return [...days.entries()].sort(([a], [b]) => a - b).map(([day, slots]) => ({ day, slots }));
}

export function dateOf(weekStart: string, day: number): Date {
  const [year = 0, month = 1, date = 1] = weekStart.split('-').map(Number);
  return new Date(year, month - 1, date + day);
}

export const dayLabel = (weekStart: string, day: number, lang: Language, weekday: 'short' | 'long') =>
  dateOf(weekStart, day).toLocaleDateString(LOCALE[lang], { weekday });

export function rangeLabel(weekStart: string, first: number, last: number, lang: Language): string {
  const [from, to] = [dateOf(weekStart, first), dateOf(weekStart, last)];
  const month = (date: Date) => date.toLocaleDateString(LOCALE[lang], { month: 'short' });
  if (from.getMonth() !== to.getMonth()) {
    const label = (date: Date) => date.toLocaleDateString(LOCALE[lang], { month: 'short', day: 'numeric' });
    return `${label(from)}–${label(to)}`;
  }
  const days = `${from.getDate()}–${to.getDate()}`;
  return lang === 'fr' ? `${days} ${month(from)}` : `${month(from)} ${days}`;
}
