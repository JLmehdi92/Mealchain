import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalSheet } from '@/features/household/LegalPage';
import { PRIVACY, TERMS } from '@/features/household/legalText';
import { PAYWALL_COPY } from '@/features/subscription/copy';
import { Benefits, PaywallFooter, PaywallNav } from '@/features/subscription/PaywallParts';
import { PlanCard } from '@/features/subscription/PlanCard';
import { usePlans } from '@/features/subscription/plans';
import { purchase } from '@/features/subscription/purchase';
import { track } from '@/lib/analytics';
import { pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Body, Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

export default function Paywall() {
  const c = useTheme();
  const copy = pick(PAYWALL_COPY);
  const plans = usePlans();
  const [selected, setSelected] = useState<'yearly' | 'monthly'>('yearly');
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);
  const plan = plans.find((p) => p.id === selected) ?? plans[0]!;

  useEffect(() => track('paywall_viewed'), []);

  const buy = async () => {
    if (!plan.pkg) return Alert.alert(copy.unavailable);
    setBusy(true);
    try {
      if (await purchase(plan.pkg)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }
    } catch (error) {
      report(error);
      Alert.alert(copy.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.paper }]}>
      <PaywallNav />
      <ScrollView contentContainerStyle={styles.content}>
        <Title>{copy.title}</Title>
        <Body muted>{copy.subtitle}</Body>
        <Benefits />
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} selected={p.id === selected} onSelect={() => setSelected(p.id)} />
        ))}
      </ScrollView>
      <PaywallFooter plan={plan} busy={busy} onBuy={buy} onLegal={setLegal} />
      <LegalSheet text={legal === 'terms' ? TERMS : legal === 'privacy' ? PRIVACY : null} onClose={() => setLegal(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.md },
});
