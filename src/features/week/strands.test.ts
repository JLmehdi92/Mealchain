import { strandPath, strandsOf } from './strands';

describe('strandPath', () => {
  it('runs from the pill along the gutter to the top of the target card', () => {
    expect(strandPath({ pillRight: 180, pillY: 70, cardRight: 340, targetTop: 300, index: 0 })).toEqual({
      d: 'M186 70 H330 C 347 70 347 82 347 94 V302 C 347 314 347 326 330 326',
      start: { x: 186, y: 70 },
      end: { x: 330, y: 326 },
    });
  });

  it('offsets every other strand so neighbours do not overlap', () => {
    expect(strandPath({ pillRight: 180, pillY: 70, cardRight: 340, targetTop: 300, index: 1 }).d).toContain('C 353 70');
  });
});

describe('strandsOf', () => {
  const plan = {
    slots: [{ day: 0, meal: 'dinner' as const, recipeId: 'a' }, { day: 1, meal: 'dinner' as const, recipeId: 'b' }, { day: 2, meal: 'dinner' as const, recipeId: 'c' }],
    carries: [
      { ingredientId: 'cream', fromSlot: 0, toSlot: 1, amount: 10 },
      { ingredientId: 'cream', fromSlot: 0, toSlot: 2, amount: 5 },
    ],
    score: 0,
  };
  const frames = { 0: { top: 0, right: 340, pillRight: 180, pillY: 70 }, 1: { top: 150, right: 340 }, 2: { top: 300, right: 340 } };

  it('draws one strand per meal a pack reaches, tagged with its chain', () => {
    const strands = strandsOf(plan, frames);
    expect(strands.map((s) => [s.key, s.chain, s.toSlot])).toEqual([
      ['cream-0-1', 0, 1],
      ['cream-0-2', 0, 2],
    ]);
    expect(strands[1]?.d).toBe(strandPath({ pillRight: 180, pillY: 70, cardRight: 340, targetTop: 300, index: 0 }).d);
  });

  it('waits until the source pill and the target card are measured', () => {
    expect(strandsOf(plan, { 0: { top: 0, right: 340 }, 1: frames[1] })).toEqual([]);
    expect(strandsOf(plan, { 0: frames[0], 2: frames[2] }).map((s) => s.toSlot)).toEqual([2]);
  });
});
