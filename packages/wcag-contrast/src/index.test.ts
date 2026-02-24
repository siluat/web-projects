import { describe, expect, it } from 'bun:test';
import { checkContrast, contrastRatio } from './index';

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('throws for invalid color input', () => {
    expect(() => contrastRatio('not-a-color', '#fff')).toThrow(
      'Invalid color: "not-a-color"',
    );
  });

  it('handles alpha compositing in the pipeline', () => {
    // Semi-transparent black over white should produce a lower ratio than opaque black
    const ratio = contrastRatio('#00000080', '#ffffff');
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });
});

describe('checkContrast', () => {
  it('grades #333 vs #fff as AAA/AAA', () => {
    expect(checkContrast('#333', '#fff')).toEqual({
      ratio: 12.63,
      normalText: 'AAA',
      largeText: 'AAA',
    });
  });

  it('grades #777 vs #fff as Fail/AA (ratio 4.48 < 4.5 threshold)', () => {
    expect(checkContrast('#777', '#fff')).toEqual({
      ratio: 4.48,
      normalText: 'Fail',
      largeText: 'AA',
    });
  });

  it('grades #999 vs #fff as Fail/Fail (ratio 2.85 < 3 threshold)', () => {
    expect(checkContrast('#999', '#fff')).toEqual({
      ratio: 2.85,
      normalText: 'Fail',
      largeText: 'Fail',
    });
  });
});
