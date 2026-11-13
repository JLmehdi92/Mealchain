import { useEffect, useMemo, useState } from 'react';

import { getChecks, setCheck, setSetting } from '@/lib/db/repo';
import { language } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { getState, useHousehold, usePlan, useRecipes } from '@/lib/store';
import { pullChecks, pushChecks, sharedHousehold, subscribeChecks } from '@/lib/sync';

import { buildShoppingList } from '../planner/shopping';
import { listSections } from './sections';

function useChecks(weekStart: string) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [shared, setShared] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    (async () => {
      const local = await getChecks(weekStart);
      if (alive) setChecks(local);
      const householdId = await sharedHousehold();
      if (!alive || !householdId) return;
      setShared(householdId);
      unsubscribe = subscribeChecks(householdId, weekStart, ({ itemId, checked }) => setChecks((prev) => ({ ...prev, [itemId]: checked })));
      const applied = await pullChecks(householdId, weekStart, local);
      if (alive) setChecks((prev) => ({ ...prev, ...Object.fromEntries(applied.map((c) => [c.itemId, c.checked])) }));
    })().catch(report);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [weekStart]);

  const toggle = (itemId: string) => {
    setChecks((prev) => {
      const checked = !prev[itemId];
      setCheck(weekStart, itemId, checked)
        .then(() => (shared ? pushChecks(shared, weekStart, [{ itemId, checked }]) : undefined))
        .catch(report);
      return { ...prev, [itemId]: checked };
    });
  };
  return { checks, toggle, shared: !!shared };
}

export function useShoppingList() {
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  const { weekStart } = getState();
  const { checks, toggle, shared } = useChecks(weekStart);
  const [listSeen, setListSeen] = useState(false);

  const list = useMemo(() => (plan && household ? buildShoppingList(plan, recipes, household) : null), [plan, recipes, household]);
  const sections = useMemo(() => {
    if (!list || !plan || !household) return null;
    const titles = new Map(recipes.map((recipe) => [recipe.id, recipe.title]));
    const days = plan.slots.map((slot) => slot.day);
    return listSections({ list, days, titles, checks, market: household.market, lang: language() });
  }, [list, plan, recipes, household, checks]);
  const empty = !list || list.items.length + list.unlisted.length === 0;

  useEffect(() => {
    if (empty) return;
    setSetting('first_list_seen', 'yes')
      .then(() => setListSeen(true))
      .catch(report);
  }, [empty]);

  return { sections, empty, toggle, shared, listSeen };
}
