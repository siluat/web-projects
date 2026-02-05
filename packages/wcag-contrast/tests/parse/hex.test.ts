import { describe, expect, it } from 'vitest';
import { parseHex } from '../../src/parse/hex';

describe('parseHex', () => {
  describe('3-digit hex', () => {
    it('should parse #fff to white', () => {
      expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse #000 to black', () => {
      expect(parseHex('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse #f00 to red', () => {
      expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should be case insensitive', () => {
      expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseHex('#AbC')).toEqual({ r: 170, g: 187, b: 204 });
    });
  });

  describe('4-digit hex (with alpha)', () => {
    it('should parse #fff0 with alpha 0', () => {
      const result = parseHex('#fff0');
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 0 });
    });

    it('should parse #ffff with alpha 1', () => {
      const result = parseHex('#ffff');
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('should parse #f008 with alpha ~0.53', () => {
      const result = parseHex('#f008');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBeCloseTo(0.533, 2);
    });
  });

  describe('6-digit hex', () => {
    it('should parse #ffffff to white', () => {
      expect(parseHex('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse #000000 to black', () => {
      expect(parseHex('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse #ff0000 to red', () => {
      expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse mixed case', () => {
      expect(parseHex('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseHex('#aAbBcC')).toEqual({ r: 170, g: 187, b: 204 });
    });
  });

  describe('8-digit hex (with alpha)', () => {
    it('should parse #ff000080 with alpha ~0.5', () => {
      const result = parseHex('#ff000080');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBeCloseTo(0.502, 2);
    });

    it('should parse #ffffff00 with alpha 0', () => {
      expect(parseHex('#ffffff00')).toEqual({ r: 255, g: 255, b: 255, a: 0 });
    });

    it('should parse #ffffffff with alpha 1', () => {
      expect(parseHex('#ffffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });
  });

  describe('invalid inputs', () => {
    it('should return null for missing #', () => {
      expect(parseHex('fff')).toBeNull();
      expect(parseHex('ffffff')).toBeNull();
    });

    it('should return null for invalid length', () => {
      expect(parseHex('#f')).toBeNull();
      expect(parseHex('#ff')).toBeNull();
      expect(parseHex('#fffff')).toBeNull();
      expect(parseHex('#fffffff')).toBeNull();
      expect(parseHex('#fffffffff')).toBeNull();
    });

    it('should return null for invalid characters', () => {
      expect(parseHex('#gggggg')).toBeNull();
      expect(parseHex('#xyz')).toBeNull();
      expect(parseHex('#12345g')).toBeNull();
    });

    it('should return null for empty or whitespace', () => {
      expect(parseHex('')).toBeNull();
      expect(parseHex('   ')).toBeNull();
    });

    it('should handle whitespace around valid hex', () => {
      expect(parseHex('  #fff  ')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });
});
