import { useIsFocused } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getChecks, setCheck, setSetting } from '@/lib/db/repo';
import { language } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { useHousehold, usePlan, useRecipes, useWeekStart } from '@/lib/store';
import { pullChecks, pushChecks, sharedHousehold, subscribeChecks } from '@/lib/sync';

import { buildShoppingList } from '../planner/shopping';
import type { Check } from './merge';
import { listSections } from './sections';

const asRecord = (checks: Check[]) => Object.fromEntries(checks.map((check) => [check.itemId, check.checked]));

function useChecks(weekStart: string) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const shared = useRef<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    (async () => {
      const local = await getChecks(weekStart);
      if (alive) setChecks(asRecord(local));
      const householdId = await sharedHousehold();
      if (!alive || !householdId) return;
      shared.current = householdId;
      setIsShared(true);
      unsubscribe = subscribeChecks(householdId, weekStart, ({ itemId, checked }) => alive && setChecks((prev) => ({ ...prev, [itemId]: checked })));
      const applied = await pullChecks(householdId, weekStart);
      if (alive) setChecks((prev) => ({ ...prev, ...asRecord(applied) }));
    })().catch(report);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [weekStart]);

  const toggle = (itemId: string) => {
    const check = { itemId, checked: !checks[itemId], updatedAt: Date.now() };
    setChecks((prev) => ({ ...prev, [itemId]: check.checked }));
    setCheck(weekStart, itemId, check.checked, check.updatedAt)
      .then(() => (shared.current ? pushChecks(shared.current, weekStart, [check]) : undefined))
      .catch(report);
  };
  return { checks, toggle, shared: isShared };
}

export function useShoppingList() {
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  const weekStart = useWeekStart();
  const { checks, toggle, shared } = useChecks(weekStart);
  const [listSeen, setListSeen] = useState(false);

  const list = useMemo(() => (plan && household ? buildShoppingList(plan, recipes, household) : null), [plan, recipes, household]);
  const sections = useMemo(() => {
    if (!list || !plan || !household) return null;
    const titles = new Map(recipes.map((recipe) => [recipe.id, recipe.title]));
    const days = plan.slots.map((slot) => slot.day);
    return listSections({ list, days, titles, checks, market: household.market, lang: language(), weekStart });
  }, [list, plan, recipes, household, checks, weekStart]);
  const empty = !list || list.items.length + list.unlisted.length === 0;

  // Native tabs mount every tab at launch: the list only counts as seen once its tab is on screen.
  const focused = useIsFocused();
  useEffect(() => {
    if (empty || !focused || listSeen) return;
    setSetting('first_list_seen', 'yes')
      .then(() => setListSeen(true))
      .catch(report);
  }, [empty, focused, listSeen]);

  return { sections, empty, toggle, shared, listSeen };
}
