import { setCheck } from './db/repo';
import { supabase } from './supabase';
import { pullChecks, subscribeChecks } from './sync';

const mockUpsert = jest.fn((_rows: unknown) => Promise.resolve({ error: null }));
let mockRows: unknown = [];
let mockHandler: (payload: { new: unknown }) => void = () => {};

jest.mock('./supabase', () => {
  const query = { select: () => query, eq: () => query, then: (resolve: (v: unknown) => void) => resolve({ data: mockRows, error: null }) };
  const channel = { on: (_e: string, _f: unknown, cb: typeof mockHandler) => ((mockHandler = cb), channel), subscribe: () => channel };
  return {
    supabase: {
      auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1' } } } }) },
      from: () => ({ ...query, upsert: (r: unknown) => mockUpsert(r) }),
      channel: () => channel,
      removeChannel: jest.fn(),
    },
  };
});
jest.mock('./db/repo', () => ({ setCheck: jest.fn(() => Promise.resolve()), getSetting: jest.fn() }));
jest.mock('./monitoring', () => ({ report: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

describe('pullChecks', () => {
  it('applies household ticks locally and pushes ticks the household has not seen', async () => {
    mockRows = [{ ingredient_id: 'egg', week_start: '2026-11-09', checked: true }];
    const applied = await pullChecks('h1', '2026-11-09', { egg: false, leek: true });
    expect(applied).toEqual([{ itemId: 'egg', checked: true }]);
    expect(setCheck).toHaveBeenCalledWith('2026-11-09', 'egg', true);
    expect(mockUpsert.mock.calls[0]![0]).toEqual([
      expect.objectContaining({ id: '2026-11-09:leek', household_id: 'h1', ingredient_id: 'leek', checked: true, checked_by: 'u1' }),
    ]);
  });

  it('rejects rows that do not match the expected shape', async () => {
    mockRows = [{ ingredient_id: 3 }];
    await expect(pullChecks('h1', '2026-11-09', {})).rejects.toThrow();
    expect(setCheck).not.toHaveBeenCalled();
  });
});

describe('subscribeChecks', () => {
  it('applies a remote tick for this week and ignores other weeks or malformed rows', async () => {
    const onCheck = jest.fn();
    const stop = subscribeChecks('h1', '2026-11-09', onCheck);
    mockHandler({ new: { ingredient_id: 'egg', week_start: '2026-11-02', checked: true } });
    mockHandler({ new: { nope: true } });
    mockHandler({ new: { ingredient_id: 'egg', week_start: '2026-11-09', checked: true } });
    await new Promise(process.nextTick);
    expect(setCheck).toHaveBeenCalledTimes(1);
    expect(onCheck).toHaveBeenCalledWith({ itemId: 'egg', checked: true });
    stop();
    expect(supabase!.removeChannel).toHaveBeenCalled();
  });
});
