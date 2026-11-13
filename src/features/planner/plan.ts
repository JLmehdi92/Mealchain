import type { Household, Recipe } from '../recipes/types';
import { checkRecipe } from './filter';
import { buildContext, compare, scoreOf, simulate, type Carry, type Context, type Log } from './simulate';

export type Meal = 'dinner' | 'lunch';
export type Slot = { day: number; meal: Meal; recipeId: string };
export type WeekPlan = { slots: Slot[]; carries: Carry[]; score: number };
type Place = { day: number; meal: Meal };
type Scored = { ids: string[]; score: number };

const DAYS = 7;
const MAX_ROUNDS = 8;
const SHORTLIST = 20;
const EPSILON = 1e-9;

export function allowedIds(recipes: Recipe[], household: Household): string[] {
  const forbidden = new Set(recipes.filter((recipe) => !checkRecipe(recipe, household).allowed).map((recipe) => recipe.id));
  const ids = recipes.map((recipe) => recipe.id).filter((id) => !forbidden.has(id));
  return [...new Set(ids)].sort(compare);
}

function layout(household: Household): Place[] {
  return Array.from({ length: DAYS }, (_, day): Place[] => [
    ...(day < household.lunches ? [{ day, meal: 'lunch' as const }] : []),
    ...(day < household.dinners ? [{ day, meal: 'dinner' as const }] : []),
  ]).flat();
}

export function toPlan(places: Place[], ids: string[], context: Context): WeekPlan {
  const log: Log = { carries: [], purchases: [] };
  const run = simulate(ids, context, log);
  const slots = places.map((place, i) => ({ ...place, recipeId: ids[i] ?? '' }));
  return { slots, carries: log.carries, score: scoreOf(ids, context, run) };
}

function best(candidates: Iterable<string[]>, context: Context): Scored | null {
  let top: Scored | null = null;
  for (const ids of candidates) {
    const score = scoreOf(ids, context);
    if (top === null || score > top.score + EPSILON) top = { ids, score };
  }
  return top;
}

function greedy(count: number, pool: string[], context: Context): string[] {
  const chosen: string[] = [];
  for (let slot = 0; slot < count; slot += 1) {
    const fresh = pool.filter((id) => !chosen.includes(id));
    const next = best((fresh.length > 0 ? fresh : pool).map((id) => [...chosen, id]), context);
    chosen.push(next?.ids.at(-1) ?? pool[0] ?? '');
  }
  return chosen;
}

const perishables = (id: string, context: Context) =>
  (context.needs.get(id) ?? []).filter((need) => need.stock.shelfLife !== undefined).map((need) => need.ingredientId);

function candidates(ids: string[], pool: string[], shortlist: Set<string>, context: Context): string[] {
  const inPlan = new Set(ids.flatMap((id) => perishables(id, context)));
  return pool.filter((id) => shortlist.has(id) || perishables(id, context).some((ingredientId) => inPlan.has(ingredientId)));
}

function* neighbours(ids: string[], pool: string[]): Generator<string[]> {
  for (const [i, current] of ids.entries()) {
    for (const id of pool) if (id !== current) yield ids.with(i, id);
  }
  for (const [i, a] of ids.entries()) {
    for (const [j, b] of ids.entries()) if (j > i && a !== b) yield ids.with(i, b).with(j, a);
  }
}

function improve(start: string[], pool: string[], context: Context): string[] {
  const solo = pool.map((id) => ({ id, score: scoreOf([id], context) }));
  const shortlist = new Set(solo.sort((a, b) => b.score - a.score || compare(a.id, b.id)).slice(0, SHORTLIST).map(({ id }) => id));
  let current: Scored = { ids: start, score: scoreOf(start, context) };
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const next = best(neighbours(current.ids, candidates(current.ids, pool, shortlist, context)), context);
    if (next === null || next.score <= current.score + EPSILON) break;
    current = next;
  }
  return current.ids;
}

export function planWeek(recipes: Recipe[], household: Household): WeekPlan {
  const pool = allowedIds(recipes, household);
  const places = layout(household);
  if (pool.length === 0 || places.length === 0) return { slots: [], carries: [], score: 0 };
  const context = buildContext(recipes, household, places.map(({ day }) => day));
  return toPlan(places, improve(greedy(places.length, pool, context), pool, context), context);
}
