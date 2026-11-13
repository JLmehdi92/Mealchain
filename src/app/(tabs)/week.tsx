import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIsPro } from '@/features/subscription/useIsPro';
import { markPlanSeen, startPlan } from '@/features/week/actions';
import { weekCopy } from '@/features/week/copy';
import { SwapSheet } from '@/features/week/ui/SwapSheet';
import { WeekContent } from '@/features/week/ui/WeekContent';
import { pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { usePlan } from '@/lib/store';
import { IconButton } from '@/ui/IconButton';
import { NavBar } from '@/ui/NavBar';
import { space, useTheme } from '@/ui/theme';

export default function Week() {
  const c = useTheme();
  const s = pick(weekCopy);
  const plan = usePlan();
  const pro = useIsPro();
  const [planning, setPlanning] = useState(false);
  const [swapping, setSwapping] = useState<number | null>(null);
  const shown = !planning && !!plan && plan.slots.length > 0;

  useEffect(() => {
    if (shown) markPlanSeen().catch(report);
  }, [shown]);

  const makePlan = async () => {
    setPlanning(true);
    const result = await startPlan(pro).catch((error: unknown) => {
      report(error);
      Alert.alert(s.failed);
      return 'skipped' as const;
    });
    setPlanning(false);
    if (result === 'paywall') router.push('/paywall');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: c.paper }]}>
      <NavBar right={<IconButton name="gearshape" label={s.settings} onPress={() => router.push('/settings')} />} />
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <WeekContent planning={planning} onPlan={makePlan} onSwap={setSwapping} />
      </ScrollView>
      <SwapSheet slot={swapping} onClose={() => setSwapping(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl * 3, gap: space.xs },
});
