import type { LABColor, XYZColor } from '../types';

/**
 * Convert a LABColor to XYZ-D65.
 *
 * 1. LAB → XYZ-D50 via piecewise inverse (cube root / linear)
 * 2. XYZ-D50 → XYZ-D65 via Bradford chromatic adaptation matrix
 *
 * Constants from CSS Color Level 4 reference implementation:
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 * @see https://www.w3.org/TR/css-color-4/#lab-to-predefined
 */

// CIE LAB constants
const KAPPA = 24389 / 27; // ~903.296
const EPSILON = 216 / 24389; // ~0.008856

// D50 white point (CIE standard illuminant)
const D50_X = 0.3457 / 0.3585;
const D50_Y = 1;
const D50_Z = (1 - 0.3457 - 0.3585) / 0.3585;

// Bradford chromatic adaptation matrix: D50 → D65
// From CSS Color Level 4 reference implementation
const D50_TO_D65 = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
] as const;

export function labToXyz(color: LABColor): XYZColor {
  // Step 1: compute f values
  const fy = (color.l + 16) / 116;
  const fx = color.a / 500 + fy;
  const fz = fy - color.b / 200;

  // Step 2: piecewise inverse — recover XYZ-D50
  const xr = fx ** 3 > EPSILON ? fx ** 3 : (116 * fx - 16) / KAPPA;
  const yr =
    color.l > KAPPA * EPSILON ? ((color.l + 16) / 116) ** 3 : color.l / KAPPA;
  const zr = fz ** 3 > EPSILON ? fz ** 3 : (116 * fz - 16) / KAPPA;

  // Step 3: scale by D50 white point
  const xD50 = xr * D50_X;
  const yD50 = yr * D50_Y;
  const zD50 = zr * D50_Z;

  // Step 4: Bradford D50 → D65
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = D50_TO_D65;

  return {
    x: m00 * xD50 + m01 * yD50 + m02 * zD50,
    y: m10 * xD50 + m11 * yD50 + m12 * zD50,
    z: m20 * xD50 + m21 * yD50 + m22 * zD50,
  };
}
