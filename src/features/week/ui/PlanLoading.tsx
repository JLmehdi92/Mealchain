import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, FadeIn, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

import type { Household } from '@/features/recipes/types';
import { Skeleton } from '@/features/recipes/ui/parts';
import { fill, language, pick } from '@/lib/i18n';
import { Caption, Secondary, Title } from '@/ui/Text';
import { EASE_OUT } from '@/ui/motion';
import { radius, space, useTheme } from '@/ui/theme';

import { dateOf, dayLabel } from '../chains';
import { weekCopy } from '../copy';

const APPEAR = FadeIn.duration(150).reduceMotion(ReduceMotion.Never);

function MealSkeleton({ day, glow }: { day: number; glow: SharedValue<number> }) {
  const c = useTheme();
  const base = Math.max(0.3, 1 - day * 0.15);
  const style = useAnimatedStyle(() => ({ opacity: base * glow.get() }));
  return (
    <Animated.View style={[styles.meal, { backgroundColor: c.sheet, borderColor: c.rule }, style]}>
      <Skeleton width={`${[70, 60, 75][day % 3]}%`} height={18} />
      <Skeleton width="40%" />
    </Animated.View>
  );
}

export function PlanLoading({ household, weekStart }: { household: Household; weekStart: string }) {
  const reduced = useReducedMotion();
  const glow = useSharedValue(1);
  useEffect(() => {
    if (reduced) glow.set(1);
    else glow.set(withRepeat(withTiming(0.55, { duration: 900, easing: EASE_OUT }), -1, true));
    return () => cancelAnimation(glow);
  }, [glow, reduced]);
  const s = pick(weekCopy);
  const days = Math.max(household.dinners, household.lunches);
  const title = household.lunches > 0 ? fill(s.planningMeals, { count: household.dinners + household.lunches }) : fill(s.planningDinners, { count: household.dinners });
  useEffect(() => AccessibilityInfo.announceForAccessibility(title), [title]);
  return (
    <Animated.View entering={APPEAR} accessible accessibilityLabel={title} accessibilityState={{ busy: true }}>
      <Title>{title}</Title>
      <Secondary muted>{s.planningSub}</Secondary>
      {Array.from({ length: days }, (_, day) => (
        <View key={day} style={styles.day}>
          <View style={styles.dayName}>
            <Caption muted>{dayLabel(weekStart, day, language(), 'short')}</Caption>
            <Caption muted>{dateOf(weekStart, day).getDate()}</Caption>
          </View>
          <MealSkeleton day={day} glow={glow} />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  day: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  dayName: { width: 44, paddingTop: space.xs },
  meal: { flex: 1, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.lg, gap: space.md },
});
