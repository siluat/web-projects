import { describe, expect, it } from 'bun:test';
import type { LABColor } from '../types';
import { labToXyz } from './lab-to-xyz';

function lab(l: number, a: number, b: number, alpha = 1): LABColor {
  return { space: 'lab', l, a, b, alpha };
}

describe('labToXyz', () => {
  // All reference values computed via CSS Color Level 4 conversions.js

  describe('black', () => {
    it('converts lab(0, 0, 0) -> XYZ (0, 0, 0)', () => {
      const result = labToXyz(lab(0, 0, 0));
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(0, 10);
      expect(result.z).toBeCloseTo(0, 10);
    });
  });

  describe('white', () => {
    // lab(100, 0, 0) -> D65 white point (0.9504559270516716, 1, 1.0890577507598784)
    // Reference: CSS Color Level 4 conversions.js D65 values
    it('converts lab(100, 0, 0) -> approximately D65 white', () => {
      const result = labToXyz(lab(100, 0, 0));
      expect(result.x).toBeCloseTo(0.9504559270516716, 10);
      expect(result.y).toBeCloseTo(1, 10);
      expect(result.z).toBeCloseTo(1.0890577507598784, 10);
    });
  });

  describe('threshold boundary', () => {
    // lab(8, 0, 0) is near the KAPPA*EPSILON boundary (~7.999625)
    // where the piecewise function switches from linear to cubic
    // Reference: CSS Color Level 4 conversions.js
    it('converts lab(8, 0, 0) correctly at piecewise boundary', () => {
      const result = labToXyz(lab(8, 0, 0));
      // L=8: yr = L/KAPPA = 8/903.296... = 0.008856...
      // This is near the epsilon boundary
      expect(result.y).toBeCloseTo(8 / (24389 / 27), 10);
    });
  });

  describe('mid gray', () => {
    // lab(50, 0, 0) -> achromatic, mid-lightness
    // Reference: CSS Color Level 4 conversions.js
    it('converts lab(50, 0, 0) to achromatic XYZ', () => {
      const result = labToXyz(lab(50, 0, 0));
      // L=50 achromatic: y = ((50+16)/116)^3 = 0.18418...
      const expectedY = ((50 + 16) / 116) ** 3;
      expect(result.y).toBeCloseTo(expectedY, 10);
      // x and z should be proportional to D65 white point
      expect(result.x).toBeCloseTo(0.9504559270516716 * expectedY, 8);
      expect(result.z).toBeCloseTo(1.0890577507598784 * expectedY, 8);
    });
  });

  describe('chromatic color', () => {
    // sRGB red (#ff0000) in CIE LAB: lab(54.29054294696968, 80.80492033462421, 69.89098825896274)
    // Expected XYZ-D65: computed via Lab_to_XYZ + D50_to_D65 from CSS Color Level 4 conversions.js
    // This test exercises the a/500 and b/200 offsets and Bradford off-diagonal entries
    it('converts sRGB red LAB to XYZ-D65', () => {
      const result = labToXyz(
        lab(54.29054294696968, 80.80492033462421, 69.89098825896274),
      );
      expect(result.x).toBeCloseTo(0.4123907939854999, 10);
      expect(result.y).toBeCloseTo(0.21263902042154395, 10);
      expect(result.z).toBeCloseTo(0.019330795799411108, 10);
    });
  });

  describe('output type', () => {
    it('does not include alpha in output', () => {
      const result = labToXyz(lab(50, 20, -30, 0.5));
      expect(result).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
        z: expect.any(Number),
      });
      expect('alpha' in result).toBe(false);
    });
  });
});
