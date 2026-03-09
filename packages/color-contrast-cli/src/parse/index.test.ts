import { describe, expect, it } from 'bun:test';
import { parseColor, parseColorDetailed } from './index';

describe('parseColor', () => {
  it('parses HEX color strings', () => {
    expect(parseColor('#ff0000')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('trims whitespace before parsing', () => {
    expect(parseColor('  #ff0000  ')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('parses named colors', () => {
    expect(parseColor('red')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('parses transparent', () => {
    expect(parseColor('transparent')).toEqual({
      space: 'srgb',
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    });
  });

  it('parses RGB functional notation', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('trims whitespace before parsing RGB', () => {
    expect(parseColor('  rgb(255 0 0)  ')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('parses HSL functional notation', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({
      space: 'hsl',
      h: 0,
      s: 1,
      l: 0.5,
      alpha: 1,
    });
  });

  it('trims whitespace before parsing HSL', () => {
    expect(parseColor('  hsl(120 100% 50%)  ')).toEqual({
      space: 'hsl',
      h: 120 / 360,
      s: 1,
      l: 0.5,
      alpha: 1,
    });
  });

  it('returns null for unsupported formats', () => {
    expect(parseColor('color(display-p3 1 0 0)')).toBeNull();
  });

  it('parses LAB functional notation', () => {
    expect(parseColor('lab(50 25 -25)')).toEqual({
      space: 'lab',
      l: 50,
      a: 25,
      b: -25,
      alpha: 1,
    });
  });

  it('parses LCH functional notation', () => {
    expect(parseColor('lch(50 30 120)')).toEqual({
      space: 'lch',
      l: 50,
      c: 30,
      h: 120,
      alpha: 1,
    });
  });

  it('parses OKLAB functional notation', () => {
    expect(parseColor('oklab(0.5 0.1 -0.1)')).toEqual({
      space: 'oklab',
      l: 0.5,
      a: 0.1,
      b: -0.1,
      alpha: 1,
    });
  });

  it('parses OKLCH functional notation', () => {
    expect(parseColor('oklch(0.6 0.15 50)')).toEqual({
      space: 'oklch',
      l: 0.6,
      c: 0.15,
      h: 50,
      alpha: 1,
    });
  });

  it('parses HWB functional notation', () => {
    expect(parseColor('hwb(0 0% 0%)')).toEqual({
      space: 'hwb',
      h: 0,
      w: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('trims whitespace before parsing HWB', () => {
    expect(parseColor('  hwb(120 0% 0%)  ')).toEqual({
      space: 'hwb',
      h: 120 / 360,
      w: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('returns null for empty string', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('   ')).toBeNull();
  });
});

describe('parseColorDetailed', () => {
  it('tags HEX format', () => {
    const detail = parseColorDetailed('#ff0000');
    expect(detail?.format).toBe('hex');
    expect(detail?.parsed.space).toBe('srgb');
  });

  it('tags named color format', () => {
    const detail = parseColorDetailed('red');
    expect(detail?.format).toBe('named');
  });

  it('tags transparent as named', () => {
    const detail = parseColorDetailed('transparent');
    expect(detail?.format).toBe('named');
  });

  it('tags RGB format', () => {
    const detail = parseColorDetailed('rgb(255, 0, 0)');
    expect(detail?.format).toBe('rgb');
  });

  it('tags HSL format', () => {
    const detail = parseColorDetailed('hsl(0, 100%, 50%)');
    expect(detail?.format).toBe('hsl');
  });

  it('tags HWB format', () => {
    const detail = parseColorDetailed('hwb(0 0% 0%)');
    expect(detail?.format).toBe('hwb');
  });

  it('tags LAB format', () => {
    const detail = parseColorDetailed('lab(50 25 -25)');
    expect(detail?.format).toBe('lab');
  });

  it('tags LCH format', () => {
    const detail = parseColorDetailed('lch(50 30 120)');
    expect(detail?.format).toBe('lch');
  });

  it('tags OKLAB format', () => {
    const detail = parseColorDetailed('oklab(0.5 0.1 -0.1)');
    expect(detail?.format).toBe('oklab');
  });

  it('tags OKLCH format', () => {
    const detail = parseColorDetailed('oklch(0.6 0.15 50)');
    expect(detail?.format).toBe('oklch');
  });

  it('returns null for invalid input', () => {
    expect(parseColorDetailed('not-a-color')).toBeNull();
  });

  it('trims whitespace', () => {
    const detail = parseColorDetailed('  #ff0000  ');
    expect(detail?.format).toBe('hex');
  });
});
