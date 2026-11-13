import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import migrations from '../../drizzle/migrations';
import { useProfileSync } from '@/features/household/useProfileSync';
import { initPurchases } from '@/features/subscription/purchase';
import { trackFirstLaunch } from '@/lib/analytics';
import { db } from '@/lib/db/client';
import { initMonitoring, report } from '@/lib/monitoring';
import { load, refreshWeek, useHousehold, useReady } from '@/lib/store';
import { useTheme } from '@/ui/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
initMonitoring();
initPurchases();

export default function RootLayout() {
  const migrated = useMigrations(db, migrations);
  const [fontsLoaded, fontError] = useFonts({
    'Urbanist-Medium': require('../../assets/fonts/Urbanist_500Medium.ttf'),
    'Urbanist-SemiBold': require('../../assets/fonts/Urbanist_600SemiBold.ttf'),
    'DMMono-Regular': require('../../assets/fonts/DMMono_400Regular.ttf'),
  });
  const ready = useReady();
  const household = useHousehold();
  const c = useTheme();
  const reduced = useReducedMotion();
  const [loadError, setLoadError] = useState<unknown>(null);

  useEffect(() => {
    if (migrated.success) load().then(() => trackFirstLaunch().catch(report), setLoadError);
  }, [migrated.success]);

  useEffect(() => {
    if (ready && fontsLoaded) SplashScreen.hide();
  }, [ready, fontsLoaded]);

  useEffect(() => {
    if (!ready) return;
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && refreshWeek().catch(report));
    return () => subscription.remove();
  }, [ready]);

  useProfileSync(ready && !!household);

  if (migrated.error) throw migrated.error;
  if (fontError) throw fontError;
  if (loadError) throw loadError;
  if (!ready || !fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper }, animation: reduced ? 'fade' : 'default' }}>
      <Stack.Protected guard={!!household}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="import" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="swap"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.6, 1], sheetGrabberVisible: true, contentStyle: { backgroundColor: c.sheet } }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!household}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
    </Stack>
  );
}
