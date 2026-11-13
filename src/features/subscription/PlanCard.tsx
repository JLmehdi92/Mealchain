import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { fill, pick } from '@/lib/i18n';
import { toward } from '@/ui/motion';
import { Press } from '@/ui/Press';
import { Body, Caption, H2 } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { PAYWALL_COPY } from './copy';
import type { PlanView } from './plans';

export function PlanCard({ plan, selected, onSelect }: { plan: PlanView; selected: boolean; onSelect: () => void }) {
  const c = useTheme();
  const copy = pick(PAYWALL_COPY);
  const yearly = plan.id === 'yearly';
  const detail = yearly ? fill(plan.trial ? copy.yearlyTrial : copy.yearlyNoTrial, { perMonth: plan.perMonth ?? '' }) : copy.noTrial;
  const name = yearly ? copy.yearly : copy.monthly;
  const period = yearly ? copy.perYear : copy.perMonth;
  const reduced = useReducedMotion();
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.set(toward(reduced, selected ? 1 : 0));
  }, [on, reduced, selected]);
  const look = useAnimatedStyle(() => ({
    borderColor: interpolateColor(on.get(), [0, 1], [c.rule, c.ink]),
    backgroundColor: interpolateColor(on.get(), [0, 1], [c.paper, c.sheet]),
  }));
  return (
    <Press
      testID={`plan-${plan.id}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${name}, ${plan.price} ${period}, ${detail}`}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect();
      }}
      style={[styles.card, look]}
    >
      <View style={styles.grow}>
        <Body style={styles.name}>{name}</Body>
        {plan.perMonth || !yearly ? <Caption muted>{detail}</Caption> : null}
      </View>
      <View style={styles.price}>
        <H2 style={styles.tabular}>{plan.price}</H2>
        <Caption muted>{period}</Caption>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.lg, borderRadius: radius.card, borderWidth: 2 },
  grow: { flex: 1 },
  name: { fontWeight: '500' },
  price: { alignItems: 'flex-end' },
  tabular: { fontVariant: ['tabular-nums'] },
});
