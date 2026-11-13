import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import type { WeekPlan } from '@/features/planner/plan';
import { loadSamples } from '@/features/recipes/loadSamples';
import { BoxScene } from '@/features/recipes/ui/illustrations';
import { fill, language, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { useHousehold, usePlan, useRecipes, useWeekStart } from '@/lib/store';
import { Banner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Empty } from '@/ui/Empty';
import { Secondary, Title } from '@/ui/Text';
import { space } from '@/ui/theme';

import { chainsOf, rangeLabel } from '../chains';
import { weekCopy } from '../copy';
import { weekNotes } from '../notes';
import { PlanLoading } from './PlanLoading';
import { PlanView } from './PlanView';

type Props = { planning: boolean; composed: boolean; onPlan: () => void; onSwap: (slot: number) => void };

function summary(plan: WeekPlan, weekStart: string, lunches: number): string {
  const s = pick(weekCopy);
  const days = plan.slots.map((slot) => slot.day);
  const packs = chainsOf(plan).length;
  const meals = fill(lunches > 0 ? s.meals : s.dinners, { count: plan.slots.length });
  const finished = packs === 0 ? [] : [packs === 1 ? s.packsOne : fill(s.packs, { count: packs })];
  return [rangeLabel(weekStart, Math.min(...days), Math.max(...days), language()), meals, ...finished].join(' · ');
}

function trySamples(failed: string) {
  loadSamples(language(), Date.now(), false).catch((error: unknown) => {
    report(error);
    Alert.alert(failed);
  });
}

export function WeekContent({ planning, composed, onPlan, onSwap }: Props) {
  const s = pick(weekCopy);
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  const weekStart = useWeekStart();
  if (!household) return null;
  if (planning) return <PlanLoading household={household} weekStart={weekStart} />;
  if (plan && plan.slots.length > 0) {
    const notes = weekNotes(plan, recipes, household);
    return (
      <>
        <Title>{s.title}</Title>
        <Secondary muted>{summary(plan, weekStart, household.lunches)}</Secondary>
        {notes.allergyLeftOut.length > 0 ? <Banner icon="exclamationmark.triangle" tone="allergy">{fill(s.allergyLeftOut, { list: notes.allergyLeftOut.join(', ') })}</Banner> : null}
        {notes.repeats ? <Secondary muted>{s.repeats}</Secondary> : null}
        <PlanView plan={plan} recipes={recipes} household={household} weekStart={weekStart} animate={composed} onSwap={onSwap} onOpen={(id) => router.push({ pathname: '/recipe/[id]', params: { id } })} />
      </>
    );
  }
  if (recipes.length === 0) {
    return (
      <Empty art={<BoxScene />} title={s.noRecipes} body={s.noRecipesBody}>
        <Button label={s.import} onPress={() => router.push('/import')} />
        <Button
          testID="try-samples"
          kind="secondary"
          label={s.trySamples}
          onPress={() => trySamples(s.failed)}
        />
      </Empty>
    );
  }
  return (
    <>
      <Title>{plan ? s.nothingFits : s.title}</Title>
      <Secondary muted>{plan ? s.nothingFitsBody : fill(s.startBody, { count: recipes.length })}</Secondary>
      <View style={styles.cta}>
        <Button testID="plan-week" label={s.start} onPress={onPlan} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: space.xxl },
});
