import { describe, expect, it } from 'vitest';
import { parseColor } from '../../src/parse';

describe('parseColor', () => {
  describe('hex colors', () => {
    it('should parse #fff', () => {
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse #ff0000', () => {
      expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse #ff000080', () => {
      const result = parseColor('#ff000080');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
      expect(result?.a).toBeCloseTo(0.502, 2);
    });
  });

  describe('rgb colors', () => {
    it('should parse rgb(255, 128, 0)', () => {
      expect(parseColor('rgb(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse rgba(255, 0, 0, 0.5)', () => {
      expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      });
    });

    it('should parse rgb(100%, 50%, 0%)', () => {
      expect(parseColor('rgb(100%, 50%, 0%)')).toEqual({
        r: 255,
        g: 128,
        b: 0,
      });
    });
  });

  describe('hsl colors', () => {
    it('should parse hsl(0, 100%, 50%)', () => {
      const result = parseColor('hsl(0, 100%, 50%)');
      expect(result?.r).toBe(255);
      expect(result?.g).toBe(0);
      expect(result?.b).toBe(0);
    });

    it('should parse hsl(120, 100%, 50%)', () => {
      const result = parseColor('hsl(120, 100%, 50%)');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(0);
    });

    it('should parse hsl(0.5turn 100% 50%)', () => {
      const result = parseColor('hsl(0.5turn 100% 50%)');
      expect(result?.r).toBe(0);
      expect(result?.g).toBe(255);
      expect(result?.b).toBe(255);
    });
  });

  describe('named colors', () => {
    it('should parse red', () => {
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse RED (case insensitive)', () => {
      expect(parseColor('RED')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse transparent', () => {
      expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    });

    it('should parse rebeccapurple', () => {
      expect(parseColor('rebeccapurple')).toEqual({ r: 102, g: 51, b: 153 });
    });
  });

  describe('invalid inputs', () => {
    it('should return null for invalid color', () => {
      expect(parseColor('invalid')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseColor('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(parseColor('   ')).toBeNull();
    });

    it('should return null for null-like input', () => {
      expect(parseColor(null as unknown as string)).toBeNull();
      expect(parseColor(undefined as unknown as string)).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(parseColor(123 as unknown as string)).toBeNull();
      expect(parseColor({} as unknown as string)).toBeNull();
    });
  });

  describe('parser priority', () => {
    // hex takes priority, but these don't conflict in practice
    it('should prefer hex over named when input starts with #', () => {
      // #abc is valid hex
      expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });
  });
});
