type Point = { x: number; y: number };

const CURVE_STEPS = 24;

const cubic = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

function trace(d: string): Point[] {
  const tokens = d.match(/[MHVC]|-?\d*\.?\d+/g) ?? [];
  const points: Point[] = [];
  let at: Point = { x: 0, y: 0 };
  let command = '';
  let i = 0;
  const next = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[MHVC]/.test(tokens[i] ?? '')) command = tokens[i++] ?? '';
    if (command === 'C') {
      const [x1, y1, x2, y2, x, y] = [next(), next(), next(), next(), next(), next()];
      for (let s = 1; s <= CURVE_STEPS; s++) {
        const t = s / CURVE_STEPS;
        points.push({ x: cubic(at.x, x1, x2, x, t), y: cubic(at.y, y1, y2, y, t) });
      }
      at = { x, y };
      continue;
    }
    at = command === 'H' ? { x: next(), y: at.y } : command === 'V' ? { x: at.x, y: next() } : { x: next(), y: next() };
    points.push(at);
  }
  return points;
}

export function samplePath(d: string, count = 48): { xs: number[]; ys: number[]; length: number } {
  const dense = trace(d);
  const first = dense[0] ?? { x: 0, y: 0 };
  const cumulative = Array<number>(dense.length).fill(0);
  for (let k = 1; k < dense.length; k++) {
    const [a = first, b = first] = [dense[k - 1], dense[k]];
    cumulative[k] = (cumulative[k - 1] ?? 0) + Math.hypot(b.x - a.x, b.y - a.y);
  }
  const length = cumulative.at(-1) ?? 0;
  if (length === 0) return { xs: [first.x], ys: [first.y], length };
  const xs: number[] = [];
  const ys: number[] = [];
  let k = 1;
  for (let n = 0; n < count; n++) {
    const target = (length * n) / (count - 1);
    while (k < dense.length - 1 && (cumulative[k] ?? 0) < target) k++;
    const [a = first, b = first] = [dense[k - 1], dense[k]];
    const [from = 0, to = 0] = [cumulative[k - 1], cumulative[k]];
    const r = to === from ? 0 : (target - from) / (to - from);
    xs.push(a.x + (b.x - a.x) * r);
    ys.push(a.y + (b.y - a.y) * r);
  }
  return { xs, ys, length };
}

export function pointAt(xs: number[], ys: number[], t: number): Point {
  'worklet';
  const last = xs.length - 1;
  if (last < 1) return { x: xs[0] ?? 0, y: ys[0] ?? 0 };
  const f = Math.max(0, t) * last;
  const i = Math.min(Math.floor(f), last - 1);
  const r = f - i;
  const [x0 = 0, x1 = 0, y0 = 0, y1 = 0] = [xs[i], xs[i + 1], ys[i], ys[i + 1]];
  return { x: x0 + (x1 - x0) * r, y: y0 + (y1 - y0) * r };
}
