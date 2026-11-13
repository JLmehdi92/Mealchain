import { z } from 'zod';

import { mergeChecks, type Check } from '@/features/list/merge';

import { getChecks, getSetting, setCheck } from './db/repo';
import { report } from './monitoring';
import { supabase } from './supabase';

const row = z.object({ ingredient_id: z.string(), week_start: z.string(), checked: z.boolean(), updated_at: z.iso.datetime({ offset: true }) });
type Row = z.infer<typeof row>;
const millis = (iso: string) => Date.parse(iso.replace(/(\.\d{3})\d+/, '$1')) || 0;
const checkOf = (r: Row): Check => ({ itemId: r.ingredient_id, checked: r.checked, updatedAt: millis(r.updated_at) });

export async function sharedHousehold(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? getSetting('remote_household') : null;
}

export async function pushChecks(householdId: string, weekStart: string, checks: Check[]) {
  if (!supabase || checks.length === 0) return;
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.from('shopping_items').upsert(
    checks.map(({ itemId, checked, updatedAt }) => ({
      id: `${weekStart}:${itemId}`,
      household_id: householdId,
      week_start: weekStart,
      ingredient_id: itemId,
      checked,
      checked_by: data.session?.user.id ?? null,
      updated_at: new Date(updatedAt).toISOString(),
    })),
  );
  if (error) throw error;
}

export async function pullChecks(householdId: string, weekStart: string): Promise<Check[]> {
  if (!supabase) return [];
  const local = await getChecks(weekStart);
  const { data, error } = await supabase
    .from('shopping_items')
    .select('ingredient_id, week_start, checked, updated_at')
    .eq('household_id', householdId)
    .eq('week_start', weekStart);
  if (error) throw error;
  const { apply, push } = mergeChecks(local, z.array(row).parse(data).map(checkOf));
  await Promise.all(apply.map((check) => setCheck(weekStart, check.itemId, check.checked, check.updatedAt)));
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
        const check = checkOf(parsed.data);
        setCheck(weekStart, check.itemId, check.checked, check.updatedAt)
          .then(() => onCheck(check))
          .catch(report);
      },
    )
    .subscribe();
  return () => {
    client.removeChannel(channel);
  };
}
