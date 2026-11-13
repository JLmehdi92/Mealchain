import { weekStartOf } from './week';

describe('weekStartOf', () => {
  it('returns the same day for a Monday', () => {
    expect(weekStartOf(new Date(2026, 10, 9, 18))).toBe('2026-11-09');
  });

  it('returns the previous Monday mid-week', () => {
    expect(weekStartOf(new Date(2026, 10, 13))).toBe('2026-11-09');
  });

  it('treats Sunday as the end of the week', () => {
    expect(weekStartOf(new Date(2026, 10, 15))).toBe('2026-11-09');
  });

  it('crosses a month boundary', () => {
    expect(weekStartOf(new Date(2026, 11, 2))).toBe('2026-11-30');
  });
});
