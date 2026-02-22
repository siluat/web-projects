import type { LinearRGB } from './types';

/**
 * WCAG 2.1 luminance coefficients (ITU-R BT.709).
 *
 * These weights reflect human perception — green contributes
 * the most to perceived brightness, blue the least.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
const COEFFICIENTS = {
  r: 0.2126,
  g: 0.7152,
  b: 0.0722,
} as const;

/**
 * Calculate the relative luminance of a linear-light RGB color.
 *
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * The input must already be in linear (gamma-decoded) space.
 * Returns a value in [0, 1] where 0 is darkest black and 1 is lightest white.
 */
export function relativeLuminance(color: LinearRGB): number {
  return (
    COEFFICIENTS.r * color.r +
    COEFFICIENTS.g * color.g +
    COEFFICIENTS.b * color.b
  );
}
