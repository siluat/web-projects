import type { LinearRGB, XYZColor } from '../types';

/**
 * Convert XYZ-D65 to linear-light sRGB.
 *
 * Single 3×3 matrix multiplication. Uses exact rational fractions from
 * the CSS Color Level 4 specification for maximum precision.
 *
 * Note: output values may fall outside [0, 1] for colors beyond the
 * sRGB gamut. This is intentional — gamut mapping (PR 12) handles clamping.
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 */

// XYZ-D65 → linear sRGB matrix (exact rational fractions from spec)
const XYZ_TO_LINEAR_SRGB = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667],
] as const;

export function xyzToLinearRgb(xyz: XYZColor): LinearRGB {
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] =
    XYZ_TO_LINEAR_SRGB;

  return {
    r: m00 * xyz.x + m01 * xyz.y + m02 * xyz.z,
    g: m10 * xyz.x + m11 * xyz.y + m12 * xyz.z,
    b: m20 * xyz.x + m21 * xyz.y + m22 * xyz.z,
  };
}
