import PostHog from 'posthog-react-native';
import Storage from 'expo-sqlite/kv-store';

import { getSetting, setSetting } from './db/repo';

export type FunnelEvent = 'app_installed' | 'first_import' | 'first_plan' | 'paywall_viewed' | 'trial_started';

const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const client = key
  ? new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      customStorage: { getItem: (k) => Storage.getItemSync(k), setItem: (k, v) => Storage.setItemSync(k, v) },
      captureAppLifecycleEvents: false,
      personProfiles: 'never',
      disableGeoip: true,
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
