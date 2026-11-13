import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { fill, pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Body, Caption, Secondary } from '@/ui/Text';
import { space, touch, useTheme } from '@/ui/theme';

import { restoreWithFeedback } from './actions';
import { PAYWALL_COPY } from './copy';
import type { Offer, Plan } from './plans';

export function PaywallNav() {
  const copy = pick(PAYWALL_COPY);
  return (
    <View style={styles.nav}>
      <IconButton name="xmark" label={t('common.close')} onPress={() => router.back()} />
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
          <Icon name="checkmark" size={18} weight="semibold" color={c.strand} />
          <Body style={styles.grow}>{benefit}</Body>
        </View>
      ))}
    </View>
  );
}

export function OfferState({ offer, onRetry }: { offer: Offer; onRetry: () => void }) {
  const copy = pick(PAYWALL_COPY);
  if (offer.status === 'loading') {
    return (
      <View style={styles.state} accessible accessibilityLabel={copy.loading}>
        <ActivityIndicator />
        <Secondary muted>{copy.loading}</Secondary>
      </View>
    );
  }
  return (
    <View style={styles.state}>
      <Secondary muted style={styles.center}>{offer.status === 'unavailable' ? copy.unavailable : copy.pricesFallback}</Secondary>
      {offer.status === 'failed' ? <Button kind="secondary" label={copy.retry} onPress={onRetry} /> : null}
    </View>
  );
}

type FooterProps = { plan: Plan | null; busy: boolean; onBuy: () => void; onLegal: (page: 'terms' | 'privacy') => void };

export function PaywallFooter({ plan, busy, onBuy, onLegal }: FooterProps) {
  const copy = pick(PAYWALL_COPY);
  const trial = plan?.id === 'yearly' && plan.trial;
  const billed = !plan ? '' : plan.id === 'monthly' ? copy.legalMonthly : trial ? copy.legalYearlyTrial : copy.legalYearly;
  return (
    <View style={styles.bottom}>
      <Button label={trial ? copy.startTrial : copy.subscribe} disabled={busy || !plan} onPress={onBuy} />
      {trial ? <Caption muted style={styles.center}>{copy.reminder}</Caption> : null}
      <Caption muted style={styles.center}>
        {plan ? `${fill(billed, { price: plan.price })} ` : ''}
        {copy.legalRenew}{' '}
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
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg },
  navButton: { minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
  benefits: { gap: space.md, marginVertical: space.sm },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  grow: { flex: 1 },
  state: { alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.sm },
  center: { textAlign: 'center' },
  link: { textDecorationLine: 'underline' },
});
