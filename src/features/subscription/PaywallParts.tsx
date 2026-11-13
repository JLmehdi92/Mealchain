import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Body, Caption, Secondary } from '@/ui/Text';
import { space, touch, useTheme } from '@/ui/theme';

import { restoreWithFeedback } from './actions';
import { PAYWALL_COPY } from './copy';
import type { Plan } from './plans';

export function PaywallNav() {
  const c = useTheme();
  const copy = pick(PAYWALL_COPY);
  return (
    <View style={styles.nav}>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.close} onPress={() => router.back()} style={styles.navButton}>
        <View style={[styles.close, { backgroundColor: c.surface }]}>
          <SymbolView name="xmark" size={14} weight="semibold" tintColor={c.ink} />
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => restoreWithFeedback().then((ok) => ok && router.back())} style={styles.navButton}>
        <Secondary muted>{copy.restore}</Secondary>
      </Pressable>
    </View>
  );
}

export function Benefits() {
  const c = useTheme();
  return (
    <View style={styles.benefits}>
      {pick(PAYWALL_COPY).benefits.map((benefit) => (
        <View key={benefit} style={styles.benefit}>
          <SymbolView name="checkmark" size={18} weight="semibold" tintColor={c.strand} />
          <Body style={styles.grow}>{benefit}</Body>
        </View>
      ))}
    </View>
  );
}

type FooterProps = { plan: Plan; busy: boolean; onBuy: () => void; onLegal: (page: 'terms' | 'privacy') => void };

export function PaywallFooter({ plan, busy, onBuy, onLegal }: FooterProps) {
  const copy = pick(PAYWALL_COPY);
  const trial = plan.id === 'yearly' && plan.trial;
  const billed = plan.id === 'monthly' ? copy.legalMonthly : trial ? copy.legalYearlyTrial : copy.legalYearly;
  return (
    <View style={styles.bottom}>
      <Button label={trial ? copy.startTrial : copy.subscribe} disabled={busy} onPress={onBuy} />
      {trial ? <Caption muted style={styles.center}>{copy.reminder}</Caption> : null}
      <Caption muted style={[styles.center, styles.legal]}>
        {fill(billed, { price: plan.price })} {copy.legalRenew}{' '}
        <Caption accessibilityRole="link" style={styles.link} onPress={() => onLegal('terms')}>
          {copy.terms}
        </Caption>
        {' · '}
        <Caption accessibilityRole="link" style={styles.link} onPress={() => onLegal('privacy')}>
          {copy.privacy}
        </Caption>
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm },
  navButton: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  benefits: { gap: space.md, marginVertical: space.sm },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  grow: { flex: 1 },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.sm },
  center: { textAlign: 'center' },
  legal: { fontSize: 11, lineHeight: 15 },
  link: { fontSize: 11, lineHeight: 15, textDecorationLine: 'underline' },
});
