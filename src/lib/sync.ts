import { z } from 'zod';

import { mergeChecks, type Check } from '@/features/list/merge';

import { getSetting, setCheck } from './db/repo';
import { report } from './monitoring';
import { supabase } from './supabase';

const row = z.object({ ingredient_id: z.string(), week_start: z.string(), checked: z.boolean() });

export async function sharedHousehold(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? getSetting('remote_household') : null;
}

export async function pushChecks(householdId: string, weekStart: string, checks: Check[]) {
  if (!supabase || checks.length === 0) return;
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.from('shopping_items').upsert(
    checks.map(({ itemId, checked }) => ({
      id: `${weekStart}:${itemId}`,
      household_id: householdId,
      week_start: weekStart,
      ingredient_id: itemId,
      checked,
      checked_by: data.session?.user.id ?? null,
      updated_at: new Date().toISOString(),
    })),
  );
  if (error) throw error;
}

export async function pullChecks(householdId: string, weekStart: string, local: Record<string, boolean>): Promise<Check[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('shopping_items')
    .select('ingredient_id, week_start, checked')
    .eq('household_id', householdId)
    .eq('week_start', weekStart);
  if (error) throw error;
  const remote = z.array(row).parse(data).map((r) => ({ itemId: r.ingredient_id, checked: r.checked }));
  const { apply, push } = mergeChecks(local, remote);
  await Promise.all(apply.map((check) => setCheck(weekStart, check.itemId, check.checked)));
  await pushChecks(householdId, weekStart, push);
  return apply;
}

export function subscribeChecks(householdId: string, weekStart: string, onCheck: (check: Check) => void): () => void {
  const client = supabase;
  if (!client) return () => {};
  const channel = client
    .channel(`shopping:${householdId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shopping_items', filter: `household_id=eq.${householdId}` },
      (payload) => {
        const parsed = row.safeParse(payload.new);
        if (!parsed.success || parsed.data.week_start !== weekStart) return;
        const check = { itemId: parsed.data.ingredient_id, checked: parsed.data.checked };
        setCheck(weekStart, check.itemId, check.checked)
          .then(() => onCheck(check))
          .catch(report);
      },
    )
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
