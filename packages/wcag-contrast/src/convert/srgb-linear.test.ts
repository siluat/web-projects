import { describe, expect, it } from 'vitest';
import { srgbChannelToLinear, srgbToLinear } from './srgb-linear';

describe('srgbChannelToLinear', () => {
  describe('boundary values', () => {
    it('returns 0 for channel = 0', () => {
      expect(srgbChannelToLinear(0)).toBe(0);
    });

    it('returns 1 for channel = 1', () => {
      expect(srgbChannelToLinear(1)).toBe(1);
    });
  });

  describe('threshold boundary', () => {
    it('uses linear formula at threshold (0.04045)', () => {
      expect(srgbChannelToLinear(0.04045)).toBeCloseTo(0.04045 / 12.92, 10);
    });

    it('uses power curve just above threshold (0.04046)', () => {
      expect(srgbChannelToLinear(0.04046)).toBeCloseTo(
        ((0.04046 + 0.055) / 1.055) ** 2.4,
        10,
      );
    });
  });

  describe('linear segment', () => {
    it('linearizes small value (0.01)', () => {
      expect(srgbChannelToLinear(0.01)).toBeCloseTo(0.01 / 12.92, 10);
    });
  });

  describe('power curve segment', () => {
    it('linearizes mid-range value (0.5)', () => {
      expect(srgbChannelToLinear(0.5)).toBeCloseTo(
        ((0.5 + 0.055) / 1.055) ** 2.4,
        10,
      );
    });

    it('linearizes 8-bit 128 (128/255)', () => {
      const channel = 128 / 255;
      // CSS Color 4 §10.2 sample code: sRGB 128/255 ≈ 0.2158605 in linear light
      expect(srgbChannelToLinear(channel)).toBeCloseTo(0.2158605, 5);
    });
  });
});

describe('srgbToLinear', () => {
  it('converts black to linear black', () => {
    expect(srgbToLinear({ r: 0, g: 0, b: 0 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
    });
  });

  it('converts white to linear white', () => {
    expect(srgbToLinear({ r: 1, g: 1, b: 1 })).toEqual({
      r: 1,
      g: 1,
      b: 1,
    });
  });

  it('linearizes each channel independently across both segments', () => {
    // r=0.01 falls in linear segment, g=0.5 and b=0.75 in power curve
    const result = srgbToLinear({ r: 0.01, g: 0.5, b: 0.75 });
    expect(result.r).toBeCloseTo(0.01 / 12.92, 10);
    expect(result.g).toBeCloseTo(((0.5 + 0.055) / 1.055) ** 2.4, 10);
    expect(result.b).toBeCloseTo(((0.75 + 0.055) / 1.055) ** 2.4, 10);
  });
});
