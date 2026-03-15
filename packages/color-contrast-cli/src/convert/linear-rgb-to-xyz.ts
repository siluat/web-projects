import type { LinearRGB, XYZColor } from '../types';

/**
 * Convert linear-light sRGB to XYZ-D65.
 *
 * Single 3×3 matrix multiplication. Uses exact rational fractions from
 * the CSS Color Level 4 specification for maximum precision.
 *
 * Inverse of {@link xyzToLinearRgb}.
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 */

// Linear sRGB → XYZ-D65 matrix (exact rational fractions from spec)
const LINEAR_SRGB_TO_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
] as const;

export function linearRgbToXyz(rgb: LinearRGB): XYZColor {
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] =
    LINEAR_SRGB_TO_XYZ;

  return {
    x: m00 * rgb.r + m01 * rgb.g + m02 * rgb.b,
    y: m10 * rgb.r + m11 * rgb.g + m12 * rgb.b,
    z: m20 * rgb.r + m21 * rgb.g + m22 * rgb.b,
  };
}
