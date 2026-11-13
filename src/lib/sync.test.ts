import { getChecks, setCheck } from './db/repo';
import { supabase } from './supabase';
import { pullChecks, subscribeChecks } from './sync';

const mockUpsert = jest.fn((_rows: unknown) => Promise.resolve({ error: null }));
const mockSelect = jest.fn((_columns: string) => undefined);
let mockRows: unknown = [];
let mockHandler: (payload: { new: unknown }) => void = () => {};

jest.mock('./supabase', () => {
  const query = {
    select: (columns: string) => (mockSelect(columns), query),
    eq: () => query,
    then: (resolve: (v: unknown) => void) => resolve({ data: mockRows, error: null }),
  };
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
jest.mock('./db/repo', () => ({ setCheck: jest.fn(() => Promise.resolve()), getChecks: jest.fn(), getSetting: jest.fn() }));
jest.mock('./monitoring', () => ({ report: jest.fn() }));

const T1 = '2026-11-09T10:00:00.000Z';
const T2 = '2026-11-09T11:00:00.000Z';

beforeEach(() => jest.clearAllMocks());

describe('pullChecks', () => {
  it('reads the device ticks, applies newer household ticks and pushes newer or unseen device ticks with their own time', async () => {
    jest.mocked(getChecks).mockResolvedValue([
      { itemId: 'egg', checked: false, updatedAt: Date.parse(T1) },
      { itemId: 'leek', checked: true, updatedAt: Date.parse(T2) },
    ]);
    mockRows = [{ ingredient_id: 'egg', week_start: '2026-11-09', checked: true, updated_at: '2026-11-09T11:00:00.000123+00:00' }];
    const applied = await pullChecks('h1', '2026-11-09');
    expect(mockSelect).toHaveBeenCalledWith('ingredient_id, week_start, checked, updated_at');
    expect(applied).toEqual([{ itemId: 'egg', checked: true, updatedAt: Date.parse(T2) }]);
    expect(setCheck).toHaveBeenCalledWith('2026-11-09', 'egg', true, Date.parse(T2));
    expect(mockUpsert.mock.calls[0]![0]).toEqual([
      expect.objectContaining({ id: '2026-11-09:leek', household_id: 'h1', ingredient_id: 'leek', checked: true, checked_by: 'u1', updated_at: T2 }),
    ]);
  });

  it('rejects rows that do not match the expected shape', async () => {
    jest.mocked(getChecks).mockResolvedValue([]);
    mockRows = [{ ingredient_id: 3 }];
    await expect(pullChecks('h1', '2026-11-09')).rejects.toThrow();
    expect(setCheck).not.toHaveBeenCalled();
  });
});

describe('subscribeChecks', () => {
  it('applies a remote tick for this week with its time and ignores other weeks or malformed rows', async () => {
    const onCheck = jest.fn();
    const stop = subscribeChecks('h1', '2026-11-09', onCheck);
    mockHandler({ new: { ingredient_id: 'egg', week_start: '2026-11-02', checked: true, updated_at: T1 } });
    mockHandler({ new: { nope: true } });
    mockHandler({ new: { ingredient_id: 'egg', week_start: '2026-11-09', checked: true, updated_at: T1 } });
    await new Promise(process.nextTick);
    expect(setCheck).toHaveBeenCalledTimes(1);
    expect(setCheck).toHaveBeenCalledWith('2026-11-09', 'egg', true, Date.parse(T1));
    expect(onCheck).toHaveBeenCalledWith({ itemId: 'egg', checked: true, updatedAt: Date.parse(T1) });
    stop();
    expect(supabase!.removeChannel).toHaveBeenCalled();
  });
});
