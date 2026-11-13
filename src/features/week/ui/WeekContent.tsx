import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { ALLERGEN_LABELS } from '@/features/household/labels';
import type { WeekPlan } from '@/features/planner/plan';
import { loadSamples } from '@/features/recipes/loadSamples';
import type { Household, Recipe } from '@/features/recipes/types';
import { BoxScene } from '@/features/recipes/ui/illustrations';
import { useIsPro } from '@/features/subscription/useIsPro';
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
import { allergySafe, fitCount, weekNotes } from '../notes';
import { PlanLoading } from './PlanLoading';
import { PlanView } from './PlanView';
import { Ready } from './Ready';

type Props = { busy: boolean; planning: boolean; composed: boolean; onPlan: () => void; onSwap: (slot: number) => void };

function summary(plan: WeekPlan, weekStart: string, lunches: number): string {
  const s = pick(weekCopy);
  const days = plan.slots.map((slot) => slot.day);
  const packs = chainsOf(plan).length;
  const meals = fill(lunches > 0 ? s.meals : s.dinners, { count: plan.slots.length });
  const finished = packs === 0 ? [] : [packs === 1 ? s.packsOne : fill(s.packs, { count: packs })];
  return [rangeLabel(weekStart, Math.min(...days), Math.max(...days), language()), meals, ...finished].join(' · ');
}

function readyLine(plan: WeekPlan, lunches: number): string {
  const s = pick(weekCopy);
  const meals = fill(lunches > 0 ? s.meals : s.dinners, { count: plan.slots.length });
  const packs = chainsOf(plan).length;
  if (packs === 0) return `${meals}.`;
  return fill(s.ready, { meals, packs: packs === 1 ? s.packsOne : fill(s.packs, { count: packs }) });
}

function trySamples(failed: string, pro: boolean) {
  loadSamples(language(), Date.now(), pro).catch((error: unknown) => {
    report(error);
    Alert.alert(failed);
  });
}

type Planned = { plan: WeekPlan; recipes: Recipe[]; household: Household; weekStart: string; composed: boolean; onSwap: (slot: number) => void };

function PlannedWeek({ plan, recipes, household, weekStart, composed, onSwap }: Planned) {
  const s = pick(weekCopy);
  const notes = weekNotes(plan, recipes, household);
  const allergies = household.allergens.map((a) => pick(ALLERGEN_LABELS)[a].toLocaleLowerCase()).join(', ');
  return (
    <>
      <Title>{s.title}</Title>
      <Secondary muted>{summary(plan, weekStart, household.lunches)}</Secondary>
      {composed ? <Ready text={readyLine(plan, household.lunches)} /> : null}
      {notes.allergyLeftOut.length > 0 ? <Banner icon="exclamationmark.triangle" tone="allergy">{fill(s.allergyLeftOut, { list: notes.allergyLeftOut.join(', ') })}</Banner> : null}
      {notes.repeats ? <Secondary muted>{s.repeats}</Secondary> : null}
      <PlanView plan={plan} recipes={recipes} household={household} weekStart={weekStart} animate={composed} onSwap={onSwap} onOpen={(id) => router.push({ pathname: '/recipe/[id]', params: { id } })} />
      {allergySafe(plan, recipes, household) ? <Secondary testID="allergy-safe" muted>{fill(s.allergySafe, { list: allergies, count: plan.slots.length })}</Secondary> : null}
    </>
  );
}

function StartWeek({ busy, fits, needed, onPlan }: { busy: boolean; fits: number; needed: number; onPlan: () => void }) {
  const s = pick(weekCopy);
  const pro = useIsPro();
  const few = fits > 0 && fits < needed;
  return (
    <View style={styles.cta}>
      {few ? <Secondary testID="few-recipes">{fits === 1 ? s.fewRecipesOne : fill(s.fewRecipes, { count: fits })}</Secondary> : null}
      <Button testID="plan-week" label={busy ? s.composing : s.start} disabled={busy} accessibilityState={{ busy, disabled: busy }} onPress={onPlan} />
      {few ? <Button testID="add-samples" kind="secondary" label={s.addSamples} disabled={busy} onPress={() => trySamples(s.failed, pro)} /> : null}
    </View>
  );
}

export function WeekContent({ busy, planning, composed, onPlan, onSwap }: Props) {
  const s = pick(weekCopy);
  const pro = useIsPro();
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  const weekStart = useWeekStart();
  if (!household) return null;
  if (planning) return <PlanLoading household={household} weekStart={weekStart} />;
  if (plan && plan.slots.length > 0) return <PlannedWeek plan={plan} recipes={recipes} household={household} weekStart={weekStart} composed={composed} onSwap={onSwap} />;
  if (recipes.length === 0) {
    return (
      <Empty art={<BoxScene />} title={s.noRecipes} body={s.noRecipesBody}>
        <Button label={s.import} onPress={() => router.push('/import')} />
        <Button testID="try-samples" kind="secondary" label={s.trySamples} onPress={() => trySamples(s.failed, pro)} />
      </Empty>
    );
  }
  return (
    <>
      <Title>{plan ? s.nothingFits : s.title}</Title>
      <Secondary muted>{plan ? s.nothingFitsBody : fill(s.startBody, { count: recipes.length })}</Secondary>
      <StartWeek busy={busy} fits={fitCount(recipes, household)} needed={household.dinners + household.lunches} onPlan={onPlan} />
    </>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: space.xxl, gap: space.md },
});
