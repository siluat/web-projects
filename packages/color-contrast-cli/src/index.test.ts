import { describe, expect, it } from 'bun:test';
import {
  checkContrast,
  checkContrastVerbose,
  contrastRatio,
  validateColors,
} from './index';

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('throws for invalid color input', () => {
    expect(() => contrastRatio('not-a-color', '#fff')).toThrow(
      'Invalid color: "not-a-color"',
    );
  });

  it('returns 16.01 for navy vs white', () => {
    expect(contrastRatio('navy', 'white')).toBe(16.01);
  });

  it('returns 21 for rgb(0, 0, 0) vs #fff', () => {
    expect(contrastRatio('rgb(0, 0, 0)', '#fff')).toBe(21);
  });

  it('returns same ratio for hsl red as hex red vs white', () => {
    expect(contrastRatio('hsl(0, 100%, 50%)', '#fff')).toBe(
      contrastRatio('#ff0000', '#fff'),
    );
  });

  it('returns 21 for hsl black vs white', () => {
    expect(contrastRatio('hsl(0, 0%, 0%)', '#ffffff')).toBe(21);
  });

  it('returns same ratio for hwb red as hex red vs white', () => {
    expect(contrastRatio('hwb(0 0% 0%)', '#fff')).toBe(
      contrastRatio('#ff0000', '#fff'),
    );
  });

  it('returns 21 for hwb black vs white', () => {
    expect(contrastRatio('hwb(0 0% 100%)', '#ffffff')).toBe(21);
  });

  it('returns 21 for oklch black vs white', () => {
    expect(contrastRatio('oklch(0 0 0)', '#ffffff')).toBe(21);
  });

  it('returns 21 for lab black vs white', () => {
    expect(contrastRatio('lab(0 0 0)', '#ffffff')).toBe(21);
  });

  it('returns 21 for oklab black vs white', () => {
    expect(contrastRatio('oklab(0 0 0)', '#ffffff')).toBe(21);
  });

  it('returns 21 for lch black vs white', () => {
    expect(contrastRatio('lch(0 0 0)', '#ffffff')).toBe(21);
  });

  it('returns same ratio for oklch red as hex red vs white', () => {
    const hexRedRatio = contrastRatio('#ff0000', '#fff');
    // OKLCH red (sRGB red expressed in OKLCH, from Color.js 0.6.1)
    // After gamut mapping, should produce approximately the same ratio
    const oklchRatio = contrastRatio('oklch(0.6280 0.2577 29.23)', '#fff');
    expect(Math.abs(oklchRatio - hexRedRatio)).toBeLessThanOrEqual(0.01);
  });

  it('handles alpha compositing in the pipeline', () => {
    // Semi-transparent black over white should produce a lower ratio than opaque black
    const ratio = contrastRatio('#00000080', '#ffffff');
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });

  it('produces same ratio for equivalent LAB and LCH colors', () => {
    // lab(50 25 -25) = lch(50 35.3553 315)
    // C = hypot(25, 25) ≈ 35.3553, H = atan2(-25, 25) = -45° → 315°
    const labRatio = contrastRatio('lab(50 25 -25)', '#fff');
    const lchRatio = contrastRatio('lch(50 35.3553 315)', '#fff');
    expect(labRatio).toBe(lchRatio);
  });
});

describe('validateColors', () => {
  it('returns empty array when both colors are valid', () => {
    expect(validateColors('#000', '#fff')).toEqual([]);
  });

  it('returns one error when only foreground is invalid', () => {
    const errors = validateColors('not-a-color', '#fff');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('not-a-color');
  });

  it('returns one error when only background is invalid', () => {
    const errors = validateColors('#000', 'not-a-color');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('not-a-color');
  });

  it('returns two errors when both colors are invalid', () => {
    const errors = validateColors('#gg0000', '#zz0000');
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('#gg0000');
    expect(errors[1]).toContain('#zz0000');
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

  it('evaluates HSL input correctly', () => {
    expect(checkContrast('hsl(0, 0%, 0%)', 'hsl(0, 0%, 100%)')).toEqual({
      ratio: 21,
      normalText: 'AAA',
      largeText: 'AAA',
    });
  });

  it('evaluates HWB input correctly', () => {
    expect(checkContrast('hwb(0 0% 100%)', 'hwb(0 100% 0%)')).toEqual({
      ratio: 21,
      normalText: 'AAA',
      largeText: 'AAA',
    });
  });

  it('evaluates OKLCH input correctly', () => {
    expect(checkContrast('oklch(0 0 0)', 'oklch(1 0 0)')).toEqual({
      ratio: 21,
      normalText: 'AAA',
      largeText: 'AAA',
    });
  });
});

describe('checkContrastVerbose', () => {
  it('returns format traces for hex colors', () => {
    const verbose = checkContrastVerbose('#000', '#fff');
    expect(verbose.foreground.format).toBe('hex');
    expect(verbose.background.format).toBe('hex');
    expect(verbose.foreground.input).toBe('#000');
    expect(verbose.background.input).toBe('#fff');
    expect(verbose.result.ratio).toBe(21);
  });

  it('returns format traces for named colors', () => {
    const verbose = checkContrastVerbose('black', 'white');
    expect(verbose.foreground.format).toBe('named');
    expect(verbose.background.format).toBe('named');
  });

  it('returns format trace for OKLCH', () => {
    const verbose = checkContrastVerbose('oklch(0.6 0.15 50)', 'white');
    expect(verbose.foreground.format).toBe('oklch');
    expect(verbose.foreground.parsed.space).toBe('oklch');
    expect(verbose.foreground.srgb.space).toBe('srgb');
    expect(verbose.background.format).toBe('named');
  });

  it('detects alpha compositing when foreground has alpha', () => {
    const verbose = checkContrastVerbose('#00000080', '#ffffff');
    expect(verbose.alphaComposited).toBe(true);
  });

  it('detects no alpha compositing when both opaque', () => {
    const verbose = checkContrastVerbose('#000', '#fff');
    expect(verbose.alphaComposited).toBe(false);
  });

  it('includes luminance values', () => {
    const verbose = checkContrastVerbose('#000', '#fff');
    expect(verbose.fgLuminance).toBe(0);
    expect(verbose.bgLuminance).toBe(1);
  });

  it('result matches checkContrast', () => {
    const verbose = checkContrastVerbose('#333', '#fff');
    const result = checkContrast('#333', '#fff');
    expect(verbose.result).toEqual(result);
  });

  it('throws for invalid color', () => {
    expect(() => checkContrastVerbose('not-a-color', '#fff')).toThrow(
      'Invalid color: "not-a-color"',
    );
  });
});
