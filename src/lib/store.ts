import { useSyncExternalStore } from 'react';

import type { WeekPlan } from '@/features/planner/plan';
import type { Household, Recipe } from '@/features/recipes/types';

import * as repo from './db/repo';
import { weekStartOf } from './week';

type State = {
  ready: boolean;
  household: Household | null;
  recipes: Recipe[];
  plan: WeekPlan | null;
  weekStart: string;
};

let state: State = { ready: false, household: null, recipes: [], plan: null, weekStart: weekStartOf(new Date()) };
const listeners = new Set<() => void>();

export const getState = () => state;

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

export const useReady = () => useStore((s) => s.ready);
export const useHousehold = () => useStore((s) => s.household);
export const useRecipes = () => useStore((s) => s.recipes);
export const usePlan = () => useStore((s) => s.plan);

export async function load() {
  const weekStart = weekStartOf(new Date());
  const [household, recipes, plan] = await Promise.all([repo.getHousehold(), repo.listRecipes(), repo.getPlan(weekStart)]);
  setState({ ready: true, household, recipes, plan, weekStart });
}

export async function saveHousehold(household: Household) {
  await repo.saveHousehold(household);
  setState({ household });
}

export async function saveRecipe(recipe: Recipe) {
  await repo.saveRecipe(recipe);
  const exists = state.recipes.some((r) => r.id === recipe.id);
  setState({ recipes: exists ? state.recipes.map((r) => (r.id === recipe.id ? recipe : r)) : [recipe, ...state.recipes] });
}

export async function deleteRecipe(id: string) {
  await repo.deleteRecipe(id);
  setState({ recipes: state.recipes.filter((r) => r.id !== id) });
}

export async function savePlan(plan: WeekPlan) {
  await repo.savePlan(state.weekStart, plan);
  setState({ plan });
}
