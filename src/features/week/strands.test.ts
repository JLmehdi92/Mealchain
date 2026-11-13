import { strandPath } from './strands';

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
