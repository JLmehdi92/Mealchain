import * as Sentry from '@sentry/react-native';

export function initMonitoring() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, sendDefaultPii: false, tracesSampleRate: 0.2 });
}

export const report = (error: unknown) => {
  Sentry.captureException(error);
};
