import { describe, expect, it } from 'bun:test';
import type { OKLABColor } from '../types';
import { oklabToXyz } from './oklab-to-xyz';

function oklab(l: number, a: number, b: number, alpha = 1): OKLABColor {
  return { space: 'oklab', l, a, b, alpha };
}

describe('oklabToXyz', () => {
  // All reference values computed via CSS Color Level 4 conversions.js

  describe('black', () => {
    it('converts oklab(0, 0, 0) -> XYZ (0, 0, 0)', () => {
      const result = oklabToXyz(oklab(0, 0, 0));
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(0, 10);
      expect(result.z).toBeCloseTo(0, 10);
    });
  });

  describe('white', () => {
    // oklab(1, 0, 0) -> D65 white point
    // Reference: CSS Color Level 4 conversions.js
    it('converts oklab(1, 0, 0) -> approximately D65 white', () => {
      const result = oklabToXyz(oklab(1, 0, 0));
      expect(result.x).toBeCloseTo(0.9504559270516716, 10);
      expect(result.y).toBeCloseTo(1, 10);
      expect(result.z).toBeCloseTo(1.0890577507598784, 10);
    });
  });

  describe('sRGB red reference', () => {
    // Input: approximate sRGB red (#ff0000) in OKLAB
    // Expected: computed via OKLab_to_XYZ from CSS Color Level 4 conversions.js
    // using the same backward matrices (OKLAB_TO_LMS, LMS_TO_XYZ)
    it('converts sRGB red OKLAB to XYZ', () => {
      const result = oklabToXyz(oklab(0.6279554, 0.22486, 0.12585));
      expect(result.x).toBeCloseTo(0.4123892058024329, 10);
      expect(result.y).toBeCloseTo(0.21263936814047013, 10);
      expect(result.z).toBeCloseTo(0.019326566123772607, 10);
    });
  });

  describe('output type', () => {
    it('does not include alpha in output', () => {
      const result = oklabToXyz(oklab(0.5, 0.1, -0.1, 0.5));
      expect(result).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
        z: expect.any(Number),
      });
      expect('alpha' in result).toBe(false);
    });
  });
});
