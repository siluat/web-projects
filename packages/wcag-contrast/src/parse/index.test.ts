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

  it('returns null for unsupported formats', () => {
    expect(parseColor('rgb(255, 0, 0)')).toBeNull();
    expect(parseColor('hsl(0, 100%, 50%)')).toBeNull();
    expect(parseColor('red')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('   ')).toBeNull();
  });
});
