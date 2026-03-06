import { describe, expect, it } from 'bun:test';
import type { LCHColor } from '../types';
import { lchToLab } from './lch-to-lab';

function lch(l: number, c: number, h: number, alpha = 1): LCHColor {
  return { space: 'lch', l, c, h, alpha };
}

describe('lchToLab', () => {
  // Reference: polar-to-cartesian identity
  // a = C * cos(H * pi/180), b = C * sin(H * pi/180)

  describe('cardinal angles', () => {
    it('converts H=0 -> a=C, b=0', () => {
      const result = lchToLab(lch(50, 40, 0));
      expect(result.a).toBeCloseTo(40, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });

    it('converts H=90 -> a=0, b=C', () => {
      const result = lchToLab(lch(50, 40, 90));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(40, 10);
    });

    it('converts H=180 -> a=-C, b=0', () => {
      const result = lchToLab(lch(50, 40, 180));
      expect(result.a).toBeCloseTo(-40, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });

    it('converts H=270 -> a=0, b=-C', () => {
      const result = lchToLab(lch(50, 40, 270));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(-40, 10);
    });
  });

  describe('zero chroma', () => {
    it('converts C=0 -> a=0, b=0 regardless of hue', () => {
      const result = lchToLab(lch(75, 0, 123));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });
  });

  describe('L passthrough', () => {
    it('preserves L value', () => {
      const result = lchToLab(lch(62.5, 30, 45));
      expect(result.l).toBe(62.5);
    });
  });

  describe('alpha passthrough', () => {
    it('preserves alpha value', () => {
      const result = lchToLab(lch(50, 40, 0, 0.7));
      expect(result.alpha).toBe(0.7);
    });

    it('preserves alpha = 0', () => {
      const result = lchToLab(lch(50, 40, 0, 0));
      expect(result.alpha).toBe(0);
    });
  });

  describe('space tag', () => {
    it('outputs space: "lab"', () => {
      const result = lchToLab(lch(50, 40, 0));
      expect(result.space).toBe('lab');
    });
  });
});
