import { describe, expect, it } from 'bun:test';
import { hwbToSrgb } from '../convert/hwb-to-srgb';
import type { SRGBColor } from '../types';
import { parseHex } from './hex';
import { parseHwb } from './hwb';

describe('parseHwb', () => {
  describe('space-separated syntax', () => {
    it('parses hwb(0 0% 0%)', () => {
      expect(parseHwb('hwb(0 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses hwb with alpha number: hwb(0 0% 0% / 0.5)', () => {
      expect(parseHwb('hwb(0 0% 0% / 0.5)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 0.5,
      });
    });

    it('parses hwb with alpha percentage: hwb(0 0% 0% / 50%)', () => {
      expect(parseHwb('hwb(0 0% 0% / 50%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('hue angle units', () => {
    it('parses deg unit: hwb(120deg 0% 0%)', () => {
      expect(parseHwb('hwb(120deg 0% 0%)')).toEqual({
        space: 'hwb',
        h: 120 / 360,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses rad unit: hwb(3.14159rad 0% 0%)', () => {
      const result = parseHwb('hwb(3.14159rad 0% 0%)');
      expect(result?.h).toBeCloseTo(0.5, 4);
      expect(result?.w).toBe(0);
      expect(result?.b).toBe(0);
    });

    it('parses grad unit: hwb(400grad 0% 0%)', () => {
      expect(parseHwb('hwb(400grad 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses turn unit: hwb(0.5turn 0% 0%)', () => {
      expect(parseHwb('hwb(0.5turn 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0.5,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('hue wrapping', () => {
    it('wraps 370 to 10 degrees', () => {
      expect(parseHwb('hwb(370 0% 0%)')?.h).toBeCloseTo(10 / 360, 10);
    });

    it('wraps -10 to 350 degrees', () => {
      expect(parseHwb('hwb(-10 0% 0%)')?.h).toBeCloseTo(350 / 360, 10);
    });

    it('wraps 720 to 0 degrees', () => {
      expect(parseHwb('hwb(720 0% 0%)')?.h).toBe(0);
    });

    it('wraps 360 to 0 degrees', () => {
      expect(parseHwb('hwb(360 0% 0%)')?.h).toBe(0);
    });
  });

  describe('out-of-range clamping', () => {
    it('clamps whiteness above 100%', () => {
      expect(parseHwb('hwb(0 150% 0%)')?.w).toBe(1);
    });

    it('clamps whiteness below 0%', () => {
      expect(parseHwb('hwb(0 -10% 0%)')?.w).toBe(0);
    });

    it('clamps blackness above 100%', () => {
      expect(parseHwb('hwb(0 0% 150%)')?.b).toBe(1);
    });

    it('clamps blackness below 0%', () => {
      expect(parseHwb('hwb(0 0% -10%)')?.b).toBe(0);
    });

    it('clamps alpha above 1', () => {
      expect(parseHwb('hwb(0 0% 0% / 1.5)')?.alpha).toBe(1);
    });

    it('clamps alpha below 0', () => {
      expect(parseHwb('hwb(0 0% 0% / -0.5)')?.alpha).toBe(0);
    });
  });

  describe('case insensitivity', () => {
    it('parses HWB(0 0% 0%)', () => {
      expect(parseHwb('HWB(0 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses Hwb(0 0% 0%)', () => {
      expect(parseHwb('Hwb(0 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses hwb(120DEG 0% 0%)', () => {
      expect(parseHwb('hwb(120DEG 0% 0%)')).toEqual({
        space: 'hwb',
        h: 120 / 360,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('whitespace tolerance', () => {
    it('handles extra internal whitespace', () => {
      expect(parseHwb('hwb(  0  0%  0%  )')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('handles whitespace around slash', () => {
      expect(parseHwb('hwb(0 0% 0%  /  0.5)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0,
        b: 0,
        alpha: 0.5,
      });
    });
  });

  describe('edge cases', () => {
    it('parses 50% gray: hwb(0 50% 50%)', () => {
      expect(parseHwb('hwb(0 50% 50%)')).toEqual({
        space: 'hwb',
        h: 0,
        w: 0.5,
        b: 0.5,
        alpha: 1,
      });
    });

    it('parses shorthand decimal: hwb(.5turn 0% 0%)', () => {
      expect(parseHwb('hwb(.5turn 0% 0%)')).toEqual({
        space: 'hwb',
        h: 0.5,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('parses hue with leading + sign', () => {
      expect(parseHwb('hwb(+120 0% 0%)')).toEqual({
        space: 'hwb',
        h: 120 / 360,
        w: 0,
        b: 0,
        alpha: 1,
      });
    });
  });

  describe('cross-parser equivalence', () => {
    function convertToSrgb(input: string): SRGBColor | null {
      const parsed = parseHwb(input);
      if (parsed === null) return null;
      return hwbToSrgb(parsed);
    }

    it('hwb(0 0% 0%) converts to red (#ff0000)', () => {
      expect(convertToSrgb('hwb(0 0% 0%)')).toEqual(parseHex('#ff0000'));
    });

    it('hwb(120 0% 0%) converts to green (#00ff00)', () => {
      expect(convertToSrgb('hwb(120 0% 0%)')).toEqual(parseHex('#00ff00'));
    });

    it('hwb(0 100% 0%) converts to white (#ffffff)', () => {
      expect(convertToSrgb('hwb(0 100% 0%)')).toEqual(parseHex('#ffffff'));
    });

    it('hwb(0 0% 100%) converts to black (#000000)', () => {
      expect(convertToSrgb('hwb(0 0% 100%)')).toEqual(parseHex('#000000'));
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseHwb('')).toBeNull();
    });

    it('returns null for non-hwb function', () => {
      expect(parseHwb('rgb(255, 0, 0)')).toBeNull();
    });

    it('rejects hwba() — no legacy alias', () => {
      expect(parseHwb('hwba(0 0% 0%)')).toBeNull();
    });

    it('returns null for insufficient arguments', () => {
      expect(parseHwb('hwb(0 0%)')).toBeNull();
    });

    it('returns null for too many arguments', () => {
      expect(parseHwb('hwb(0 0% 0% 0% 0%)')).toBeNull();
    });

    it('returns null for whiteness without %', () => {
      expect(parseHwb('hwb(0 50 0%)')).toBeNull();
    });

    it('returns null for blackness without %', () => {
      expect(parseHwb('hwb(0 0% 50)')).toBeNull();
    });

    it('rejects comma syntax', () => {
      expect(parseHwb('hwb(0, 0%, 0%)')).toBeNull();
    });

    it('returns null for invalid tokens', () => {
      expect(parseHwb('hwb(abc 0% 0%)')).toBeNull();
    });

    it('returns null for empty function body', () => {
      expect(parseHwb('hwb()')).toBeNull();
    });

    it('returns null for hex string', () => {
      expect(parseHwb('#ff0000')).toBeNull();
    });

    it('returns null for invalid alpha', () => {
      expect(parseHwb('hwb(0 0% 0% / abc)')).toBeNull();
    });
  });
});
