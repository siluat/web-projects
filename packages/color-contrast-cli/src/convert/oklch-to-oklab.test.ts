import { describe, expect, it } from 'bun:test';
import type { OKLCHColor } from '../types';
import { oklchToOklab } from './oklch-to-oklab';

function oklch(l: number, c: number, h: number, alpha = 1): OKLCHColor {
  return { space: 'oklch', l, c, h, alpha };
}

describe('oklchToOklab', () => {
  // Reference: polar-to-cartesian identity
  // a = C * cos(H * pi/180), b = C * sin(H * pi/180)

  describe('cardinal angles', () => {
    it('converts H=0 -> a=C, b=0', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 0));
      expect(result.a).toBeCloseTo(0.2, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });

    it('converts H=90 -> a=0, b=C', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 90));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(0.2, 10);
    });

    it('converts H=180 -> a=-C, b=0', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 180));
      expect(result.a).toBeCloseTo(-0.2, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });

    it('converts H=270 -> a=0, b=-C', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 270));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(-0.2, 10);
    });
  });

  describe('zero chroma', () => {
    it('converts C=0 -> a=0, b=0 regardless of hue', () => {
      const result = oklchToOklab(oklch(0.75, 0, 123));
      expect(result.a).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });
  });

  describe('non-cardinal angle', () => {
    // oklch(0.5, 0.2, 45) -> a = 0.2 * cos(45°), b = 0.2 * sin(45°)
    // Pre-computed reference values (not formula — validates the implementation)
    it('converts H=45 correctly', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 45));
      expect(result.a).toBeCloseTo(0.14142135623730953, 10);
      expect(result.b).toBeCloseTo(0.1414213562373095, 10);
    });
  });

  describe('L passthrough', () => {
    it('preserves L value', () => {
      const result = oklchToOklab(oklch(0.8, 0.15, 45));
      expect(result.l).toBe(0.8);
    });
  });

  describe('alpha passthrough', () => {
    it('preserves alpha value', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 0, 0.7));
      expect(result.alpha).toBe(0.7);
    });

    it('preserves alpha = 0', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 0, 0));
      expect(result.alpha).toBe(0);
    });
  });

  describe('space tag', () => {
    it('outputs space: "oklab"', () => {
      const result = oklchToOklab(oklch(0.5, 0.2, 0));
      expect(result.space).toBe('oklab');
    });
  });
});
