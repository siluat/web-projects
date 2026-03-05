import { describe, expect, it } from 'bun:test';
import type { HWBColor } from '../types';
import { hwbToSrgb } from './hwb-to-srgb';

function hwb(h: number, w: number, b: number, alpha = 1): HWBColor {
  return { space: 'hwb', h: h / 360, w: w / 100, b: b / 100, alpha };
}

describe('hwbToSrgb', () => {
  describe('primary colors', () => {
    it('converts red: hwb(0, 0%, 0%) -> (1, 0, 0)', () => {
      const result = hwbToSrgb(hwb(0, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 0, b: 0, alpha: 1 });
    });

    it('converts green: hwb(120, 0%, 0%) -> (0, 1, 0)', () => {
      const result = hwbToSrgb(hwb(120, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 1, b: 0, alpha: 1 });
    });

    it('converts blue: hwb(240, 0%, 0%) -> (0, 0, 1)', () => {
      const result = hwbToSrgb(hwb(240, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 0, b: 1, alpha: 1 });
    });
  });

  describe('secondary colors', () => {
    it('converts yellow: hwb(60, 0%, 0%) -> (1, 1, 0)', () => {
      const result = hwbToSrgb(hwb(60, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 1, b: 0, alpha: 1 });
    });

    it('converts cyan: hwb(180, 0%, 0%) -> (0, 1, 1)', () => {
      const result = hwbToSrgb(hwb(180, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 1, b: 1, alpha: 1 });
    });

    it('converts magenta: hwb(300, 0%, 0%) -> (1, 0, 1)', () => {
      const result = hwbToSrgb(hwb(300, 0, 0));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 0, b: 1, alpha: 1 });
    });
  });

  describe('achromatic colors', () => {
    it('converts white: hwb(0, 100%, 0%) -> (1, 1, 1)', () => {
      const result = hwbToSrgb(hwb(0, 100, 0));
      expect(result).toEqual({ space: 'srgb', r: 1, g: 1, b: 1, alpha: 1 });
    });

    it('converts black: hwb(0, 0%, 100%) -> (0, 0, 0)', () => {
      const result = hwbToSrgb(hwb(0, 0, 100));
      expect(result).toEqual({ space: 'srgb', r: 0, g: 0, b: 0, alpha: 1 });
    });

    it('converts 50% gray: hwb(0, 50%, 50%) -> (0.5, 0.5, 0.5)', () => {
      // w + b = 1.0 >= 1, short-circuit: gray = 50 / (50 + 50) = 0.5
      const result = hwbToSrgb(hwb(0, 50, 50));
      expect(result).toEqual({
        space: 'srgb',
        r: 0.5,
        g: 0.5,
        b: 0.5,
        alpha: 1,
      });
    });
  });

  describe('w + b normalization (short-circuit path)', () => {
    it('hwb(0, 50%, 60%) -> achromatic gray = 50/110', () => {
      // w=0.5, b=0.6, sum=1.1 >= 1 -> gray = 0.5 / 1.1 ≈ 0.4545
      const result = hwbToSrgb(hwb(0, 50, 60));
      expect(result.r).toBeCloseTo(50 / 110, 10);
      expect(result.g).toBeCloseTo(50 / 110, 10);
      expect(result.b).toBeCloseTo(50 / 110, 10);
    });

    it('hwb(0, 100%, 100%) -> gray = 100/200 = 0.5', () => {
      // w=1.0, b=1.0, sum=2.0 >= 1 -> gray = 1.0 / 2.0 = 0.5
      const result = hwbToSrgb(hwb(0, 100, 100));
      expect(result).toEqual({
        space: 'srgb',
        r: 0.5,
        g: 0.5,
        b: 0.5,
        alpha: 1,
      });
    });

    it('hwb(0, 75%, 75%) -> gray = 75/150 = 0.5', () => {
      // w=0.75, b=0.75, sum=1.5 >= 1 -> gray = 0.75 / 1.5 = 0.5
      const result = hwbToSrgb(hwb(0, 75, 75));
      expect(result).toEqual({
        space: 'srgb',
        r: 0.5,
        g: 0.5,
        b: 0.5,
        alpha: 1,
      });
    });

    it('hwb(120, 80%, 40%) -> gray = 80/120 = 2/3', () => {
      // w=0.8, b=0.4, sum=1.2 >= 1 -> gray = 0.8 / 1.2 = 2/3 ≈ 0.6667
      const result = hwbToSrgb(hwb(120, 80, 40));
      expect(result.r).toBeCloseTo(2 / 3, 10);
      expect(result.g).toBeCloseTo(2 / 3, 10);
      expect(result.b).toBeCloseTo(2 / 3, 10);
    });
  });

  describe('alpha passthrough', () => {
    it('preserves alpha value', () => {
      const result = hwbToSrgb(hwb(0, 0, 0, 0.5));
      expect(result.alpha).toBe(0.5);
    });

    it('preserves alpha = 0', () => {
      const result = hwbToSrgb(hwb(0, 0, 0, 0));
      expect(result.alpha).toBe(0);
    });
  });

  describe('intermediate values', () => {
    it('converts hwb(0, 20%, 40%) -> red with whiteness and blackness', () => {
      // hue=red (1,0,0), scale = 1 - 0.2 - 0.4 = 0.4
      // r = 1*0.4 + 0.2 = 0.6, g = 0*0.4 + 0.2 = 0.2, b = 0*0.4 + 0.2 = 0.2
      const result = hwbToSrgb(hwb(0, 20, 40));
      expect(result.r).toBeCloseTo(0.6, 10);
      expect(result.g).toBeCloseTo(0.2, 10);
      expect(result.b).toBeCloseTo(0.2, 10);
    });
  });
});
