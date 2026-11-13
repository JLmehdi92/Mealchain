import * as Sentry from '@sentry/react-native';
import type { Breadcrumb, ErrorEvent } from '@sentry/react-native';

const REDACTIONS: [RegExp, string][] = [
  [/\b[a-z][a-z0-9+.-]*:\/\/[^\s"'<>]+/gi, '[url]'],
  [/\?[^\s"'<>#?]*=[^\s"'<>#]*/g, '?[query]'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[uuid]'],
];

const scrubText = (text: string) => REDACTIONS.reduce((out, [pattern, label]) => out.replace(pattern, label), text);

function scrubDeep(value: unknown): unknown {
  if (typeof value === 'string') return scrubText(value);
  if (Array.isArray(value)) return value.map(scrubDeep);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrubDeep(v)]));
  return value;
}

export const scrubBreadcrumb = (crumb: Breadcrumb): Breadcrumb => ({
  ...crumb,
  ...(crumb.message && { message: scrubText(crumb.message) }),
  ...(crumb.data && { data: scrubDeep(crumb.data) as Breadcrumb['data'] }),
});

// Why: links, query strings and ids can carry household ids, invite codes or tokens; none may reach Sentry.
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request && { ...event.request, query_string: undefined, cookies: undefined, data: undefined };
  return {
    ...event,
    ...(event.message && { message: scrubText(event.message) }),
    ...(event.exception && {
      exception: { ...event.exception, values: event.exception.values?.map((v) => ({ ...v, ...(v.value && { value: scrubText(v.value) }) })) },
    }),
    ...(event.breadcrumbs && { breadcrumbs: event.breadcrumbs.map(scrubBreadcrumb) }),
    ...(request && { request: scrubDeep(request) as ErrorEvent['request'] }),
  };
}

export function initMonitoring() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, sendDefaultPii: false, tracesSampleRate: 0, beforeSend: scrubEvent, beforeBreadcrumb: scrubBreadcrumb });
}

export const report = (error: unknown) => {
  Sentry.captureException(error);
};
