import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { Body, Caption, H2 } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { PAYWALL_COPY } from './copy';
import type { Plan } from './plans';

export function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  const c = useTheme();
  const copy = pick(PAYWALL_COPY);
  const yearly = plan.id === 'yearly';
  const detail = yearly ? fill(plan.trial ? copy.yearlyTrial : copy.yearlyNoTrial, { perMonth: plan.perMonth ?? '' }) : copy.noTrial;
  const name = yearly ? copy.yearly : copy.monthly;
  const period = yearly ? copy.perYear : copy.perMonth;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${name}, ${plan.price} ${period}, ${detail}`}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect();
      }}
      style={[
        styles.card,
        selected ? { backgroundColor: c.sheet, borderColor: c.ink, borderWidth: 2 } : { backgroundColor: c.paper, borderColor: c.rule, borderWidth: 1.5 },
      ]}
    >
      <View style={styles.grow}>
        <Body style={styles.name}>{name}</Body>
        {plan.perMonth || !yearly ? <Caption muted>{detail}</Caption> : null}
      </View>
      <View style={styles.price}>
        <H2 style={styles.tabular}>{plan.price}</H2>
        <Caption muted>{period}</Caption>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.xs, padding: space.lg, borderRadius: radius.card },
  grow: { flex: 1 },
  name: { fontWeight: '500' },
  price: { alignItems: 'flex-end' },
  tabular: { fontVariant: ['tabular-nums'] },
});
