import { describe, expect, it } from 'bun:test';
import type { HSLColor } from '../types';
import { hslToSrgb } from './hsl-to-srgb';

function hsl(h: number, s: number, l: number, alpha = 1): HSLColor {
  return { space: 'hsl', h: h / 360, s: s / 100, l: l / 100, alpha };
}

describe('hslToSrgb', () => {
  describe('primary colors', () => {
    it('converts red: hsl(0, 100%, 50%) -> (1, 0, 0)', () => {
      const result = hslToSrgb(hsl(0, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 0, b: 0, alpha: 1 });
    });

    it('converts green: hsl(120, 100%, 50%) -> (0, 1, 0)', () => {
      const result = hslToSrgb(hsl(120, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 1, b: 0, alpha: 1 });
    });

    it('converts blue: hsl(240, 100%, 50%) -> (0, 0, 1)', () => {
      const result = hslToSrgb(hsl(240, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 0, b: 1, alpha: 1 });
    });
  });

  describe('secondary colors', () => {
    it('converts yellow: hsl(60, 100%, 50%) -> (1, 1, 0)', () => {
      const result = hslToSrgb(hsl(60, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 1, b: 0, alpha: 1 });
    });

    it('converts cyan: hsl(180, 100%, 50%) -> (0, 1, 1)', () => {
      const result = hslToSrgb(hsl(180, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 1, b: 1, alpha: 1 });
    });

    it('converts magenta: hsl(300, 100%, 50%) -> (1, 0, 1)', () => {
      const result = hslToSrgb(hsl(300, 100, 50));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 0, b: 1, alpha: 1 });
    });
  });

  describe('achromatic colors', () => {
    it('converts black: hsl(0, 0%, 0%) -> (0, 0, 0)', () => {
      const result = hslToSrgb(hsl(0, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 0, b: 0, alpha: 1 });
    });

    it('converts white: hsl(0, 0%, 100%) -> (1, 1, 1)', () => {
      const result = hslToSrgb(hsl(0, 0, 100));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 1, b: 1, alpha: 1 });
    });

    it('converts 50% gray: hsl(0, 0%, 50%) -> (0.5, 0.5, 0.5)', () => {
      const result = hslToSrgb(hsl(0, 0, 50));
      expect(result).toEqual({
        space: 'srgb',
        r: 0.5,
        g: 0.5,
        b: 0.5,
        alpha: 1,
      });
    });
  });

  describe('alpha passthrough', () => {
    it('preserves alpha value', () => {
      const result = hslToSrgb(hsl(0, 100, 50, 0.5));
      expect(result.alpha).toBe(0.5);
    });

    it('preserves alpha = 0', () => {
      const result = hslToSrgb(hsl(0, 100, 50, 0));
      expect(result.alpha).toBe(0);
    });
  });

  describe('intermediate values', () => {
    it('converts hsl(210, 50%, 60%) -> approximately (0.4, 0.6, 0.8)', () => {
      const result = hslToSrgb(hsl(210, 50, 60));
      expect(result.r).toBeCloseTo(0.4, 10);
      expect(result.g).toBeCloseTo(0.6, 10);
      expect(result.b).toBeCloseTo(0.8, 10);
    });
  });
});
