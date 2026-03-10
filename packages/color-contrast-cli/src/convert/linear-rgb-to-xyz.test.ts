import { describe, expect, it } from 'bun:test';
import type { LinearRGB } from '../types';
import { linearRgbToXyz } from './linear-rgb-to-xyz';
import { xyzToLinearRgb } from './xyz-to-linear-rgb';

function rgb(r: number, g: number, b: number): LinearRGB {
  return { r, g, b };
}

describe('linearRgbToXyz', () => {
  // All reference values computed via CSS Color Level 4 conversions.js

  describe('origin', () => {
    it('converts linear RGB (0, 0, 0) -> XYZ (0, 0, 0)', () => {
      const result = linearRgbToXyz(rgb(0, 0, 0));
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(0, 10);
      expect(result.z).toBeCloseTo(0, 10);
    });
  });

  describe('D65 white point', () => {
    // Linear sRGB (1, 1, 1) should map to D65 white in XYZ
    // D65 ≈ (0.9504559270516716, 1, 1.0890577507598784)
    it('converts (1, 1, 1) -> D65 white', () => {
      const result = linearRgbToXyz(rgb(1, 1, 1));
      expect(result.x).toBeCloseTo(0.9504559270516716, 5);
      expect(result.y).toBeCloseTo(1, 5);
      expect(result.z).toBeCloseTo(1.0890577507598784, 5);
    });
  });

  describe('sRGB red', () => {
    // Linear sRGB red (1, 0, 0) -> XYZ-D65 of sRGB red
    // Reference values from xyz-to-linear-rgb.test.ts
    it('converts linear (1, 0, 0) to sRGB red XYZ', () => {
      const result = linearRgbToXyz(rgb(1, 0, 0));
      expect(result.x).toBeCloseTo(0.4123907992659595, 5);
      expect(result.y).toBeCloseTo(0.21263900587151027, 5);
      expect(result.z).toBeCloseTo(0.01933081871559182, 5);
    });
  });

  describe('round-trip', () => {
    it('xyzToLinearRgb(linearRgbToXyz(input)) ≈ input', () => {
      const input = rgb(0.5, 0.3, 0.8);
      const roundTripped = xyzToLinearRgb(linearRgbToXyz(input));
      expect(roundTripped.r).toBeCloseTo(input.r, 8);
      expect(roundTripped.g).toBeCloseTo(input.g, 8);
      expect(roundTripped.b).toBeCloseTo(input.b, 8);
    });
  });
});
