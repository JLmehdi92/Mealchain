import { StyleSheet, View } from 'react-native';

import type { Household } from '@/features/recipes/types';
import { Skeleton } from '@/features/recipes/ui/parts';
import { fill, language, pick } from '@/lib/i18n';
import { Caption, Secondary, Title } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { dateOf, dayLabel } from '../chains';
import { weekCopy } from '../copy';

export function PlanLoading({ household, weekStart }: { household: Household; weekStart: string }) {
  const c = useTheme();
  const s = pick(weekCopy);
  const days = Math.max(household.dinners, household.lunches);
  const title = household.lunches > 0 ? fill(s.planningMeals, { count: household.dinners + household.lunches }) : fill(s.planningDinners, { count: household.dinners });
  return (
    <View accessible accessibilityLabel={title} accessibilityState={{ busy: true }}>
      <Title>{title}</Title>
      <Secondary muted>{s.planningSub}</Secondary>
      {Array.from({ length: days }, (_, day) => (
        <View key={day} style={styles.day}>
          <View style={styles.dayName}>
            <Caption muted>{dayLabel(weekStart, day, language(), 'short')}</Caption>
            <Caption muted>{dateOf(weekStart, day).getDate()}</Caption>
          </View>
          <View style={[styles.meal, { backgroundColor: c.sheet, borderColor: c.rule, opacity: Math.max(0.3, 1 - day * 0.15) }]}>
            <Skeleton width={`${[70, 60, 75][day % 3]}%`} height={18} />
            <Skeleton width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  dayName: { width: 44, paddingTop: space.xs },
  meal: { flex: 1, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.md },
});
