import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EQUIPMENT_LABELS } from '@/features/household/labels';
import { checkRecipe, type Reason } from '@/features/planner/filter';
import type { WeekPlan } from '@/features/planner/plan';
import { dayLabel } from '@/features/week/chains';
import { fill, language, pick, t } from '@/lib/i18n';
import { Press } from '@/ui/Press';
import { Tag } from '@/ui/Tag';
import { Body, Caption, H2 } from '@/ui/Text';
import { fonts, space, useTheme } from '@/ui/theme';

import { boxCopy, labels } from '../copy';
import { allergenName, mainReason, reviewCount, thumbFor } from '../meta';
import type { Household, Recipe } from '../types';
import { PackThumb } from './illustrations';

type Props = { recipe: Recipe; household: Household; plan: WeekPlan | null; weekStart: string; first: boolean };

const lookup = (table: Record<string, string>, key: string) => table[key] ?? key;

function reasonText(reason: Reason): string {
  const s = pick(boxCopy);
  const l = pick(labels);
  const [, code = ''] = reason.detail.split(':');
  switch (reason.kind) {
    case 'allergen':
      return fill(s.allergy, { name: allergenName(reason.detail, language()) });
    case 'diet':
      return lookup(l.dietConflict, code);
    case 'equipment':
      return fill(s.equipment, { name: lookup(pick(EQUIPMENT_LABELS), reason.detail).toLocaleLowerCase() });
    case 'time':
      return t('common.minutes', { n: reason.detail.split('>')[0] ?? '' });
    case 'unverified':
      return s.unverified;
  }
}

function Thumb({ recipe, household }: { recipe: Recipe; household: Household }) {
  const c = useTheme();
  const kind = thumbFor(recipe, household.market);
  return (
    <View style={[styles.thumb, { backgroundColor: c.surface }]}>
      {kind ? <PackThumb kind={kind} /> : <H2 style={{ fontFamily: fonts.display }}>{recipe.title.trim().charAt(0).toUpperCase()}</H2>}
    </View>
  );
}

export function RecipeCard({ recipe, household, plan, weekStart, first }: Props) {
  const c = useTheme();
  const s = pick(boxCopy);
  const slot = plan?.slots.find((item) => item.recipeId === recipe.id);
  const reason = mainReason(checkRecipe(recipe, household).reasons);
  const toCheck = reviewCount(recipe);
  const day = slot ? fill(s.thisWeek, { day: dayLabel(weekStart, slot.day, language(), 'short') }) : null;
  return (
    <Press
      testID={`recipe-${recipe.id}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
      highlight={c.surface}
      style={styles.card}
    >
      <Thumb recipe={recipe} household={household} />
      <View style={[styles.body, !first && { borderTopColor: c.rule, borderTopWidth: StyleSheet.hairlineWidth }]}>
        <Body style={styles.name}>{recipe.title}</Body>
        <View style={styles.meta}>
          <Caption muted>{pick(labels).source[recipe.source]}</Caption>
          {day ? <Caption muted>· {day}</Caption> : null}
          {toCheck > 0 ? <Tag kind="review" label={fill(s.toCheck, { count: toCheck })} /> : null}
          {reason ? <Tag kind="excluded" label={fill(s.leftOut, { reason: reasonText(reason) })} /> : null}
        </View>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: space.lg, minHeight: 84 },
  thumb: { width: 64, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center', paddingVertical: 10, paddingRight: space.lg },
  name: { fontWeight: '500' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, marginTop: 2 },
});
