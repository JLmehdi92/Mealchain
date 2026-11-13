import * as Sentry from '@sentry/react-native';

import { initMonitoring, scrubBreadcrumb, scrubEvent } from './monitoring';

jest.mock('@sentry/react-native', () => ({ init: jest.fn(), captureException: jest.fn() }));

const ID = '3f2b8c1e-9a4d-4f6b-8e2a-1c5d7e9f0a3b';

it('removes links, query strings and ids from messages and exceptions', () => {
  const event = scrubEvent({
    type: undefined,
    message: `Import failed for https://blog.example.com/dal?token=abc&u=${ID}`,
    exception: { values: [{ type: 'Error', value: `household ${ID} not found at /rest/v1/households?id=eq.${ID}` }] },
  });
  expect(event.message).toBe('Import failed for [url]');
  expect(event.exception?.values?.[0]?.value).toBe('household [uuid] not found at /rest/v1/households?[query]');
  expect(event.exception?.values?.[0]?.type).toBe('Error');
});

it('leaves ordinary questions alone', () => {
  expect(scrubEvent({ type: undefined, message: 'Is the list empty?' }).message).toBe('Is the list empty?');
});

it('scrubs request data and breadcrumbs', () => {
  const event = scrubEvent({
    type: undefined,
    request: { url: 'https://api.example.com/x?y=1', query_string: 'y=1', headers: { referer: 'https://a.example/b' } },
    breadcrumbs: [{ category: 'fetch', message: `GET https://x.example/${ID}`, data: { url: 'https://x.example/?a=b', status_code: 200 } }],
  });
  expect(event.request).toEqual({ url: '[url]', headers: { referer: '[url]' } });
  expect(event.breadcrumbs?.[0]).toEqual({ category: 'fetch', message: 'GET [url]', data: { url: '[url]', status_code: 200 } });
});

it('scrubs a breadcrumb before it is recorded', () => {
  expect(scrubBreadcrumb({ category: 'navigation', data: { to: `/recipe/${ID}` } })).toEqual({ category: 'navigation', data: { to: '/recipe/[uuid]' } });
});

it('starts Sentry without personal data or tracing, with the scrubbers', () => {
  process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://key@o0.ingest.sentry.io/0';
  initMonitoring();
  expect(Sentry.init).toHaveBeenCalledWith(
    expect.objectContaining({ sendDefaultPii: false, tracesSampleRate: 0, beforeSend: scrubEvent, beforeBreadcrumb: scrubBreadcrumb }),
  );
});
