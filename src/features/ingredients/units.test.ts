import { toBase } from './units';

const cream = { baseUnit: 'ml', gramsPerMl: 1.01 } as const;
const flour = { baseUnit: 'g', gramsPerMl: 0.53 } as const;
const egg = { baseUnit: 'piece', gramsPerPiece: 55 } as const;
const onion = { baseUnit: 'g', gramsPerPiece: 150 } as const;
const salt = { baseUnit: 'g' } as const;

describe('toBase', () => {
  it('keeps a quantity already in the base unit', () => {
    expect(toBase(200, 'ml', cream)).toBe(200);
    expect(toBase(3, 'piece', egg)).toBe(3);
  });

  it('converts metric units of the same kind', () => {
    expect(toBase(20, 'cl', cream)).toBe(200);
    expect(toBase(1.5, 'kg', salt)).toBe(1500);
  });

  it('converts US units to metric', () => {
    expect(toBase(1, 'cup', cream)).toBeCloseTo(236.59, 1);
    expect(toBase(2, 'tbsp', cream)).toBeCloseTo(29.57, 1);
    expect(toBase(4, 'fl_oz', cream)).toBeCloseTo(118.29, 1);
    expect(toBase(1, 'lb', salt)).toBeCloseTo(453.59, 1);
    expect(toBase(8, 'oz', salt)).toBeCloseTo(226.8, 1);
  });

  it('converts volume to mass with a known density', () => {
    expect(toBase(1, 'cup', flour)).toBeCloseTo(125.39, 1);
  });

  it('converts mass to volume with a known density', () => {
    expect(toBase(101, 'g', cream)).toBeCloseTo(100, 5);
  });

  it('converts pieces to mass and mass to pieces with a known piece weight', () => {
    expect(toBase(2, 'piece', onion)).toBe(300);
    expect(toBase(110, 'g', egg)).toBe(2);
  });

  it('refuses to guess when density or piece weight is unknown', () => {
    expect(toBase(1, 'cup', salt)).toBeNull();
    expect(toBase(1, 'piece', salt)).toBeNull();
    expect(toBase(1, 'piece', cream)).toBeNull();
    expect(toBase(1, 'ml', egg)).toBeNull();
  });

  it('rejects zero, negative and non-finite quantities', () => {
    expect(toBase(0, 'g', salt)).toBeNull();
    expect(toBase(-1, 'g', salt)).toBeNull();
    expect(toBase(Number.NaN, 'g', salt)).toBeNull();
    expect(toBase(Number.POSITIVE_INFINITY, 'g', salt)).toBeNull();
  });
});
