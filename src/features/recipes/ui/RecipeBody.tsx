import { ScrollView, StyleSheet, View } from 'react-native';

import type { WeekPlan } from '@/features/planner/plan';
import { dayLabel } from '@/features/week/chains';
import { gaugeFor } from '@/features/week/gauge';
import { fill, language, pick } from '@/lib/i18n';
import { getState, useRecipes } from '@/lib/store';
import { Body, Caption, Secondary, Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { detailCopy, labels } from '../copy';
import type { Household, Recipe } from '../types';
import { CarryGauge } from './CarryGauge';
import { IngredientList } from './IngredientList';
import { Icon } from './parts';

type Props = { recipe: Recipe; household: Household; plan: WeekPlan | null; slot: number };

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Meta({ recipe, household }: { recipe: Recipe; household: Household }) {
  const c = useTheme();
  const s = pick(detailCopy);
  const serves = recipe.servings && recipe.servings !== household.people ? fill(s.scaled, { people: household.people, servings: recipe.servings }) : fill(s.serves, { people: household.people });
  const items: { icon: 'clock' | 'person.2' | 'oven' | 'frying.pan'; text: string }[] = [
    ...(recipe.totalMinutes ? [{ icon: 'clock' as const, text: fill(s.minutes, { minutes: recipe.totalMinutes }) }] : []),
    { icon: 'person.2', text: serves },
    ...recipe.equipment.map((tool) => ({ icon: tool === 'oven' ? ('oven' as const) : ('frying.pan' as const), text: pick(labels).equipment[tool] })),
  ];
  return (
    <View style={styles.meta}>
      {items.map(({ icon, text }) => (
        <View key={text} style={styles.metaItem}>
          <Icon name={icon} size={15} color={c.ink2} />
          <Secondary muted>{text}</Secondary>
        </View>
      ))}
    </View>
  );
}

export function RecipeBody({ recipe, household, plan, slot }: Props) {
  const s = pick(detailCopy);
  const recipes = useRecipes();
  const { weekStart } = getState();
  const planned = plan && slot >= 0 ? plan : null;
  const gauge = planned ? gaugeFor(planned, slot, recipes, household.people) : null;
  const day = planned ? capitalize(dayLabel(weekStart, planned.slots[slot]?.day ?? 0, language(), 'long')) : null;
  const from = pick(labels).fromSource[recipe.source];
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Caption muted>{day ? `${day} · ${from}` : capitalize(from)}</Caption>
      <Title>{recipe.title}</Title>
      <Meta recipe={recipe} household={household} />
      {gauge && planned ? <CarryGauge gauge={gauge} slot={slot} slotDays={planned.slots.map((e) => e.day)} weekStart={weekStart} market={household.market} /> : null}
      <Caption muted style={styles.section}>{s.ingredients}</Caption>
      <IngredientList lines={recipe.ingredients} factor={recipe.servings ? household.people / recipe.servings : 1} />
      <Caption muted style={styles.disclaimer}>{s.disclaimer}</Caption>
      {recipe.steps.length > 0 ? <Caption muted style={styles.section}>{s.steps}</Caption> : null}
      {recipe.steps.map((step, i) => (
        <Body key={i} style={styles.step}>{`${i + 1}. ${step}`}</Body>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl * 2, gap: space.xs },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  section: { marginTop: space.xxl, marginBottom: space.sm },
  disclaimer: { marginTop: space.md },
  step: { marginTop: space.sm },
});
