import PostHog from 'posthog-react-native';
import Storage from 'expo-sqlite/kv-store';

import type { Market } from '@/features/ingredients/schema';

import { getSetting, setSetting } from './db/repo';
import { market } from './i18n';

type FunnelEvent = 'app_installed' | 'first_import' | 'first_plan' | 'paywall_viewed' | 'trial_started';

export const statsDefault = (m: Market) => m !== 'fr';

const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const client = key
  ? new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      customStorage: { getItem: (k) => Storage.getItemSync(k), setItem: (k, v) => Storage.setItemSync(k, v) },
      captureAppLifecycleEvents: false,
      personProfiles: 'never',
      disableGeoip: true,
      defaultOptIn: statsDefault(market()),
    })
  : null;

export function track(event: FunnelEvent) {
  client?.capture(event);
}

export function resetAnalytics() {
  client?.reset();
}

export async function trackFirstLaunch() {
  if (await getSetting('installed')) return;
  await setSetting('installed', 'yes');
  track('app_installed');
}

export async function trackOnce(event: 'first_import' | 'first_plan') {
  const key = `tracked_${event}` as const;
  if (await getSetting(key)) return;
  await setSetting(key, 'yes');
  track(event);
}

export async function statsEnabled(): Promise<boolean> {
  const stored = await getSetting('analytics');
  return stored ? stored === 'on' : statsDefault(market());
}

export async function setStatsEnabled(on: boolean) {
  await setSetting('analytics', on ? 'on' : 'off');
  await (on ? client?.optIn() : client?.optOut());
}
