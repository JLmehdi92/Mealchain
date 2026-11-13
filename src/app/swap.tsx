import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SwapList } from '@/features/week/ui/SwapSheet';
import { usePlan } from '@/lib/store';
import { useTheme } from '@/ui/theme';

export default function Swap() {
  const c = useTheme();
  const plan = usePlan();
  const { slot } = useLocalSearchParams<{ slot?: string }>();
  const index = Number(slot);
  const valid = Number.isInteger(index) && index >= 0 && index < (plan?.slots.length ?? 0);
  return <View style={[styles.fill, { backgroundColor: c.sheet }]}>{valid ? <SwapList slot={index} onClose={router.back} /> : null}</View>;
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
