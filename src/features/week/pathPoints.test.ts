import { pointAt, samplePath } from './pathPoints';

describe('samplePath', () => {
  it('measures straight segments exactly', () => {
    expect(samplePath('M0 0 H30 V40').length).toBeCloseTo(70, 5);
  });

  it('spaces the points evenly along the path', () => {
    const { xs, ys } = samplePath('M0 0 H30 V40', 8);
    expect(xs).toHaveLength(8);
    expect(xs[0]).toBe(0);
    expect(ys.at(-1)).toBeCloseTo(40, 5);
    expect(xs[3]).toBeCloseTo(30, 5);
    expect(ys[3]).toBeCloseTo(0, 5);
    expect(ys[5]).toBeCloseTo(20, 5);
  });

  it('follows a cubic curve to its end point', () => {
    const { xs, ys, length } = samplePath('M0 0 C 0 10 10 20 20 20');
    expect(xs.at(-1)).toBeCloseTo(20, 5);
    expect(ys.at(-1)).toBeCloseTo(20, 5);
    expect(length).toBeGreaterThan(Math.hypot(20, 20));
    expect(length).toBeLessThan(40);
  });

  it('reads the strands the plan draws', () => {
    const { xs, ys } = samplePath('M186 70 H330 C 347 70 347 82 347 94 V302 C 347 314 347 326 330 326');
    expect([xs[0], ys[0]]).toEqual([186, 70]);
    expect(xs.at(-1)).toBeCloseTo(330, 5);
    expect(ys.at(-1)).toBeCloseTo(326, 5);
  });

  it('returns a single point for an empty path', () => {
    expect(samplePath('')).toEqual({ xs: [0], ys: [0], length: 0 });
  });
});

describe('pointAt', () => {
  const line = { xs: [0, 10, 20], ys: [0, 0, 0] };

  it('interpolates between samples', () => {
    expect(pointAt(line.xs, line.ys, 0.25)).toEqual({ x: 5, y: 0 });
  });

  it('clamps before the start', () => {
    expect(pointAt(line.xs, line.ys, -0.5)).toEqual({ x: 0, y: 0 });
  });

  it('carries on along the last segment past the end so a spring can overshoot', () => {
    expect(pointAt(line.xs, line.ys, 1.1)).toEqual({ x: 22, y: 0 });
  });

  it('stays put on a single point', () => {
    expect(pointAt([4], [7], 0.5)).toEqual({ x: 4, y: 7 });
  });
});
