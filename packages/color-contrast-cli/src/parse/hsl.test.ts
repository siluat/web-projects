import { describe, expect, it } from 'bun:test';
import { hslToSrgb } from '../convert/hsl-to-srgb';
import type { SRGBColor } from '../types';
import { parseHex } from './hex';
import { parseHsl } from './hsl';

describe('parseHsl', () => {
  describe('space-separated syntax', () => {
    it('parses hsl(0 100% 50%)', () => {
      expect(parseHsl('hsl(0 100% 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses hsl with alpha number: hsl(0 100% 50% / 0.5)', () => {
      expect(parseHsl('hsl(0 100% 50% / 0.5)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });

    it('parses hsl with alpha percentage: hsl(0 100% 50% / 50%)', () => {
      expect(parseHsl('hsl(0 100% 50% / 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });
  });

  describe('comma-separated syntax', () => {
    it('parses hsl(0, 100%, 50%)', () => {
      expect(parseHsl('hsl(0, 100%, 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses hsl with alpha number: hsl(0, 100%, 50%, 0.5)', () => {
      expect(parseHsl('hsl(0, 100%, 50%, 0.5)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });
  });

  describe('hsla() alias', () => {
    it('parses hsla(0, 100%, 50%, 0.5)', () => {
      expect(parseHsl('hsla(0, 100%, 50%, 0.5)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });

    it('parses hsla(0 100% 50% / 0.5)', () => {
      expect(parseHsl('hsla(0 100% 50% / 0.5)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });
  });

  describe('hue angle units', () => {
    it('parses deg unit: hsl(120deg 100% 50%)', () => {
      expect(parseHsl('hsl(120deg 100% 50%)')).toEqual({
        space: 'hsl',
        h: 120 / 360,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses rad unit: hsl(3.14159rad 100% 50%)', () => {
      const result = parseHsl('hsl(3.14159rad 100% 50%)');
      expect(result?.h).toBeCloseTo(0.5, 4);
      expect(result?.s).toBe(1);
      expect(result?.l).toBe(0.5);
    });

    it('parses grad unit: hsl(400grad 100% 50%)', () => {
      expect(parseHsl('hsl(400grad 100% 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses turn unit: hsl(0.5turn 100% 50%)', () => {
      expect(parseHsl('hsl(0.5turn 100% 50%)')).toEqual({
        space: 'hsl',
        h: 0.5,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });
  });

  describe('hue wrapping', () => {
    it('wraps 370 to 10 degrees', () => {
      expect(parseHsl('hsl(370 100% 50%)')?.h).toBeCloseTo(10 / 360, 10);
    });

    it('wraps -10 to 350 degrees', () => {
      expect(parseHsl('hsl(-10 100% 50%)')?.h).toBeCloseTo(350 / 360, 10);
    });

    it('wraps 720 to 0 degrees', () => {
      expect(parseHsl('hsl(720 100% 50%)')?.h).toBe(0);
    });

    it('wraps 360 to 0 degrees', () => {
      expect(parseHsl('hsl(360 100% 50%)')?.h).toBe(0);
    });
  });

  describe('out-of-range clamping', () => {
    it('clamps saturation above 100%', () => {
      expect(parseHsl('hsl(0 150% 50%)')?.s).toBe(1);
    });

    it('clamps saturation below 0%', () => {
      expect(parseHsl('hsl(0 -10% 50%)')?.s).toBe(0);
    });

    it('clamps lightness above 100%', () => {
      expect(parseHsl('hsl(0 100% 150%)')?.l).toBe(1);
    });

    it('clamps lightness below 0%', () => {
      expect(parseHsl('hsl(0 100% -10%)')?.l).toBe(0);
    });

    it('clamps alpha above 1', () => {
      expect(parseHsl('hsl(0 100% 50% / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseHsl('hsl(0 100% 50% / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses HSL(0, 100%, 50%)', () => {
      expect(parseHsl('HSL(0, 100%, 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses Hsl(0, 100%, 50%)', () => {
      expect(parseHsl('Hsl(0, 100%, 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses hsl(120DEG 100% 50%)', () => {
      expect(parseHsl('hsl(120DEG 100% 50%)')).toEqual({
        space: 'hsl',
        h: 120 / 360,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseHsl('hsl(  0  100%  50%  )')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('handles whitespace around commas', () => {
      expect(parseHsl('hsl( 0 , 100% , 50% )')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseHsl('hsl(0 100% 50%  /  0.5)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 1,
        l: 0.5,
        alpha: 0.5,
      });
    });
  });

  describe('edge cases', () => {
    it('parses black: hsl(0 0% 0%)', () => {
      expect(parseHsl('hsl(0 0% 0%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 0,
        l: 0,
        alpha: 1,
      });
    });

    it('parses white: hsl(0 0% 100%)', () => {
      expect(parseHsl('hsl(0 0% 100%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 0,
        l: 1,
        alpha: 1,
      });
    });

    it('parses 50% gray: hsl(0 0% 50%)', () => {
      expect(parseHsl('hsl(0 0% 50%)')).toEqual({
        space: 'hsl',
        h: 0,
        s: 0,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses shorthand decimal: hsl(.5turn 100% 50%)', () => {
      expect(parseHsl('hsl(.5turn 100% 50%)')).toEqual({
        space: 'hsl',
        h: 0.5,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });

    it('parses hue with leading + sign', () => {
      expect(parseHsl('hsl(+120 100% 50%)')).toEqual({
        space: 'hsl',
        h: 120 / 360,
        s: 1,
        l: 0.5,
        alpha: 1,
      });
    });
  });

  describe('cross-parser equivalence', () => {
    function convertToSrgb(input: string): SRGBColor | null {
      const parsed = parseHsl(input);
      if (parsed === null) return null;
      return hslToSrgb(parsed);
    }

    it('hsl(0 100% 50%) converts to red (#ff0000)', () => {
      expect(convertToSrgb('hsl(0 100% 50%)')).toEqual(parseHex('#ff0000'));
    });

    it('hsl(120 100% 50%) converts to green (#00ff00)', () => {
      expect(convertToSrgb('hsl(120 100% 50%)')).toEqual(parseHex('#00ff00'));
    });

    it('hsl(0 0% 0%) converts to black (#000000)', () => {
      expect(convertToSrgb('hsl(0 0% 0%)')).toEqual(parseHex('#000000'));
    });

    it('hsl(0 0% 100%) converts to white (#ffffff)', () => {
      expect(convertToSrgb('hsl(0 0% 100%)')).toEqual(parseHex('#ffffff'));
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseHsl('')).toBeNull();
    });

    it('returns null for non-hsl function', () => {
      expect(parseHsl('rgb(255, 0, 0)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseHsl('hsl(0 100%)')).toBeNull();
    });

    it('returns null for too many arguments', () => {
      expect(parseHsl('hsl(0 100% 50% 50% 50%)')).toBeNull();
    });

    it('returns null for saturation without %', () => {
      expect(parseHsl('hsl(0 100 50%)')).toBeNull();
    });

    it('returns null for lightness without %', () => {
      expect(parseHsl('hsl(0 100% 50)')).toBeNull();
    });

    it('returns null for mixed comma + slash syntax', () => {
      expect(parseHsl('hsl(0, 100%, 50% / 0.5)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseHsl('hsl(abc 100% 50%)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseHsl('hsl()')).toBeNull();
    });

    it('returns null for hex string', () => {
      expect(parseHsl('#ff0000')).toBeNull();
    });

    it('returns null for invalid alpha in comma syntax', () => {
      expect(parseHsl('hsl(0, 100%, 50%, abc)')).toBeNull();
    });

    it('returns null for invalid alpha in space syntax', () => {
      expect(parseHsl('hsl(0 100% 50% / abc)')).toBeNull();
    });
  });
});
