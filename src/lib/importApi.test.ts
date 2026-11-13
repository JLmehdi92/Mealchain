import { FunctionsHttpError } from '@supabase/supabase-js';

import { importRemotely, readPage } from './importApi';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({ supabase: { functions: { invoke: jest.fn() } } }));

const PAGE = `<script type="application/ld+json">{"@type":"Recipe","name":"Dal","recipeIngredient":["1 cup lentils"]}</script>`;
const fetchMock = jest.fn();
globalThis.fetch = fetchMock;
const invoke = jest.mocked(supabase!.functions.invoke);
const page = (body: string, init: { ok?: boolean; url?: string } = {}) =>
  fetchMock.mockResolvedValue({ ok: init.ok ?? true, url: init.url ?? 'https://example.com/dal', body: new Response(body).body });
const httpError = (status: number, body: unknown) =>
  new FunctionsHttpError(new Response(JSON.stringify(body), { status }));

beforeEach(() => jest.clearAllMocks());

describe('readPage', () => {
  it('extracts the recipe from the page on the device', async () => {
    page(PAGE);
    expect(await readPage(' https://example.com/dal ')).toMatchObject({ recipe: { title: 'Dal', ingredients: ['1 cup lentils'] } });
  });

  it('refuses a link that is not public https without fetching it', async () => {
    expect(await readPage('http://192.168.1.2/dal')).toEqual({ error: 'unreachable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a page redirected to a private address', async () => {
    page(PAGE, { url: 'https://10.0.0.1/dal' });
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'unreachable' });
  });

  it('reports an unreachable page', async () => {
    page('', { ok: false });
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'unreachable' });
  });

  it('reports a network failure as unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'unreachable' });
  });

  it('reports a page without recipe data', async () => {
    page('<html></html>');
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'no_recipe' });
  });

  it('decodes a multi-byte character split across chunks', async () => {
    const bytes = new TextEncoder().encode(PAGE.replace('Dal', 'Dal à la crème'));
    const split = bytes.indexOf(0xc3) + 1;
    const body = new ReadableStream({ start: (c) => { c.enqueue(bytes.slice(0, split)); c.enqueue(bytes.slice(split)); c.close(); } });
    fetchMock.mockResolvedValue({ ok: true, url: 'https://example.com/dal', body });
    expect(await readPage('https://example.com/dal')).toMatchObject({ recipe: { title: 'Dal à la crème' } });
  });

  it('stops reading an endless page at 3 MB and cancels the download', async () => {
    let sent = 0;
    const cancel = jest.fn();
    const body = new ReadableStream({ pull: (c) => { sent += 65_536; c.enqueue(new Uint8Array(65_536)); }, cancel });
    fetchMock.mockResolvedValue({ ok: true, url: 'https://example.com/dal', body });
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'unreachable' });
    expect(cancel).toHaveBeenCalled();
    expect(sent).toBeLessThan(3_300_000);
  });

  it('reports a response without a readable body as unreachable', async () => {
    fetchMock.mockResolvedValue({ ok: true, url: 'https://example.com/dal', body: null });
    expect(await readPage('https://example.com/dal')).toEqual({ error: 'unreachable' });
  });
});

describe('importRemotely', () => {
  const body = { kind: 'url' as const, url: 'https://example.com/dal' };

  it('returns the validated recipe', async () => {
    invoke.mockResolvedValue({ data: { recipe: { ingredients: ['1 egg'], steps: [], sourceUrl: '' } }, error: null, response: undefined });
    expect(await importRemotely(body)).toEqual({ recipe: { ingredients: ['1 egg'], steps: [], sourceUrl: '' } });
    expect(invoke).toHaveBeenCalledWith('import-recipe', { body });
  });

  it('rejects a malformed response', async () => {
    invoke.mockResolvedValue({ data: { recipe: { ingredients: 'nope' } }, error: null, response: undefined });
    expect(await importRemotely(body)).toEqual({ error: 'no_recipe' });
  });

  it('maps 429 to the daily limit', async () => {
    invoke.mockResolvedValue({ data: null, error: httpError(429, { error: 'daily_limit' }), response: undefined });
    expect(await importRemotely(body)).toEqual({ error: 'daily_limit' });
  });

  it.each(['no_recipe', 'unreachable'] as const)('passes on the %s reason', async (reason) => {
    invoke.mockResolvedValue({ data: null, error: httpError(422, { error: reason }), response: undefined });
    expect(await importRemotely(body)).toEqual({ error: reason });
  });

  it('treats any other failure as unreachable', async () => {
    invoke.mockResolvedValue({ data: null, error: httpError(500, {}), response: undefined });
    expect(await importRemotely(body)).toEqual({ error: 'unreachable' });
  });
});
