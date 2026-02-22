import { describe, expect, it } from 'vitest';
import { parseHex } from './hex';

describe('parseHex', () => {
  describe('3-digit (#RGB)', () => {
    it('parses #000 as black', () => {
      expect(parseHex('#000')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses #fff as white', () => {
      expect(parseHex('#fff')).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });

    it('parses #f00 as red', () => {
      expect(parseHex('#f00')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('6-digit (#RRGGBB)', () => {
    it('parses #000000 as black', () => {
      expect(parseHex('#000000')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses #ffffff as white', () => {
      expect(parseHex('#ffffff')).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });

    it('parses #ff0000 as red', () => {
      expect(parseHex('#ff0000')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses #00ff00 as green', () => {
      expect(parseHex('#00ff00')).toEqual({
        space: 'srgb',
        r: 0,
        g: 1,
        b: 0,
        alpha: 1,
      });
    });

    it('parses #0000ff as blue', () => {
      expect(parseHex('#0000ff')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 1,
        alpha: 1,
      });
    });
  });

  describe('4-digit (#RGBA)', () => {
    it('parses #0000 as black with alpha 0', () => {
      expect(parseHex('#0000')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      });
    });

    it('parses #ffff as white with alpha 1', () => {
      expect(parseHex('#ffff')).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });

    it('parses #f008 with correct alpha', () => {
      const result = parseHex('#f008');
      expect(result).not.toBeNull();
      expect(result?.r).toBe(1);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      // 0x88 = 136, 136/255 ≈ 0.533
      expect(result?.alpha).toBeCloseTo(136 / 255, 10);
    });
  });

  describe('8-digit (#RRGGBBAA)', () => {
    it('parses #00000000 as black with alpha 0', () => {
      expect(parseHex('#00000000')).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      });
    });

    it('parses #ffffffff as white with alpha 1', () => {
      expect(parseHex('#ffffffff')).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });

    it('parses #ff000080 as red with ~50% alpha', () => {
      const result = parseHex('#ff000080');
      expect(result).not.toBeNull();
      expect(result?.r).toBe(1);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      // 0x80 = 128, 128/255 ≈ 0.502
      expect(result?.alpha).toBeCloseTo(128 / 255, 10);
    });
  });

  describe('case insensitivity', () => {
    it('parses uppercase #FF0000 same as #ff0000', () => {
      expect(parseHex('#FF0000')).toEqual(parseHex('#ff0000'));
    });

    it('parses mixed case #fF00Ff', () => {
      expect(parseHex('#fF00Ff')).toEqual({
        space: 'srgb',
        r: 1,
        g: 0,
        b: 1,
        alpha: 1,
      });
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseHex('')).toBeNull();
    });

    it('returns null without # prefix', () => {
      expect(parseHex('ff0000')).toBeNull();
    });

    it('returns null for wrong length', () => {
      expect(parseHex('#f')).toBeNull();
      expect(parseHex('#ff')).toBeNull();
      expect(parseHex('#fffff')).toBeNull();
      expect(parseHex('#fffffff')).toBeNull();
      expect(parseHex('#fffffffff')).toBeNull();
    });

    it('returns null for non-hex characters', () => {
      expect(parseHex('#xyz')).toBeNull();
      expect(parseHex('#gggggg')).toBeNull();
    });

    it('returns null for # alone', () => {
      expect(parseHex('#')).toBeNull();
    });
  });
});
