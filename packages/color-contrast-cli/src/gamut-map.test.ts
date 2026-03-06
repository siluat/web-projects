import { describe, expect, it } from 'bun:test';
import { gamutMapOklch } from './gamut-map';
import type { OKLCHColor } from './types';

function oklch(l: number, c: number, h: number, alpha = 1): OKLCHColor {
  return { space: 'oklch', l, c, h, alpha };
}

describe('gamutMapOklch', () => {
  describe('lightness extremes', () => {
    it('returns white for L >= 1', () => {
      const result = gamutMapOklch(oklch(1, 0.2, 150));
      expect(result).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });

    it('returns black for L <= 0', () => {
      const result = gamutMapOklch(oklch(0, 0.3, 200));
      expect(result).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('returns black for negative L', () => {
      const result = gamutMapOklch(oklch(-0.5, 0.1, 100));
      expect(result).toEqual({
        space: 'srgb',
        r: 0,
        g: 0,
        b: 0,
        alpha: 1,
      });
    });

    it('returns white for L > 1', () => {
      const result = gamutMapOklch(oklch(1.5, 0.1, 100));
      expect(result).toEqual({
        space: 'srgb',
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
    });
  });

  describe('in-gamut passthrough', () => {
    it('preserves sRGB red (oklch approximation)', () => {
      // sRGB red ≈ oklch(0.6279, 0.2577, 29.23)
      // Reference: CSS Color Level 4 conversions
      const result = gamutMapOklch(oklch(0.6279, 0.2577, 29.23));
      expect(result.r).toBeCloseTo(1, 2);
      expect(result.g).toBeCloseTo(0, 2);
      expect(result.b).toBeCloseTo(0, 2);
    });

    it('preserves sRGB green (oklch approximation)', () => {
      // sRGB green (#00ff00) ≈ oklch(0.8664, 0.2948, 142.50)
      const result = gamutMapOklch(oklch(0.8664, 0.2948, 142.5));
      expect(result.r).toBeCloseTo(0, 2);
      expect(result.g).toBeCloseTo(1, 2);
      expect(result.b).toBeCloseTo(0, 2);
    });

    it('preserves sRGB blue (oklch approximation)', () => {
      // sRGB blue (#0000ff) ≈ oklch(0.4520, 0.3132, 264.05)
      const result = gamutMapOklch(oklch(0.452, 0.3132, 264.05));
      expect(result.r).toBeCloseTo(0, 2);
      expect(result.g).toBeCloseTo(0, 2);
      expect(result.b).toBeCloseTo(1, 2);
    });
  });

  describe('achromatic (C=0)', () => {
    it('produces neutral gray for mid-lightness', () => {
      // Color.js reference: srgb(0.3886, 0.3886, 0.3886) = rgb(99, 99, 99)
      const result = gamutMapOklch(oklch(0.5, 0, 0));
      expect(result.r).toBeCloseTo(0.3886, 4);
      expect(result.g).toBeCloseTo(0.3886, 4);
      expect(result.b).toBeCloseTo(0.3886, 4);
    });

    it('handles NaN hue with C=0', () => {
      const result = gamutMapOklch(oklch(0.5, 0, Number.NaN));
      expect(result.space).toBe('srgb');
      expect(result.r).toBeCloseTo(result.g, 4);
      expect(result.g).toBeCloseTo(result.b, 4);
    });
  });

  describe('out-of-gamut colors', () => {
    // Reference values verified against Color.js 0.6.1 (colorjs.io),
    // the CSS Color Level 4 co-editor's (Lea Verou) reference implementation.
    // Precision 2 (±0.005): the binary search converges within deltaEOK < 0.02
    // (JND), so sRGB channel values may differ by ~0.003 between implementations.

    it('maps oklch(0.9, 0.4, 150) to bright green', () => {
      // Color.js reference: srgb(0.2568, 1.0000, 0.5282) = rgb(65, 255, 135)
      const result = gamutMapOklch(oklch(0.9, 0.4, 150));
      expect(result.r).toBeCloseTo(0.2568, 2);
      expect(result.g).toBeCloseTo(1.0, 2);
      expect(result.b).toBeCloseTo(0.5282, 2);
    });

    it('maps oklch(0.7, 0.35, 328) to fuchsia', () => {
      // Color.js reference: srgb(1.0000, 0.0000, 1.0000) = rgb(255, 0, 255)
      // Chroma 0.35 is just above the sRGB boundary (~0.322 for this hue/lightness),
      // so the clipped result is essentially on the boundary.
      const result = gamutMapOklch(oklch(0.7, 0.35, 328));
      expect(result.r).toBeCloseTo(1.0, 2);
      expect(result.g).toBeCloseTo(0.0, 2);
      expect(result.b).toBeCloseTo(1.0, 2);
    });

    it('maps oklch(0.5, 0.4, 270) to saturated blue', () => {
      // Color.js reference: srgb(0.2058, 0.1463, 1.0000) = rgb(52, 37, 255)
      const result = gamutMapOklch(oklch(0.5, 0.4, 270));
      expect(result.r).toBeCloseTo(0.2058, 2);
      expect(result.g).toBeCloseTo(0.1463, 2);
      expect(result.b).toBeCloseTo(1.0, 2);
    });
  });

  describe('initial clip early return', () => {
    it('returns clipped result for barely-out-of-gamut color', () => {
      // oklch(0.5, 0.17, 0) is just barely outside sRGB gamut.
      // Naive clipping produces a result within JND (deltaEOK < 0.02)
      // of the original, so the algorithm returns early at lines 172-174
      // without entering the binary search loop.
      const result = gamutMapOklch(oklch(0.5, 0.17, 0));
      expect(result.space).toBe('srgb');
      // All channels should be in [0, 1]
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(1);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(1);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(1);
    });
  });

  describe('alpha preservation', () => {
    it('preserves alpha for in-gamut color', () => {
      const result = gamutMapOklch(oklch(0.5, 0.1, 180, 0.5));
      expect(result.alpha).toBe(0.5);
    });

    it('preserves alpha for out-of-gamut color', () => {
      const result = gamutMapOklch(oklch(0.9, 0.4, 150, 0.75));
      expect(result.alpha).toBe(0.75);
    });

    it('preserves alpha for lightness extreme', () => {
      const result = gamutMapOklch(oklch(0, 0.3, 200, 0.3));
      expect(result.alpha).toBe(0.3);
    });
  });

  describe('output contract', () => {
    it('returns space "srgb"', () => {
      const result = gamutMapOklch(oklch(0.7, 0.2, 90));
      expect(result.space).toBe('srgb');
    });

    it('all channels are in [0, 1] for out-of-gamut input', () => {
      // Test several extreme colors
      const extremes = [
        oklch(0.9, 0.4, 150),
        oklch(0.5, 0.4, 270),
        oklch(0.7, 0.35, 328),
        oklch(0.3, 0.3, 30),
        oklch(0.95, 0.3, 90),
      ];
      for (const color of extremes) {
        const result = gamutMapOklch(color);
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(1);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(1);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(1);
      }
    });
  });
});
