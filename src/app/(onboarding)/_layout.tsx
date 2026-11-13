import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { plainHeader } from '@/features/household/header';
import { t } from '@/lib/i18n';
import { Caption } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

function Step({ current }: { current: number }) {
  return <Caption muted>{t('onboarding.step', { current, total: 3 })}</Caption>;
}

export default function OnboardingLayout() {
  const c = useTheme();
  const reduced = useReducedMotion();
  return (
    <Stack screenOptions={{ ...plainHeader(c), contentStyle: { backgroundColor: c.paper }, animation: reduced ? 'fade' : 'default' }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="how" />
      <Stack.Screen name="household" options={{ headerRight: () => <Step current={1} /> }} />
      <Stack.Screen name="allergies" options={{ headerRight: () => <Step current={2} /> }} />
      <Stack.Screen name="diets" options={{ headerRight: () => <Step current={3} /> }} />
    </Stack>
  );
}
