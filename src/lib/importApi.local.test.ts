import { importRemotely, remoteAvailable } from './importApi';

jest.mock('./supabase', () => ({ supabase: null }));

describe('without Supabase', () => {
  it('runs in local-only mode', async () => {
    expect(remoteAvailable()).toBe(false);
    expect(await importRemotely({ kind: 'url', url: 'https://example.com' })).toEqual({ error: 'unreachable' });
  });
});
