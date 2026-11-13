import { importRemotely, readPage, remoteAvailable } from '@/lib/importApi';

import { importRecipe } from './importRecipe';

jest.mock('@/lib/importApi', () => ({ readPage: jest.fn(), importRemotely: jest.fn(), remoteAvailable: jest.fn() }));

const raw = { title: 'Dal', ingredients: ['1 cup red lentils'], steps: ['Simmer.'], sourceUrl: 'https://example.com/dal' };
const onStep = jest.fn();
const askConsent = jest.fn();
const options = { id: 'r1', now: 7, onStep, askConsent };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(remoteAvailable).mockReturnValue(true);
});

describe('importRecipe from a link', () => {
  it('builds the recipe read on the device and reports each step', async () => {
    jest.mocked(readPage).mockResolvedValue({ recipe: raw });
    const outcome = await importRecipe({ kind: 'url', url: 'https://example.com/dal' }, options);
    expect(outcome).toMatchObject({ recipe: { id: 'r1', title: 'Dal', source: 'web', createdAt: 7 } });
    expect(importRemotely).not.toHaveBeenCalled();
    expect(onStep.mock.calls).toEqual([[2, 1], [3, 1]]);
  });

  it('falls back to the server when the device finds nothing', async () => {
    jest.mocked(readPage).mockResolvedValue({ error: 'no_recipe' });
    jest.mocked(importRemotely).mockResolvedValue({ recipe: raw });
    await expect(importRecipe({ kind: 'url', url: 'https://example.com/dal' }, options)).resolves.toMatchObject({ recipe: { title: 'Dal' } });
    expect(importRemotely).toHaveBeenCalledWith({ kind: 'url', url: 'https://example.com/dal' });
  });

  it('stays on the device without Supabase', async () => {
    jest.mocked(remoteAvailable).mockReturnValue(false);
    jest.mocked(readPage).mockResolvedValue({ error: 'unreachable' });
    await expect(importRecipe({ kind: 'url', url: 'https://example.com/dal' }, options)).resolves.toEqual({ error: 'unreachable' });
    expect(importRemotely).not.toHaveBeenCalled();
  });

  it('passes on a server error', async () => {
    jest.mocked(readPage).mockResolvedValue({ error: 'no_recipe' });
    jest.mocked(importRemotely).mockResolvedValue({ error: 'daily_limit' });
    await expect(importRecipe({ kind: 'url', url: 'https://example.com/dal' }, options)).resolves.toEqual({ error: 'daily_limit' });
  });
});

describe('importRecipe from text', () => {
  const text = { kind: 'text' as const, text: 'Dal\nIngredients\n1 cup red lentils', source: 'caption' as const };
  const chatter = { kind: 'text' as const, text: 'Lovely dinner tonight, recipe soon', source: 'screenshot' as const };

  it('sorts the text on the device without asking', async () => {
    await expect(importRecipe(text, options)).resolves.toMatchObject({ recipe: { title: 'Dal', source: 'caption' } });
    expect(askConsent).not.toHaveBeenCalled();
    expect(importRemotely).not.toHaveBeenCalled();
  });

  it('sends the text to the server only with consent', async () => {
    askConsent.mockResolvedValue(true);
    jest.mocked(importRemotely).mockResolvedValue({ recipe: { ...raw, sourceUrl: '' } });
    await expect(importRecipe(chatter, options)).resolves.toMatchObject({ recipe: { source: 'screenshot', sourceUrl: null } });
    expect(importRemotely).toHaveBeenCalledWith({ kind: 'text', text: chatter.text, consent: true });
  });

  it('keeps the text on the device when consent is refused', async () => {
    askConsent.mockResolvedValue(false);
    await expect(importRecipe(chatter, options)).resolves.toEqual({ error: 'no_recipe' });
    expect(importRemotely).not.toHaveBeenCalled();
  });

  it.each([['too short', 'egg'], ['too long', 'a'.repeat(20_001)]])('never sends text that is %s', async (_, value) => {
    await expect(importRecipe({ ...chatter, text: value }, options)).resolves.toEqual({ error: 'no_recipe' });
    expect(askConsent).not.toHaveBeenCalled();
  });

  it('never asks without Supabase', async () => {
    jest.mocked(remoteAvailable).mockReturnValue(false);
    await expect(importRecipe(chatter, options)).resolves.toEqual({ error: 'no_recipe' });
    expect(askConsent).not.toHaveBeenCalled();
  });
});
