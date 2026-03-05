import { describe, expect, it } from 'bun:test';
import { parseColor } from './index';

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
    expect(parseColor('lab(50% 0 0)')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('   ')).toBeNull();
  });
});
