import { describe, expect, it } from 'bun:test';
import type { XYZColor } from '../types';
import { xyzToLinearRgb } from './xyz-to-linear-rgb';

function xyz(x: number, y: number, z: number): XYZColor {
  return { x, y, z };
}

describe('xyzToLinearRgb', () => {
  // All reference values computed via CSS Color Level 4 conversions.js

  describe('origin', () => {
    it('converts XYZ (0, 0, 0) -> linear RGB (0, 0, 0)', () => {
      const result = xyzToLinearRgb(xyz(0, 0, 0));
      expect(result.r).toBeCloseTo(0, 10);
      expect(result.g).toBeCloseTo(0, 10);
      expect(result.b).toBeCloseTo(0, 10);
    });
  });

  describe('D65 white point', () => {
    // D65 = (0.9504559270516716, 1, 1.0890577507598784)
    // Should map to approximately (1, 1, 1) in linear sRGB
    // Reference: CSS Color Level 4 conversions.js
    it('converts D65 white -> approximately (1, 1, 1)', () => {
      const result = xyzToLinearRgb(
        xyz(0.9504559270516716, 1, 1.0890577507598784),
      );
      expect(result.r).toBeCloseTo(1, 5);
      expect(result.g).toBeCloseTo(1, 5);
      expect(result.b).toBeCloseTo(1, 5);
    });
  });

  describe('no clamping', () => {
    // Out-of-gamut XYZ values should produce values outside [0,1]
    // without being clamped — gamut mapping is a separate concern
    it('preserves values outside [0, 1] range', () => {
      const result = xyzToLinearRgb(xyz(0.5, 0.8, 0.1));
      // At least one channel should be outside [0, 1] for this input
      const hasOutOfRange =
        result.r < 0 ||
        result.r > 1 ||
        result.g < 0 ||
        result.g > 1 ||
        result.b < 0 ||
        result.b > 1;
      expect(hasOutOfRange).toBe(true);
    });
  });

  describe('sRGB red', () => {
    // XYZ-D65 of sRGB red: (0.4123907992659595, 0.21263900587151027, 0.01933081871559182)
    // Should map to linear sRGB approximately (1, 0, 0)
    // Reference: CSS Color Level 4 conversions.js
    it('converts sRGB red XYZ to linear (1, 0, 0)', () => {
      const result = xyzToLinearRgb(
        xyz(0.4123907992659595, 0.21263900587151027, 0.01933081871559182),
      );
      expect(result.r).toBeCloseTo(1, 5);
      expect(result.g).toBeCloseTo(0, 5);
      expect(result.b).toBeCloseTo(0, 5);
    });
  });
});
