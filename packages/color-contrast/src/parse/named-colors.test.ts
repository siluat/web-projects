import { describe, expect, it } from 'bun:test';
import { parseNamedColor } from './named-colors';

describe('parseNamedColor', () => {
  it('parses black (0, 0, 0)', () => {
    expect(parseNamedColor('black')).toEqual({
      space: 'srgb',
      r: 0,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('parses white (255, 255, 255)', () => {
    expect(parseNamedColor('white')).toEqual({
      space: 'srgb',
      r: 1,
      g: 1,
      b: 1,
      alpha: 1,
    });
  });

  it('parses red (255, 0, 0)', () => {
    expect(parseNamedColor('red')).toEqual({
      space: 'srgb',
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    });
  });

  it('parses navy (0, 0, 128)', () => {
    expect(parseNamedColor('navy')).toEqual({
      space: 'srgb',
      r: 0,
      g: 0,
      b: 128 / 255,
      alpha: 1,
    });
  });

  it('parses rebeccapurple (102, 51, 153)', () => {
    expect(parseNamedColor('rebeccapurple')).toEqual({
      space: 'srgb',
      r: 102 / 255,
      g: 51 / 255,
      b: 153 / 255,
      alpha: 1,
    });
  });

  it('parses transparent with alpha 0', () => {
    expect(parseNamedColor('transparent')).toEqual({
      space: 'srgb',
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    });
  });

  it('is case-insensitive', () => {
    const expected = {
      space: 'srgb' as const,
      r: 1,
      g: 0,
      b: 0,
      alpha: 1,
    };
    expect(parseNamedColor('Red')).toEqual(expected);
    expect(parseNamedColor('RED')).toEqual(expected);
    expect(parseNamedColor('rEd')).toEqual(expected);
  });

  it('returns null for unknown color names', () => {
    expect(parseNamedColor('notacolor')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseNamedColor('')).toBeNull();
  });

  it('returns null for hex-format strings', () => {
    expect(parseNamedColor('#ff0000')).toBeNull();
  });
});
